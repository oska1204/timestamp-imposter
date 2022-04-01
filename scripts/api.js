const default_apikey = '80bf610a'
let apikey

const storageKey = sessionStorage.getItem('apikey')
const urlKey = new URL(location).searchParams.get('apikey')
if (storageKey)
    apikey = storageKey
else if (urlKey) {
    apikey = urlKey
    updateKeyLink(apikey)
}
const updateKeyLink = function (key) {
    sessionStorage.setItem('apikey', key || '')
    keyPlaceholder.textContent = key || 'KEY'
    keyLink.href = '?apikey=' + key || 'KEY'
}
