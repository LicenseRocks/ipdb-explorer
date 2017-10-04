import React, { Component } from 'react'

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

export default class Tx extends Component {
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
