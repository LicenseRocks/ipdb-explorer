import React, { Component } from 'react'
import 'whatwg-fetch'
import {InteractiveForceGraph, ForceGraphNode, ForceGraphArrowLink} from 'react-vis-force'
import Tx from './Tx'
import Search from './Search'
import TxHistory from './TxHistory'
import { request } from './Utils'

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
    request(`/transactions/${txId}`)
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
    request(`/outputs?public_key=${publicKey}`)
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
    request(`/transactions?asset_id=${assetId}`)
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
      return <ForceGraphNode
        fill={node.operation === 'CREATE' ? '#007bff' : '#868e96'}
        key={key}
        node={node}
        onClick={(e) => { this.selectTxIndex(key) }}
        />
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
                    <button className='btn btn-sm btn-secondary' onClick={this.toggleGraph.bind(this)}>Toggle View</button>
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
                        <TxHistory
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
