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
apikeyElm.value = apikey || ''
apikeyElm.addEventListener('input', function () {
    apikey = this.value
    updateKeyLink(apikey)
})

textarea.value = localStorage.getItem('textarea') || 'Aladdin ⏩ The Hangover'
split.value = localStorage.getItem('split') || '⏩'
join.value = localStorage.getItem('join') || ' ⏩ '
tail.value = localStorage.getItem('tail') || 'Cartoons'
switch (localStorage.getItem('square-brackets')) {
    case 'true':
        squareBrackets.checked = true
        break;
    case 'false':
    default:
        squareBrackets.checked = false
        break;
}
switch (localStorage.getItem('streamElementsCurTimeCheck')) {
    case 'true':
    default:
        streamElementsCurTimeCheck.checked = true
        break;
    case 'false':
        streamElementsCurTimeCheck.checked = false
        break;
}
radioGenerate.forEach(e => {
    if (e.value === localStorage.getItem('radio-generate'))
        e.checked = true
})
preset.value = sessionStorage.getItem('preset') || preset.value

const defaultTimezone = (new Date).getTimezoneOffset() / - 60
const defaultTimezoneStr = `UTC${defaultTimezone >= 0 ? '+' : ''}${defaultTimezone}`
const time = sessionStorage.getItem('start-time') || ''
startTime.value = time
if (time)
    currentTime.textContent = `${defaultTimezoneStr} ${time}`

try {
    const elmsHTML = JSON.parse(localStorage.getItem('elms'))
    if (elmsHTML.length !== undefined)
        elmWrapper.innerHTML = ''
    elmsHTML.forEach(html => {
        elmWrapper.insertAdjacentHTML('beforeEnd', html)
    })
} catch (err) {
    console.error(err);
}
addEventListener('beforeunload', () => {
    window.isUnloading = true
    const elms = Array.from(document.querySelectorAll('elm-'))
    elms.forEach(e => {
        e.setAttribute('minutes', e.minutes.value)
        e.setAttribute('search', e.search.value)
        e.setAttribute('year', e.year.value)
        e.setAttribute('imdb', e.imdb.value)
        if (!e.json)
            return
        e.json.minutes = e.minutes.value
        e.setAttribute('json', JSON.stringify(e.json))
    })
    const elmsHTML = elms.map(e => e.cloneNode().outerHTML)
    const jsonString = JSON.stringify(elmsHTML)
    localStorage.setItem('elms', jsonString)
})

const setLocalStorage = (elm, name) => {
    elm.addEventListener('change', () => {
        localStorage.setItem(name, elm.value)
    })
}
const setSessionStorage = (elm, name) => {
    elm.addEventListener('change', () => {
        sessionStorage.setItem(name, elm.value)
    })
}
setLocalStorage(textarea, 'textarea')
setLocalStorage(split, 'split')
setLocalStorage(join, 'join')
setLocalStorage(tail, 'tail')
setLocalStorage(timezoneInput, 'timezone-input')
radioGenerate.forEach(e => setLocalStorage(e, 'radio-generate'))
setSessionStorage(startTime, 'start-time')
setSessionStorage(preset, 'preset')

startTime.addEventListener('input', function () {
    currentTime.textContent = `${defaultTimezoneStr} ${this.value}`
})
offset.addEventListener('change', function () {
    if (!this.value)
        this.value = 0
})
squareBrackets.addEventListener('change', function () {
    localStorage.setItem('square-brackets', this.checked)
})
streamElementsCurTimeCheck.addEventListener('change', function () {
    localStorage.setItem('streamElementsCurTimeCheck', this.checked)
})
clearTime.addEventListener('click', () => {
    startTime.value = ''
    currentTime.textContent = ''
    sessionStorage.removeItem('start-time')
})
format.addEventListener('click', () => {
    const elms = Array.from(document.querySelectorAll('elm-'))
    const arr = elms.filter(e => e.minutes.value > 0)
    const list = getList(arr, offset.value, startTime.value, preset.value)
    const ratingsListUnfiltered = [
        imdbCheck.checked ? 'IMDb' : '',
        tomatoCheck.checked ? 'Rotten Tomatoes' : '',
        metacriticCheck.checked ? 'Metacritic' : ''
    ]
    const ratingsInfoList = ratingsListUnfiltered.filter(e => e)
    const ratingsInfo = ratingsInfoList.length
        ? `{${ratingsInfoList.join(', ')}}`
        : ''
    let streamElementsCurTime = ''
    if (streamElementsCurTimeCheck.checked)
        streamElementsCurTime = `Current time: \${time.Etc/GMT${timezoneFunc().replace('UTC', '').replace(/[-+]/, e => {
            switch (e) {
                case '-':
                    return '+'
                    break
                case '+':
                    return '-'
                    break
            }
        })}} `
    const timeStr = `[${streamElementsCurTime}${timezoneFunc()}]`
    let startMsg
    switch (preset.value) {
        case 'time':
            startMsg = timeStr
            break;
        case 'rating':
            startMsg = ratingsInfo
            break;
        case 'rating + time':
            startMsg = `${ratingsInfo} ${timeStr}`.trim()
            break;
    }
    output.value = `${startMsg} ${list.join(join.value || ' ⏩ ')}`
})
add.addEventListener('click', () => {
    elmWrapper.insertAdjacentHTML('beforeend', `<elm-></elm->`)
})
generate.addEventListener('click', () => {
    const value = textarea.value
    const arr = value.split(split.value)
    arr.forEach(val => {
        const elm = document.createElement('elm-')
        elmWrapper.append(elm)
        const radioElm = radioGenerate.filter(e => e.checked)[0]
        elm.setAttribute(radioElm.value, val)
    });
})
updateAll.addEventListener('click', () => {
    const elms = document.querySelectorAll('elm-')
    elms.forEach(e => e.update.click())
})
removeAll.addEventListener('click', () => {
    const elms = document.querySelectorAll('elm-')
    elms.forEach(e => e.remove())
})
const timezoneFunc = () => {
    let plus
    switch (Math.sign(timezoneInput.valueAsNumber)) {
        case 1:
        case 0:
            plus = '+'
            break;
        case -1:
            plus = '-'
            break;
    }
    const [start, end = 0] = timezoneInput.value.split('.')
    const startInMin = parseFloat(start)
    const startStr = startInMin.toString().replace(/^-/, '')
    const endInSec = parseInt(end) * .6
    const endInSecStr = `${endInSec}0`.slice(0, 2)
    const endStr = endInSec === 0
        ? ''
        : `:${endInSecStr}`
    const str = `UTC${plus}${startStr}${endStr}`.replace(/\+0$/, '')
    timezoneSpan.textContent = str
    return str
}
timezoneInput.addEventListener('input', timezoneFunc)
timezoneInput.addEventListener('change', function () {
    if (!this.value)
        timezoneInput.value = defaultTimezone
    timezoneFunc()
})
timezoneInput.value = localStorage.getItem('timezone-input')
    || defaultTimezone
timezoneFunc()
timezoneReset.addEventListener('click', () => {
    timezoneInput.value = defaultTimezone
    timezoneFunc()
    localStorage.removeItem('timezone-input')
})
