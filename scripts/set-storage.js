addEventListener('beforeunload', () => {
    window.isUnloading = true
    const elms = Array.from(document.querySelectorAll('elm-'))
    elms.forEach(e => {
        e.setAttribute('minutes', e.minutes.value)
        e.setAttribute('search', e.search.value)
        e.setAttribute('year', e.year.value)
        e.setAttribute('imdb', e.imdb.value)
        e.setAttribute('select_type', e.select_type.value)
        e.setAttribute('title_json', JSON.stringify(e.titleJson) || '')
        e.setAttribute('select_title', e.select_title.value)
        e.setAttribute('season', e.season.value)
        e.setAttribute('episode', e.episode.value)
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
setLocalStorage(customFormatInput, 'customFormatInput')
setLocalStorage(join, 'join')
setLocalStorage(tail, 'tail')
setLocalStorage(timezoneInput, 'timezone-input')
setSessionStorage(startTime, 'start-time')
setSessionStorage(preset, 'preset')
setSessionStorage(offset, 'offset')

const setCheckbox = (elm, name) => {
    elm.addEventListener('change', function () {
        localStorage.setItem(name, this.checked)
    })
}
setCheckbox(squareBrackets, 'square-brackets')
setCheckbox(streamElementsCurTimeCheck,
    'stream-elements-cur-time-check')
setCheckbox(imdbCheck, 'imdb-check')
setCheckbox(tomatoCheck, 'tomato-check')
setCheckbox(metacriticCheck, 'metacritic-check')