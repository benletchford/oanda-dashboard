import React, { Component } from 'react'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import ChevronRight from '@material-ui/icons/ChevronRight'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import Setup from './Setup'
import Dashboard from './Dashboard'

import { encodeObject, decodeObject } from './utils.js'

class App extends Component {
  constructor(props) {
    super(props)

    this.store = {
      accessData: [],
      name: ''
    }
    this.state = {
      page: 'setup',
      updateIntevalSeconds: 0
    }
  }

  componentWillMount() {
    if(window.location.hash) {
      this.store = decodeObject(window.location.hash.substring(1))
      this.setState(Object.assign(this.state, {
        page: 'dashboard',
        updateIntevalSeconds: this.store.updateIntevalSeconds || this.state.updateIntevalSeconds
      }))
    }
  }

  render() {
    return(
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">
              {this.state.page === 'setup' && 'Oanda Dashboard Setup'}
              {this.state.page === 'dashboard' && 'Oanda Dashboard'}
            </Typography>
            <div style={{flexGrow: 1}}></div>
            <div>
              {this.state.page === 'setup' && (
                <IconButton style={{color: 'white'}} onClick={(e) => {
                  let preventedDefault = false
                  for(let i=0;i<this.store.accessData.length;i++) {
                    if(!this.store.accessData[i].accessToken ||
                      !this.store.accessData[i].accountId ||
                      !this.store.accessData[i].env) {
                        e.preventDefault()
                        preventedDefault = true
                    }
                  }
                  if(!this.store.name) {
                    e.preventDefault()
                    preventedDefault = true
                  }

                  if(!preventedDefault) {
                    window.location.hash = encodeObject(this.store)
                    this.setState(Object.assign(this.state, {
                      page: 'dashboard'
                    }))
                  }
                }}>
                  <ChevronRight />
                </IconButton>
              )}
              {this.state.page === 'dashboard' && (
                <div>
                  <Select
                    value={this.state.updateIntevalSeconds}
                    onChange={(e) => {
                      this.store.updateIntevalSeconds = e.target.value
                      window.location.hash = encodeObject(this.store)

                      this.setState(Object.assign(this.state, {
                        updateIntevalSeconds: e.target.value
                      }))
                    }}
                  >
                    <MenuItem value={0}>Never</MenuItem>
                    <MenuItem value={5}>5 Seconds</MenuItem>
                    <MenuItem value={30}>30 Seconds</MenuItem>
                    <MenuItem value={60}>60 Seconds</MenuItem>
                    <MenuItem value={60*5}>5 Minutes</MenuItem>
                    <MenuItem value={60*15}>15 Minutes</MenuItem>
                    <MenuItem value={60*60}>1 Hour</MenuItem>
                  </Select>
                  <IconButton style={{color: 'white'}} onClick={() => {
                    this.setState(Object.assign(this.state, {
                      page: 'setup'
                    }))
                  }}>
                    <ChevronLeft />
                  </IconButton>
                </div>
              )}
            </div>
          </Toolbar>
        </AppBar>

        {this.state.page === 'setup' && <Setup store={this.store} />}
        {this.state.page === 'dashboard' && <Dashboard store={this.store} updateIntevalSeconds={this.state.updateIntevalSeconds} />}
      </div>
    )
  }
}

export default App
