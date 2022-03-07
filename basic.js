const default_apikey = '80bf610a'
let apikey

const setTheme = bool => {
    const { classList } = document.documentElement
    if (bool)
        classList.add('light')
    else
        classList.remove('light')
}
const lightFunc = mediaQuery => {
    if (localStorage.getItem('theme'))
        return
    setTheme(mediaQuery.matches)
}
const mediaLight = matchMedia('(prefers-color-scheme: light)')
lightFunc(mediaLight)
mediaLight.addEventListener('change', lightFunc)
const themeFunc = () => {
    const { classList } = document.documentElement
    const val = !classList.contains('light')
    setTheme(val)
    localStorage.setItem('theme', val)
}
setTheme(localStorage.getItem('theme') === 'true')

const query = document.querySelector.bind(document)

const apikeyElm = query('.apikey')
const elmWrapper = query('.elm-wrapper')
const add = query('.add')
const textarea = query('.text')
const generate = query('.generate')
const split = query('.split')
const output = query('.output')
const updateAll = query('.update-all')
const format = query('.format')
const offset = query('.offset')
const keyPlaceholder = query('.key-placeholder')
const keyLink = query('.key-link')
const startTime = query('.start-time')
const currentTime = query('.current-time')
const clearTime = query('.clear-time')
const tail = query('.tail')
const join = query('.join')
const preset = query('.preset')
const imdbCheck = query('.imdb-check')
const tomatoCheck = query('.tomato-check')
const metacriticCheck = query('.metacritic-check')
const removeAll = query('.remove-all')
const toggleTheme = query('.toggle-theme')

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
const time = sessionStorage.getItem('start-time')
startTime.value = time
currentTime.textContent = time
join.value = localStorage.getItem('join') || ' ⏩ '
tail.value = localStorage.getItem('tail') || 'Cartoons'
preset.value = sessionStorage.getItem('preset') || preset.value

try {
    const elmsHTML = JSON.parse(localStorage.getItem('elms'))
    if (elmsHTML.length)
        elmWrapper.innerHTML = ''
    elmsHTML.forEach(html => {
        elmWrapper.insertAdjacentHTML('beforeEnd', html)
    })
} catch (err) {
    console.error(err);
}


textarea.addEventListener('change', function () {
    localStorage.setItem('textarea', this.value)
})
split.addEventListener('change', function () {
    localStorage.setItem('split', this.value)
})
startTime.addEventListener('change', function () {
    sessionStorage.setItem('start-time', this.value)
})
startTime.addEventListener('input', function () {
    currentTime.textContent = this.value
})
join.addEventListener('change', function () {
    localStorage.setItem('join', this.value)
})
tail.addEventListener('change', function () {
    localStorage.setItem('tail', this.value)
})
preset.addEventListener('change', function () {
    sessionStorage.setItem('preset', this.value)
})
offset.addEventListener('change', function () {
    if (!this.value)
        this.value = 0
})

toggleTheme.addEventListener('click', () => {
    themeFunc()
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
    const timezoneOffset = new Date().getTimezoneOffset() / - 60
    const offsetType = Math.sign(timezoneOffset)
    let offsetResult
    switch (offsetType) {
        case 1:
            offsetResult = '+' + timezoneOffset
            break;
        case -1:
            offsetResult = '-' + timezoneOffset
            break;
        case 0:
            offsetResult = ''
            break;
    }
    const ratingsListUnfiltered = [
        imdbCheck.checked ? 'IMDb' : '',
        tomatoCheck.checked ? 'Rotten Tomatoes' : '',
        metacriticCheck.checked ? 'Metacritic' : ''
    ]
    const ratingsInfoList = ratingsListUnfiltered.filter(e => e)
    const ratingsInfo = ratingsInfoList.length
        ? `{${ratingsInfoList.join(', ')}}`
        : ''
    let startMsg
    switch (preset.value) {
        case 'time':
            startMsg = `[UTC${offsetResult}]`
            break;
        case 'rating':
            startMsg = `${ratingsInfo}`
            break;
        case 'rating + time':
            startMsg = `${ratingsInfo} [UTC${offsetResult}]`.trim()
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
        elm.setAttribute('text', val)
    });
})
updateAll.addEventListener('click', () => {
    const elms = document.querySelectorAll('elm-')
    elms.forEach(e => {
        if (e.search.value)
            e.update.click()
    })
})
removeAll.addEventListener('click', () => {
    const elms = document.querySelectorAll('elm-')
    elms.forEach(e => e.remove())
})
addEventListener('beforeunload', () => {
    const elms = Array.from(document.querySelectorAll('elm-'))
    elms.forEach(e => {
        if (e.json)
            e.setAttribute('json', JSON.stringify(e.json))
        e.setAttribute('minutes', e.minutes.value)
    })
    const elmsHTML = elms.map(e => e.outerHTML)
    const jsonString = JSON.stringify(elmsHTML)
    localStorage.setItem('elms', jsonString)
})

