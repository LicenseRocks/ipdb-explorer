import React, { Component } from 'react'
import 'whatwg-fetch'

class SearchHistory extends Component {
  render () {
    const { history, selectTx } = this.props
    return <div>
      <h5>Search History</h5>
      <ul className='list-unstyled'>
        {history.map((tx, key) => {
          return <li key={key}>
            <pre><button className='btn btn-secondary btn-block truncate' onClick={() => { selectTx(tx.id) }}>{tx.id}</button></pre>
          </li>
        })}
      </ul>
    </div>
  }
}

class Search extends Component {
  constructor (props) {
    super(props)
    this.state = { txId: '6cf011722b0a79d77a9ea1f85a2c717e650d9000afd285f1868676cab15f5632' }
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
    const { isSearching } = this.props
    return <div className='input-group my-2'>
      <input type='text' className='form-control' placeholder='Enter your Tx' value={txId} onChange={this.changeTx.bind(this)} />
      <span className='input-group-btn'>
        {
          isSearching &&
            <button className='btn btn-primary' disabled type='button'>
              <span className='fa fa-spin fa-cog' /> Searching
            </button>
        }
        {
          !isSearching &&
            <button className='btn btn-primary' type='button' onClick={this.findTx.bind(this)}>
              <span className='fa fa-search' /> Tx
            </button>
        }
      </span>
    </div>
  }
}

class Input extends Component {
  render () {
    const { input, findTx } = this.props
    const { owners_before, fulfills } = input
    return <div className='p-4 bg-light border border-secondary'>
      <h6>Owners Before</h6>
      <ul className='list-unstyled'>
        {(owners_before).map((ownerBefore, key) => {
          return <li key={key}><pre>{ownerBefore}</pre></li>
        })}
      </ul>
      {
        fulfills &&
          <div>
            <h6>Fulfillments</h6>
            <ul className='list-unstyled'>
              <li><pre><button className='btn btn-secondary btn-block truncate' onClick={() => { findTx(fulfills.transaction_id) }}>{fulfills.transaction_id}</button></pre></li>
            </ul>
          </div>
      }
    </div>
  }
}

class Output extends Component {
  render () {
    const { output } = this.props
    const { public_keys } = output
    return <div className='p-4 bg-light border border-secondary'>
      <h6>Public Keys</h6>
      <ul className='list-unstyled'>
        {(public_keys).map((publicKey, key) => {
          return <li key={key}><pre>{publicKey}</pre></li>
        })}
      </ul>
      <h6>Amount</h6>
      <ul className='list-unstyled'>
        <li><pre>{output.amount}</pre></li>
      </ul>
    </div>
  }
}

class Tx extends Component {
  inputs () {
    const { tx, findTx } = this.props
    const { inputs } = tx
    return inputs.map((input, key) => {
      return <li key={key}><Input input={input} findTx={findTx} /></li>
    })
  }

  outputs () {
    const { tx } = this.props
    const { outputs } = tx
    return outputs.map((output, key) => {
      return <li key={key}><Output output={output} /></li>
    })
  }

  isTransfer () {
    const { tx } = this.props
    return tx.operation === 'TRANSFER'
  }

  isCreate () {
    return !this.isTransfer()
  }

  render () {
    const { tx, findTx } = this.props
    return <div>
      <h5>Inputs</h5>
      <ul className='list-unstyled'>
        {this.inputs()}
      </ul>
      <h5>Outputs</h5>
      <ul className='list-unstyled'>
        {this.outputs()}
      </ul>
      <h5>Operation</h5>
      <pre><pre>{tx.operation}</pre></pre>
      <h5>Asset</h5>
      <div className='p-4 bg-light border border-secondary mb-2'>
        {
          this.isTransfer() &&
            <pre><button className='btn btn-secondary btn-block truncate' onClick={() => { findTx(tx.asset.id) }}>{tx.asset.id}</button></pre>
        }
        {
          this.isCreate() &&
            <div>
              <pre><small>{ JSON.stringify(tx.asset, null, 2)}</small></pre>
            </div>
        }
      </div>
      <h5>Meta</h5>
      <div className='p-4 bg-light border border-secondary'>
        { !tx.meta && '-'}
        {
          tx.meta &&
            <pre><small>{ JSON.stringify(tx.meta, null, 2)}</small></pre>
        }
      </div>
    </div>
  }
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = { tx: null, isSearching: false, errors: {}, history: [] }
  }

  hasErrors () {
    const { errors } = this.state
    return Object.keys(errors).length > 1
  }

  findTx (txId) {
    this.setState({isSearching: true})
    fetch(
      `http://localhost:9985/api/v1/transactions/${txId}`, {
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
          response.json().then(json => {
            this.setState({isSearching: false, errors: json})
          })
        } else {
          response.json().then(json => {
            this.setState({
              isSearching: false,
              tx: json,
              history: this.state.history.concat(json),
              errors: {}
            })
          })
        }
      })
      .catch(response => { console.log(response) })
  }

  selectTx (txId) {
    const { history } = this.state
    const selectedTx = history.find(_tx => {
      return _tx.id === txId
    })
    this.setState({
      tx: selectedTx
    })
  }

  render () {
    const { tx, isSearching, history } = this.state
    let result = null
    if (tx) {
      result = <Tx tx={tx} findTx={this.findTx.bind(this)} />
    }
    return (
      <div className='row'>
        <div className='col-sm-3 sidebar'>
          <div className='mt-2'>
            <h3 className='text-center'>IPDB-Explorer</h3>
            {
              this.hasErrors() &&
                <div className='alert alert-info'>
                  Couldn't find anything - sorry!
                </div>
            }
            <Search isSearching={isSearching} findTx={this.findTx.bind(this)} />
            {
              history.length > 0 &&
                <SearchHistory history={history} selectTx={this.selectTx.bind(this)} />
            }
          </div>
        </div>
        <div className='col-sm-9 mt-2'>
          {result}
        </div>
      </div>
    )
  }
}

export default App
