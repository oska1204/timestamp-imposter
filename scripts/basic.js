apikeyElm.value = apikey || ''
apikeyElm.addEventListener('input', function () {
    apikey = this.value
    updateKeyLink(apikey)
})
startTime.addEventListener('input', function () {
    currentTime.textContent = `${defaultTimezoneStr} ${this.value}`
})
offset.addEventListener('change', function () {
    if (!this.value)
        this.value = 0
})
customFormatInput.addEventListener('change', function () {
    if (!this.value)
        this.value = '${text || j.Title || search}'
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
        streamElementsCurTime = `Current time: \${time.Etc/GMT${timezoneFunc().replace(/UTC|:\d{2}/g, '').replace(/[-+]/, e => {
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
    let startMsg = ''
    switch (preset.value) {
        case 'time':
            startMsg = timeStr + ' '
            break;
        case 'rating':
            startMsg = ratingsInfo + ' '
            break;
        case 'rating + time':
            startMsg = `${ratingsInfo} ${timeStr}`.trim()
            break;
    }
    output.value = `${startMsg}${list.join(join.value || ' ⏩ ')}`
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
        switch (radioElm.value) {
            case 'text':
                elm._text = val
                const reg = /s(\d+)ep?(\d+)/i
                const [searchVal, yearVal = ''] = val.trim().split(/(?= (\d{2}|\d{4})$)/)
                elm.setAttribute(radioElm.value, searchVal.replace(reg, ''))
                elm.setAttribute('year', yearVal.trim())
                const [s = '', ep = ''] = val.match(reg)?.slice(1) || []
                elm.setAttribute('season', s)
                elm.setAttribute('episode', ep)
                if (s && ep)
                    elm.setAttribute('select_type', 'series')
                break;
            case 'imdb':
                elm.setAttribute(radioElm.value, val)
                break;
        }
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
suggestionForm.addEventListener('submit', function (e) {
    if (!this.elements.text.value.trim())
        e.preventDefault()
})
resetStorage.addEventListener('click', () => {
    localStorage.clear()
    sessionStorage.clear()
})