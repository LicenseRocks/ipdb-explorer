import React, { Component } from 'react'
import 'whatwg-fetch'
import Graph from './Graph'

class TransactionHistory extends Component {
  render () {
    const { history, historyPointer, selectTx } = this.props
    return <div>
      <h5>Transactions</h5>
      <div className='list-group'>
        {history.map((tx, key) => {
          let className = 'list-group-item list-group-item-action truncate'
          if (tx === history[historyPointer]) {
            className = className + ' active'
          }
          return <pre key={key}>
            <a href='#' className={className} onClick={() => { selectTx(key) }}>
              {key + 1}. {tx.id}
            </a>
          </pre>
        }).reverse()}
      </div>
    </div>
  }
}

class Search extends Component {
  defaultState () {
    return {
      publicKey: '',
      assetId: ''
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      publicKey: '76Z8DCyNqH2ajnrSYeg86sPg195bsmujJb5VtxNiwGRW',
      assetId: 'bb0b17fb9781cd9fb44463bb487067a845b333b5e31de79210786f8e8a3e16d4'
    }
  }

  changePublicKey (e) {
    const publicKey = e.target.value
    this.setState({publicKey})
  }

  changeAssetId (e) {
    const assetId = e.target.value
    this.setState({assetId})
  }

  search () {
    const { search } = this.props
    search(this.state)
    this.setState(this.defaultState())
  }

  render () {
    const { publicKey, assetId } = this.state
    const { isSearching } = this.props
    return <div>
      <div className='form-group my-2'>
        <label>Public Key</label>
        <input type='text' className='form-control' placeholder='Enter a public key' value={publicKey} onChange={this.changePublicKey.bind(this)} />
      </div>
      <div className='form-group my-2'>
        <label>Asset Id</label>
        <input type='text' className='form-control' placeholder='Enter an asset ID' value={assetId} onChange={this.changeAssetId.bind(this)} />
      </div>
      <div className='form-group my-2'>
        {
          isSearching &&
            <button className='btn btn-primary btn-block' disabled type='button'>
              <span className='fa fa-spin fa-cog' /> Searching
            </button>
        }
        {
          !isSearching &&
            <button className='btn btn-primary btn-block' type='button' onClick={this.search.bind(this)}>
              <span className='fa fa-search' /> Search
            </button>
        }
      </div>
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
          return <li key={key}>
            <pre>
              <button className='btn btn-secondary btn-block truncate'>
                {ownerBefore}
              </button>
            </pre>
          </li>
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
          return <li key={key}>
            <pre>
              <button className='btn btn-secondary btn-block truncate'>
                {publicKey}
              </button>
            </pre>
          </li>
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
      <h3>
        <pre className='truncate'>{ tx.id }</pre>
      </h3>
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
    this.state = {
      tx: null,
      isSearching: false,
      errors: {},
      history: [],
      historyPointer: -1
    }
  }

  hasErrors () {
    const { errors } = this.state
    return Object.keys(errors).length > 1
  }

  isTxInHistory (tx) {
    return this.state.history.find(({id}) => { return id === tx.id })
  }

  findTx (txId) {
    this.setState({isSearching: true})
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
          response.json().then(json => {
            this.setState({isSearching: false, errors: json})
          })
        } else {
          response.json().then(tx => {
            this.setState({
              isSearching: false,
              errors: {}
            })

            if (!this.isTxInHistory(tx)) {
              this.setState({
                history: [...this.state.history, tx],
                historyPointer: this.state.historyPointer + 1
              })
            }
          })
        }
      })
      .catch(response => { console.log(response) })
  }

  findOutputs (publicKey) {
    this.setState({isSearching: true})
    window.fetch(
      `https://test.ipdb.io/api/v1/outputs?public_key=${publicKey}`, {
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
          response.json().then(contents => {
            this.setState({isSearching: false})
            contents.forEach(({transaction_id, output_index}) => {
              this.findTx(transaction_id)
            })
          })
        }
      })
      .catch(response => { console.log(response) })
  }

  findTxs (assetId) {
    this.setState({isSearching: true})
    window.fetch(
      `https://test.ipdb.io/api/v1/transactions?asset_id=${assetId}`, {
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
          response.json().then(contents => {
            this.setState({isSearching: false})
            contents.forEach(({id}) => {
              this.findTx(id)
            })
          })
        }
      })
      .catch(response => { console.log(response) })
  }

  selectTx (historyPointer) {
    this.setState({ historyPointer })
  }

  search ({publicKey, assetId}) {
    this.findOutputs(publicKey)
    this.findTxs(assetId)
  }

  render () {
    const { isSearching, history, historyPointer } = this.state
    const [ tx ] = history.slice(historyPointer)
    let result = null
    if (tx) {
      result = <Tx tx={tx} findTx={this.findTx.bind(this)} />
    }
    return (
      <div className='row'>
        <div className='col-sm-3 sidebar'>
          <div className='mt-2'>
            {
              this.hasErrors() &&
                <div className='alert alert-info'>
                  Couldn't find anything - sorry!
                </div>
            }
            <Search isSearching={isSearching} search={this.search.bind(this)} />
            {
              history.length > 0 &&
                <TransactionHistory history={history} historyPointer={historyPointer} selectTx={this.selectTx.bind(this)} />
            }
          </div>
        </div>
        <div className='col-sm-9 mt-2'>
          <Graph nodes={history} links={[]} />
        </div>
      </div>
    )
  }
}

export default App
