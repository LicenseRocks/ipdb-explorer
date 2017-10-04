import React, { Component } from 'react'

export default class TxHistory extends Component {
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
