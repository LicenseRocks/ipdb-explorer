import React, { Component } from 'react'
import 'whatwg-fetch'
import {InteractiveForceGraph, ForceGraph, ForceGraphNode, ForceGraphLink, ForceGraphArrowLink} from 'react-vis-force'

function TransactionEntry ({ label, value, onClick }) {
  let content = value
  if (onClick) {
    content = <a href='#' onClick={onClick}>{value}</a>
  }
  return (
    <div className='row'>
      <div className='col-sm-3'>
        <pre className='rounded bg-secondary p-2 text-white'>{label}</pre>
      </div>
      <div className='col-sm-9'>
        <pre className='p-2'>{content}</pre>
      </div>
    </div>
  )
}

class TransactionHistory extends Component {
  render () {
    const { resetHistory, history, historyPointer, selectTxIndex } = this.props
    return <div>
      <h5>
        Transactions
        <small className='float-right'>
          <a href='#' className='text-danger' onClick={resetHistory}>Reset</a>
        </small>
      </h5>
      <div className='list-group'>
        {history.map((tx, key) => {
          let className = 'list-group-item list-group-item-action truncate'
          if (tx === history[historyPointer]) {
            className = className + ' active'
          }
          return <pre key={key}>
            <a href='#' className={className} onClick={(e) => { e.preventDefault(); selectTxIndex(key) }}>
              <strong>{key + 1}.</strong> {tx.id}
            </a>
          </pre>
        }).reverse()}
      </div>
    </div>
  }
}

class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {
      publicKey: '',
      assetId: '',
      showInfo: false,
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
  }

  prefill () {
    this.setState({
      publicKey: '76Z8DCyNqH2ajnrSYeg86sPg195bsmujJb5VtxNiwGRW',
      assetId: 'bb0b17fb9781cd9fb44463bb487067a845b333b5e31de79210786f8e8a3e16d4',
      showInfo: false
    })
  }

  toggleInfo () {
    this.setState({showInfo: !this.state.showInfo})
  }

  render () {
    const { publicKey, assetId, showInfo } = this.state
    const { isSearching, history } = this.props
    return <div>
      <div className='form-group mb-2'>
        <input type='text' name='publicKey'className='form-control' placeholder='Enter a public key' value={publicKey} onChange={this.changePublicKey.bind(this)} />
      </div>
      <div className='form-group mb-2'>
        <input type='text' name='assetId' className='form-control' placeholder='Enter an asset ID' value={assetId} onChange={this.changeAssetId.bind(this)} />
      </div>
      <div className='form-group mb-2'>
        {
          isSearching &&
            <p className='text-center mt-2'>
              <button className='btn btn-primary' disabled type='button'>
                <span className='fa fa-spin fa-cog' /> Searching
              </button>
            </p>
        }
        {
          !isSearching &&
            <div className='text-center mt-2'>
              <button className='btn btn-primary px-4' type='button' onClick={this.search.bind(this)}>
                <span className='fa fa-search' /> Search
              </button>
              <br />
              {
                history.length === 0 &&
                  <div>
                    <p className='text-secondary mt-2'>
                      <small>
                        <a href='#' onClick={this.toggleInfo.bind(this)}>(What is this?)</a>
                      </small>
                    </p>
                    {
                      showInfo &&
                        <div className='text-left bg-light p-4'>
                          <p>
                            Enter a combination of public key <strong>and/or</strong> asset id and the explorer will retrieve:
                          </p>
                          <ul>
                            <li>The associated transactions</li>
                            <li>The associated assets</li>
                            <li>All transactions associated with those assets</li>
                          </ul>
                          <p>
                            Try <a href='#' onClick={this.prefill.bind(this)}>these</a> to get you started.
                          </p>
                        </div>
                    }
                  </div>
              }
            </div>
        }
      </div>
    </div>
  }
}

class Input extends Component {
  render () {
    const { input, selectTx } = this.props
    const { owners_before, fulfills } = input
    return <div className='input-container'>
      {(owners_before).map((ownerBefore, key) => {
        return <TransactionEntry key={key} label='Public Key' value={ownerBefore} />
      })}
      {
        fulfills &&
          <div>
            <h6>Fulfillments</h6>
            <TransactionEntry label='Tx ID' onClick={() => { selectTx(fulfills.transaction_id) }} value={fulfills.transaction_id} />
            <TransactionEntry label='Output Index' value={fulfills.output_index} />
          </div>
      }
    </div>
  }
}

class Output extends Component {
  render () {
    const { output } = this.props
    const { public_keys } = output
    return <div className='input-container'>
      {(public_keys).map((publicKey, key) => {
        return <TransactionEntry key={key} label='Public Key' value={publicKey} />
      })}
      <TransactionEntry label='Amount' value={output.amount} />
    </div>
  }
}

class Tx extends Component {
  inputs () {
    const { tx, selectTx } = this.props
    const { inputs } = tx
    return inputs.map((input, key) => {
      return <Input key={key} input={input} selectTx={selectTx} />
    })
  }