const template = document.createElement('template')
template.innerHTML = `
<div>
    <button class="up">⬆</button>
    <button class="down">⬇</button>
</div>
<div>
    <div>
        <label>Search: <input type="text" class="search"></label>
        <label>Year: <input type="number" class="year"></label>
        <label>IMDb ID: <input type="text" class="imdb"></label>
        <button class="update">Update</button>
        <button class="remove">Remove</button>
    </div>
    <div class="title-wrapper">
        <span class="title"></span>
        <label class="minute-label">Minutes: <input type="number" value="0" min="0" class="minutes"></label>
    </div>
</div>
<div>
    <img class="poster">
</div>
`

customElements.define('elm-', class extends HTMLElement {
    constructor() {
        super()
        this._temp = []
    }
    connectedCallback() {
        if (!this.hasChildNodes()) {
            this.append(template.content.cloneNode(true))
        }
        if (!this._init) {
            this._init = true
            const query = this.querySelector.bind(this)

            const update = query('.update')
            const remove = query('.remove')
            const minutes = query('.minutes')
            const year = query('.year')
            const search = query('.search')
            const title = query('.title')
            const imdb = query('.imdb')
            const up = query('.up')
            const down = query('.down')
            const poster = query('.poster')
            this.update = update
            this.minutes = minutes
            this.year = year
            this.search = search
            this.poster = poster
            let errCount = 0
            const errFunc = () => {
                this.classList.add('err')
                poster.src = ''
                poster.alt = ''
            }
            const resFunc = e => {
                this.json = e
                title.innerHTML = ''
                if (e.Response === 'True') {
                    errCount = 0
                    const link = document.createElement('a')
                    link.href = 'https://www.imdb.com/title/' + e.imdbID
                    link.target = '_blank'
                    link.textContent = `${e.Title} (${e.Year})`
                    const technical = link.cloneNode()
                    technical.href += '/technical'
                    technical.textContent = 'versions'
                    title.append(link, ' — ', technical)
                    if (!e.Runtime || e.Runtime === 'N/A')
                        minutes.value = 0
                    else
                        minutes.value = e.Runtime.replace(/\D/g, '')
                    poster.src = e.Poster
                    poster.alt = `${e.Title} poster`
                } else if (e.Response === 'False') {
                    errCount++
                    let content = e.Error
                    if (e.Error === 'Movie not found!')
                        content += ' Try adding a year, search term, or IMDb ID.'
                    else if (e.Error === 'Incorrect IMDb ID.')
                        content += ' Try adding a year, search term, or IMDb ID.'
                    content += ` Error count: ${errCount}`
                    title.append(content)
                    errFunc()
                }
            }
            update.addEventListener('click', () => {
                title.innerHTML = 'Loading...'
                this.classList.remove('err')
                const baseUrl = `https://www.omdbapi.com/?apikey=${apikey || default_apikey}`
                const queryUrl = imdb.value
                    ? `&i=${imdb.value}`
                    : `&t=${search.value.trim()}&y=${year.value}`
                fetch(baseUrl + queryUrl)
                    .then(res => res.json())
                    .then(resFunc)
                    .catch(err => {
                        title.innerHTML = err.message
                        errFunc()
                    })
            })
            remove.addEventListener('click', () => {
                this.remove()
            })
            up.addEventListener('click', () => {
                this.previousElementSibling?.before(this)
            })
            down.addEventListener('click', () => {
                this.nextElementSibling?.after(this)
            })
            this._temp.forEach(argList => {
                this.attributeChangedHandler(...argList)
            })
        }
    }
    static get observedAttributes() {
        return ['text', 'minutes', 'json', 'search', 'year']
    }
    attributeChangedCallback() {
        if (!this._init) {
            this._temp.push(arguments)
            return
        } else
            this.attributeChangedHandler(...arguments)
    }
    attributeChangedHandler(name, oldVal, newVal) {
        if (name === 'text') {
            const val = newVal.trim()
            if (newVal !== val)
                this.setAttribute(name, val)
            this.search.value = val
        } else if (name === 'minutes') {
            this.minutes.value = newVal
        } else if (name === 'json') {
            try {
                this.json = JSON.parse(newVal)
            } catch (err) {
                console.error(err);
            }
        } else if (name === 'search') {
            this.search.value = newVal
        } else if (name === 'year') {
            this.year.value = newVal
        }
    }
})
