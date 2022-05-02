const setElmCheckbox = (bool, attr, elm) => {
    if (bool)
        elm.setAttribute(attr, '')
    else
        elm.removeAttribute(attr)
}
const setElms = () => {
    const elms = Array.from(document.querySelectorAll('elm-'))
    const elmsClone = elms.map(e => {
        const clone = e.cloneNode(true)
        clone.setAttribute('minutes', e.minutes.value)
        clone.setAttribute('search', e.search.value)
        clone.setAttribute('year', e.year.value)
        clone.setAttribute('imdb', e.imdb.value)
        clone.setAttribute('select_type', e.select_type.value)
        clone.setAttribute('title_json', JSON.stringify(e.titleJson) || '')
        clone.setAttribute('select_title', e.select_title.value)
        clone.setAttribute('season', e.season.value)
        clone.setAttribute('episode', e.episode.value)
        setElmCheckbox(e.fullPlot.checked, 'full_plot', clone)
        setElmCheckbox(e.exclude.checked, 'exclude', clone)
        if (!e.json)
            return clone
        e.json.minutes = e.minutes.value
        clone.setAttribute('json', JSON.stringify(e.json))
        return clone
    })
    const elmsHTML = elmsClone.map(e => e.cloneNode().outerHTML)
    const jsonString = JSON.stringify(elmsHTML)
    localStorage.setItem('elms', jsonString)
    localStorage.setItem('output', output.value)
    localStorage.setItem('output-cols', output.cols)
    localStorage.setItem('output-rows', output.rows)
}
addEventListener('beforeunload', setElms)

let setElmsTimeout
const setElmsTimeoutFn = e => {
    clearTimeout(setElmsTimeout)
    setElmsTimeout = setTimeout(setElms, 1000)
}
document.addEventListener('send-data', setElmsTimeoutFn)
document.addEventListener('elm-removed', setElmsTimeoutFn)

const setStorage = storage => obj => {
    for (const key in obj) {
        const elm = obj[key];
        elm.addEventListener('change', () => {
            storage.setItem(key, elm.value)
        })
    }
}
const setLocalStorage = setStorage(localStorage)
const setSessionStorage = setStorage(sessionStorage)

setLocalStorage({
    textarea,
    split,
    join,
    'timezone-input': timezoneInput,
})
setSessionStorage({
    'start-time': startTime,
    preset,
    offset,
})

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
