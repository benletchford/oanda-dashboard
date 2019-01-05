import React, { Component } from 'react'

import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'

class Setup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: Object.keys(props.store.accessData).length || 1
    }
  }

  render() {
    let rows = []
    for(let i=0;i<this.state.rows;i++) {
      if(!this.props.store.accessData[i]) this.props.store.accessData[i] = {env: 'live'}
      rows.push(
        <div style={{display: 'flex'}} key={i}>
          <TextField
            required
            defaultValue={this.props.store.accessData[i] ? this.props.store.accessData[i].accessToken : ''}
            onChange={(e) => this.props.store.accessData[i].accessToken = e.target.value}
            label="Account Access Token"
            style={{width: '100%'}}
          />
          <TextField
            required
            defaultValue={this.props.store.accessData[i] ? this.props.store.accessData[i].accountId : ''}
            onChange={(e) => this.props.store.accessData[i].accountId = e.target.value}
            label="Account ID"
            style={{width: '100%'}}
          />
          <TextField
            required
            defaultValue={this.props.store.accessData[i] ? this.props.store.accessData[i].env : ''}
            onChange={(e) => this.props.store.accessData[i].env = e.target.value}
            label="Env"
            style={{width: '100%'}}
          />
        </div>
      )
    }

    return (
      <Paper>
        <div style={{padding: '10px'}}>
          <TextField
            required
            defaultValue={this.props.store.name ? this.props.store.name : ''}
            onChange={(e) => this.props.store.name = e.target.value}
            label="Dashboard Name"
            style={{width: '100%'}}
          />
        </div>

        <div style={{padding: '10px'}}>
          {rows}
        </div>

        <div style={{display: 'flex', padding: '10px'}}>
          <Button variant="contained" color="primary" style={{width: '100%', marginRight: '5px'}}
            onClick={(e) => this.setState(Object.assign(this.state, {rows: this.state.rows + 1}))}
          >
            Add row
          </Button>
          <Button variant="contained" color="secondary" style={{width: '100%', marginLeft: '5px'}}
            onClick={(e) => {
              if(this.state.rows > 1) {
                this.setState(Object.assign(this.state, {rows: this.state.rows - 1}))
                this.props.store.accessData.pop()
              }
            }}
          >
            Remove row
          </Button>
        </div>
      </Paper>
    )
  }
}

export default Setup
