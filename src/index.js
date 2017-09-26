import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import 'bootstrap/dist/css/bootstrap.css'

const RootEl = document.getElementById('root')
ReactDOM.render(
  <App />,
  RootEl
)
registerServiceWorker()

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    ReactDOM.render(
      <NextApp />,
      RootEl
    )
  })
}