  outputs () {
    const { tx } = this.props
    const { outputs } = tx
    return outputs.map((output, key) => {
      return <Output key={key} output={output} />
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
    const { tx, selectTx } = this.props
    return <div className='pt-2'>
      <h4 className='transaction-title p-3 bg-light mb-4'>
        <pre className='mb-0'>{tx.id}</pre>
      </h4>
      <div className='mb-4'>
        <h5>Inputs</h5>
        {this.inputs()}
      </div>
      <hr />
      <div className='mb-4'>
        <h5>Outputs</h5>
        {this.outputs()}
      </div>
      <hr />
      <TransactionEntry label='Operation' value={tx.operation} />
      <hr />
      <h5>Asset</h5>
      {
        this.isTransfer() &&
          <TransactionEntry label='Asset ID' onClick={() => { selectTx(tx.asset.id) }} value={tx.asset.id} />
      }
      {
        this.isCreate() &&
          <div className='p-4 bg-light border border-secondary mb-2'>
            <div>
              <pre><small>{ JSON.stringify(tx.asset, null, 2)}</small></pre>
            </div>
          </div>
      }
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
    this.state = this.defaultState()
  }

  defaultState () {
    return {
      tx: null,
      isSearching: false,
      errors: {},
      history: [],
      historyPointer: -1,
      showGraph: false
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
              tx.inputs.forEach(input => {
                if (input.fulfills) {
                  this.findTx(input.fulfills.transaction_id)
                }
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

  selectTxIndex (historyPointer) {
    this.setState({ historyPointer })
  }

  selectTx (id) {
    const { history } = this.state
    const txIds = history.map(tx => tx.id)

    this.selectTxIndex(txIds.indexOf(id))
  }

  search ({publicKey, assetId}) {
    this.findOutputs(publicKey)
    this.findTxs(assetId)
  }

  transfers () {
    const { history } = this.state
    return history
      .filter(tx => {
        return tx.operation === 'TRANSFER'
      })
  }

  resetHistory () {
    this.setState(this.defaultState())
  }

  links () {
    const { history } = this.state
    const nodeIds = history.map(node => node.id)
    return this.transfers().map(tx => {
      return tx.inputs.map(input => {
        return {
          target: tx.id,
          amount: tx.amount,
          source: input.fulfills.transaction_id
        }
      })
    })
    .reduce((a, b) => { return a.concat(b) }, [])
    .filter(({source, target}) => {
      return nodeIds.includes(source)
    })
  }

  toggleGraph () {
    this.setState({showGraph: !this.state.showGraph})
  }

  render () {
    const { isSearching, history, historyPointer, showGraph } = this.state
    const [ tx ] = history.slice(historyPointer)
    let result = null
    if (tx) {
      result = <Tx tx={tx} selectTx={this.selectTx.bind(this)} />
    }
    const graphLinks = this.links().map((link, key) => {
      return <ForceGraphArrowLink key={key} link={link} />
    })
    const graphNodes = history.map((node, key) => {
      let fill = '#868e96'
      if (node.operation === 'CREATE') {
        fill = '#007bff'
      }
      return <ForceGraphNode fill={fill} key={key} node={node} onClick={(e) => {
        e.preventDefault()
        this.selectTxIndex(key)
        e.target.blur()
      }} />
    })

    let sidebarClasses = 'col-sm-3 sidebar'
    let transactionPanelClasses = 'transaction-panel col-sm-9 pt-2'
    if (showGraph) {
      sidebarClasses = 'col-sm-6 sidebar'
      transactionPanelClasses = 'transaction-panel col-sm-6 pt-2'
    }
    return (
      <div id='app'>
        {
          result &&
            <div className='with-results'>
              <div className='row'>
                <div className={sidebarClasses}>
                  <p>
                    <button className='btn btn-sm btn-success' onClick={this.toggleGraph.bind(this)}>Toggle</button>
                  </p>
                  {
                    showGraph &&
                    <InteractiveForceGraph zoom={true} simulationOptions={{ animate: true, height: 800, width: 800 }}>
                      {graphNodes}
                      {graphLinks}
                    </InteractiveForceGraph>
                  }
                  {
                    !showGraph &&
                      <div className='mt-2'>
                        {
                          this.hasErrors() &&
                            <div className='alert alert-info'>
                              Couldn't find anything - sorry!
                            </div>
                        }
                        <Search isSearching={isSearching} search={this.search.bind(this)} history={history} />
                        <TransactionHistory
                          resetHistory={this.resetHistory.bind(this)}
                          history={history}
                          historyPointer={historyPointer}
                          selectTxIndex={this.selectTxIndex.bind(this)}
                        />
                      </div>
                  }
                </div>
                <div className={transactionPanelClasses}>
                  {result}
                </div>
              </div>
            </div>
        }
        {
          !result &&
            <div className='row justify-content-md-center'>
              <div className='col-sm-6'>
                <div className='search'>
                  <h2 className='text-center'>IPDB Explorer</h2>
                  <div className='mt-2'>
                    <Search isSearching={isSearching} search={this.search.bind(this)} history={history} />
                  </div>
                </div>
              </div>
              <footer>
                <span className='float-left'>
                  <a href='https://github.com/licenserocks/ipdb-explorer' className='text-secondary'>
                    <span className='fa fa-github' /> licenserocks/ipdb-explorer
                  </a>
                </span>
                <span className='float-right'>
                  <a href='http://www.license.rocks' className='text-secondary'>license.rocks © 2017</a>
                </span>
              </footer>
            </div>
        }
      </div>
    )
  }
}

export default App
