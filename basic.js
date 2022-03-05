const default_apikey = '80bf610a'
let apikey

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
const number = query('.number')
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
split.value = localStorage.getItem('split') || ' ⏩ '
const time = sessionStorage.getItem('start-time')
startTime.value = time
currentTime.textContent = time
join.value = localStorage.getItem('join') || ' ⏩ '
tail.value = localStorage.getItem('tail') || 'Cartoons'
preset.value = sessionStorage.getItem('preset') || preset.value

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

clearTime.addEventListener('click', () => {
    startTime.value = ''
    currentTime.textContent = ''
    sessionStorage.removeItem('start-time')
})
format.addEventListener('click', () => {
    const elms = Array.from(document.querySelectorAll('elm-'))
    const arr = elms.filter(e => e.minutes.value > 0)
    const list = getList(arr, number.value, startTime.value, preset.value)
    const offset = new Date().getTimezoneOffset() / - 60
    const offsetType = Math.sign(offset)
    let offsetResult
    switch (offsetType) {
        case 1:
            offsetResult = '+' + offset
            break;
        case -1:
            offsetResult = '-' + offset
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
        if (e.input.value)
            e.update.click()
    })
})
removeAll.addEventListener('click', () => {
    const elms = document.querySelectorAll('elm-')
    elms.forEach(e => e.remove())
})

const template = document.createElement('template')
template.innerHTML = `
<button class="up">⬆</button>
<label>Search: <input type="text"></label>
<label>Year: <input type="number" class="year"></label>
<label>IMDb ID: <input type="text" class="imdb"></label>
<button class="update">Update</button>
<button class="remove">Remove</button>
<div class="title-wrapper">
    <button class="down">⬇</button>
    <span class="title"></span>
    <label>Minutes: <input type="number" value="0" min="0" class="minutes"></label>
</div>
`

customElements.define('elm-', class extends HTMLElement {
    constructor() {
        super()
    }
    connectedCallback() {
        if (!this.hasChildNodes()) {
            this.append(template.content.cloneNode(true))
            const query = this.querySelector.bind(this)

            const update = query('.update')
            const remove = query('.remove')
            const minutes = query('.minutes')
            const year = query('.year')
            const input = query('input')
            const title = query('.title')
            const imdb = query('.imdb')
            const up = query('.up')
            const down = query('.down')
            this.minutes = minutes
            this.update = update
            this.input = input
            let errCount = 0
            const resFunc = e => {
                this.json = e
                title.innerHTML = ''
                let content = ''
                if (e.Response === 'True') {
                    errCount = 0
                    content = document.createElement('a')
                    content.href = 'https://www.imdb.com/title/' + e.imdbID
                    content.target = '_blank'
                    content.textContent = `${e.Title} ${e.Year}`
                    if (!e.Runtime || e.Runtime === 'N/A')
                        minutes.value = 0
                    else
                        minutes.value = e.Runtime.replace(/\D/g, '')
                } else if (e.Response === 'False') {
                    errCount++
                    content = e.Error
                    if (e.Error === 'Movie not found!')
                        content += ' Try adding a year, or IMDb ID.'
                    content += ` Error count: ${errCount}`
                    this.classList.add('err')
                }
                title.append(content)
            }
            update.addEventListener('click', () => {
                title.innerHTML = 'Loading...'
                this.classList.remove('err')
                const baseUrl = `https://www.omdbapi.com/?apikey=${apikey || default_apikey}`
                const queryUrl = imdb.value
                    ? `&i=${imdb.value}`
                    : `&t=${input.value}&y=${year.value}`
                fetch(baseUrl + queryUrl)
                    .then(res => res.json())
                    .then(resFunc)
                    .catch(err => {
                        title.innerHTML = err.message
                        this.classList.add('err')
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
        }
    }
    static get observedAttributes() {
        return ['text']
    }
    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'text') {
            this.input.value = newVal
        }
    }
})
