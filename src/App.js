import React, { Component } from 'react'

class Search extends Component {
  constructor (props) {
    super(props)
    this.state = { txId: '159774426470c983bc32d2cacd609bae652fb82f2373da6024c30fb36364c6ea' }
  }

  changeTx (e) {
    const txId = e.target.value
    this.setState({txId})
  }

  findTx (e) {
    const { txId } = this.state
    const { findTx } = this.props
    e.target.blur()
    findTx(txId)
  }

  render () {
    const { txId } = this.state
    return <div className='input-group'>
      <input type='text' className='form-control' placeholder='Enter your Tx' value={txId} onChange={this.changeTx.bind(this)} />
      <span className='input-group-btn'>
        <button className='btn btn-secondary' type='button' onClick={this.findTx.bind(this)}>Find</button>
      </span>
    </div>
  }
}

class Result extends Component {
  render () {
    const { tx } = this.props
    return <div className='card'>
      <div className='card-body'>
        <pre><small>{ JSON.stringify(tx, null, 2)}</small></pre>
      </div>
    </div>
  }
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { tx: null }
  }

  findTx (txId) {
    window.fetch(
      `https://test.ipdb.io/api/v1/transactions/${txId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        method: 'GET',
        credentials: 'same-origin'
      }
    )
      .then(response => {
        if (!response.ok) {
          response.json().then(json => { console.log(json) })
        } else {
          response.json().then(json => this.setState({tx: json}))
        }
      })
      .catch(response => { console.log(response) })
  }

  componentDidMount () {
  }

  render () {
    const { tx } = this.state
    let result = null
    if (tx) {
      result = <Result tx={tx} />
    }
    return (
      <div className='row justify-content-md-center'>
        <div className='col-md-4'>
          <div className='mt-5'>
            <h1 className='text-center'>IPDB-Explorer</h1>
            <Search findTx={this.findTx.bind(this)} />
          </div>
        </div>
        {result}
      </div>
    )
  }
}

export default App
