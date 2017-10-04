import 'whatwg-fetch'

export function request (path) {
  return window.fetch(
    `https://test.ipdb.io/api/v1${path}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      method: 'GET',
      credentials: 'same-origin'
    }
  )
}
