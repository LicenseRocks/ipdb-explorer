import React, { Component } from 'react'

export default class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {
      publicKey: '',
      assetId: '',
      showInfo: false
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
      publicKey: 'BXCvLkk5A5rSZAfa3QVFEaLt1SJXFZS2qDqQapo92iqy',
      assetId: 'd84533681ef84016c525c54bbb117c55354ea24caab09a669c9021e1e3992803',
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


