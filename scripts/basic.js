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
const presetObjEvent = (obj) => {
    for (const key in obj) {
        const elm = obj[key]
        elm.addEventListener('change', function () {
            presetObj[key][preset.value] = this.value
            localStorage.setItem('presetObj', JSON.stringify(presetObj))
        })
    }
}
presetObjEvent({ startInput, customFormatInput, tail, join })

clearTime.addEventListener('click', () => {
    startTime.value = ''
    currentTime.textContent = ''
    sessionStorage.removeItem('start-time')
})

format.addEventListener('click', () => {
    const elms = Array.from(document.querySelectorAll('elm-'))
    let arr = elms.filter(e => e.minutes.value > 0 && !e.exclude.checked)
    if (preset.value === 'watchlist')
        arr = arr.reverse()
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
    const timezoneStr = `[${streamElementsCurTime}${timezoneFunc()}]`
    const val = `${eval(`\`${startInput.value}\``)}${list.join(join.value)}`
    output.value = val
    const lengthArr = val.split('\n')
        ?.sort((a, b) => b.length - a.length)
    if (lengthArr.length > 1) {
        output.cols = lengthArr[0].length
        output.rows = lengthArr.length * 1.13 + 1
    } else {
        output.cols = 30
        output.rows = 15
    }
})

preset.addEventListener('change', e => {
    startInput.value = presetObj.startInput[e.target.value]
    customFormatInput.value = presetObj.customFormatInput[e.target.value]
    tail.value = presetObj.tail[e.target.value]
    join.value = presetObj.join[e.target.value]
})

add.addEventListener('click', () => {
    elmWrapper.insertAdjacentHTML('afterbegin', `<elm-></elm->`)
})
add2.addEventListener('click', () => {
    elmWrapper.insertAdjacentHTML('beforeend', `<elm-></elm->`)
})
generate.addEventListener('click', () => {
    const value = textarea.value
    const arr = value.split(split.value)
    arr.forEach(val => {
        const elm = document.createElement('elm-')
        elmWrapper.append(elm)
        const imdbVal = val.match(elm.imdbIDRegex)?.toString()
        if (imdbVal) {
            elm.setAttribute('imdb', imdbVal)
        } else {
            elm.dataset.rawText = val
            const reg = /s(\d+)ep?(\d+)/i
            const [searchVal, yearVal = ''] = val.trim().split(/(?= \d{4}$)/)
            elm.setAttribute('text', searchVal.replace(reg, ''))
            elm.setAttribute('year', yearVal.trim())
            const [s = '', ep = ''] = val.match(reg)?.slice(1) || []
            elm.setAttribute('season', s)
            elm.setAttribute('episode', ep)
            if (s && ep)
                elm.setAttribute('select_type', 'series')
        }
        elm.update.click()
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
clearStorage.addEventListener('click', () => {
    localStorage.clear()
    sessionStorage.clear()
})
document.querySelectorAll('.var-list code').forEach(code => {
    code.addEventListener('click', e => {
      const selection = window.getSelection()
      selection.removeAllRanges()
        
      const range = document.createRange()
      range.selectNodeContents(e.target)
      selection.addRange(range)
    })
})
