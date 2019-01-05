import React, { Component } from 'react'
import './App.css'

import * as moment from 'moment'
import Plot from 'react-plotly.js'

import Paper from '@material-ui/core/Paper'

function fetchOandaEndpoint(url, accessToken) {
  return fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).then((result) => {
    return result.json()
  })
}

function getApiBase(env) {
  if(env === 'practice')
    return 'https://api-fxpractice.oanda.com'
  else if(env === 'live')
    return 'https://api-fxtrade.oanda.com'
}

function getAccountTransactions(account) {
  let url = `${getApiBase(account.env)}/v3/accounts/${account.accountId}/transactions`

  return fetchOandaEndpoint(url, account.accessToken)
    .then((jsonResult) => {
      return Promise.all(jsonResult.pages.map((pageUrl) => {
        return fetchOandaEndpoint(pageUrl, account.accessToken)
          .then((jsonResponse) => {
            return jsonResponse.transactions
          })
      }))
        .then((transactions) => {
          let flattenedTransactions = []
          transactions.forEach((result) => flattenedTransactions = flattenedTransactions.concat(result))

          return flattenedTransactions
        })
    })
}

function getAccountsTransactions(accounts) {
  return Promise.all(accounts.map((account) => {
    return getAccountTransactions(account)
  }))
    .then((transactions) => {
      let flattenedTransactions = []
      transactions.forEach((result) => flattenedTransactions = flattenedTransactions.concat(result))

      return flattenedTransactions
    })
}

function getAccountSummary(account) {
  let url = `${getApiBase(account.env)}/v3/accounts/${account.accountId}/summary`

  return fetchOandaEndpoint(url, account.accessToken)
}

function getAccountsSummary(accounts) {
  return Promise.all(accounts.map((account) => {
    return getAccountSummary(account)
  }))
}

class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null
    }

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
  }

  update() {
    return Promise.all([
      getAccountsTransactions(this.props.store.accessData)
      .then((transactions) => {
        let transactionsByDay = {}
        transactions.forEach((transaction) => {
          if(transaction.type === "ORDER_FILL") {
            let day = moment(transaction.time).format('YYYY-MM-DD')

            if(transactionsByDay[day] === undefined) transactionsByDay[day] = []
            transactionsByDay[day].push(+transaction.pl)
          }
        })

        let plByDay = {}
        Object.keys(transactionsByDay).sort().forEach(dayKey => {
          plByDay[dayKey] = transactionsByDay[dayKey].reduce((a, b) => a + b, 0)
        })

        let profitByDay = []
        Object.keys(transactionsByDay).forEach(dayKey => {
          profitByDay.push({
            x: dayKey,
            y: Math.round(plByDay[dayKey] * 100) / 100
          })
        })

        let cumulativeProfitByDay = []
        let lastTotalProfit = 0
        Object.keys(transactionsByDay).forEach(dayKey => {
          let y = lastTotalProfit + plByDay[dayKey]
          lastTotalProfit = y

          cumulativeProfitByDay.push({
            x: dayKey,
            y: Math.round(y * 100) / 100
          })
        })

        return {
          name: 'balance',
          profitByDay: profitByDay,
          cumulativeProfitByDay: cumulativeProfitByDay
        }
      }),
      getAccountsSummary(this.props.store.accessData)
        .then((summaries) => {
          return {
            name: 'nav',
            nav: Math.round(100 *
              summaries.map((summary) => +summary.account.pl + +summary.account.unrealizedPL).reduce((a, b) => a + b, 0)
            ) / 100
          }
        })
    ])
      .then((results) => {
        let finalResult = {}
        results.forEach((result) => {
          finalResult[result.name] = result
          delete finalResult[result.name].name
        })

        return finalResult
      })
      .then((result) => {
        this.setState(Object.assign(this.state, {
          data: [
            {
              name: 'Balance',
              x: result.balance.cumulativeProfitByDay.map((p) => p.x),
              y: result.balance.cumulativeProfitByDay.map((p) => p.y),
              mode: 'lines'
            },
            {
              name: 'NAV',
              line: {
                  color: 'rgb(0, 194, 0)'
              },
              x: [
                result.balance.cumulativeProfitByDay[result.balance.cumulativeProfitByDay.length - 2].x,
                result.balance.cumulativeProfitByDay[result.balance.cumulativeProfitByDay.length - 1].x
              ],
              y: [
                result.balance.cumulativeProfitByDay[result.balance.cumulativeProfitByDay.length - 2].y,
                result.nav.nav
              ]
            }
          ]
        }))

        document.title = this.props.store.name + ': ' + result.nav.nav
      })
  }

  makeUpdateInterval(updateIntevalSeconds) {
    clearInterval(this.updateInteval)
    if(updateIntevalSeconds !== 0) {
      this.updateInteval = setInterval(() => {
        this.update()
      }, 1000 * updateIntevalSeconds)
    }
  }

  componentWillReceiveProps(nextProps) {
    this.makeUpdateInterval(nextProps.updateIntevalSeconds)
  }

  componentDidMount() {
    this.update()
    this.makeUpdateInterval(this.props.updateIntevalSeconds)

    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions)
  }

  render() {
    return (
      <div style={{width: '100%', height: '100%'}}>
        {!this.state.data &&
          <div style={{textAlign: 'center', margin: '25px'}}>Loading...</div>
        }
        {this.state.data &&
          <Paper>
            <Plot
              data={this.state.data}
              layout={{
                autosize: true,
                title: this.props.store.name,
                height: this.state.windowHeight - 64,
                showlegend: false
              }}
              useResizeHandler={true}
              style={{width: '100%'}}
            />
          </Paper>
        }
      </div>
    )
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions)
    clearInterval(this.updateInteval)
  }

  updateWindowDimensions() {
    this.setState(Object.assign(this.state, {
      windowWidth: window.innerWidth, windowHeight: window.innerHeight
    }))
  }
}

export default Dashboard
