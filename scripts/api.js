const default_apikey = '9d50e66a'
let apikey

const updateKeyLink = function (key) {
    sessionStorage.setItem('apikey', key || '')
    keyPlaceholder.textContent = key || 'KEY'
    keyLink.href = '?apikey=' + key || 'KEY'
}
const storageKey = sessionStorage.getItem('apikey')
const urlKey = new URL(location).searchParams.get('apikey')
if (storageKey) {
    apikey = storageKey
    apikeyElm.value = storageKey
    updateKeyLink(storageKey)
}
else if (urlKey)
    apikey = urlKey
