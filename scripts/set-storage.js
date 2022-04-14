const setElmCheckbox = (bool, attr, elm) => {
    if (bool)
        elm.setAttribute(attr, '')
    else
        elm.removeAttribute(attr)
}
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
        setElmCheckbox(e.fullPlot.checked, 'full_plot', e)
        setElmCheckbox(e.exclude.checked, 'exclude', e)
        if (!e.json)
            return
        e.json.minutes = e.minutes.value
        e.setAttribute('json', JSON.stringify(e.json))
    })
    const elmsHTML = elms.map(e => e.cloneNode().outerHTML)
    const jsonString = JSON.stringify(elmsHTML)
    localStorage.setItem('elms', jsonString)
    localStorage.setItem('output', output.value)
    localStorage.setItem('output-cols', output.cols)
    localStorage.setItem('output-rows', output.rows)
})

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
