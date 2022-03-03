const default_apikey = '80bf610a'
let apikey

const apikeyElm = document.querySelector('.apikey')
const section = document.querySelector('section.elm')
const add = document.querySelector('.add')
const textarea = document.querySelector('.split .text')
const generate = document.querySelector('.generate')
const split = document.querySelector('textarea.split')
const list = document.querySelector('.list')
const listText = document.querySelector('.list textarea')
const updateAll = document.querySelector('.update-all')
const format = document.querySelector('.format')
const number = document.querySelector('.list [type="number"]')
const keyPlaceholder = document.querySelector('.key-placeholder')
const keyLink = document.querySelector('.key-link')

const storageKey = sessionStorage.getItem('apikey')
const urlKey = new URL(location).searchParams.get('apikey')
if (storageKey)
    apikey = storageKey
else if (urlKey)
    apikey = urlKey
const updateKeyLink = function (key) {
    sessionStorage.setItem('apikey', key || '')
    keyPlaceholder.textContent = key || 'KEY'
    keyLink.href = '?apikey=' + key || 'KEY'
}
updateKeyLink(apikey)
apikeyElm.value = apikey || ''
apikeyElm.addEventListener('input', function () {
    apikey = this.value
    updateKeyLink(apikey)
})
textarea.value = localStorage.getItem('textarea') || 'Aladdin ⏩ The Hangover'
split.value = localStorage.getItem('split') || ' ⏩ '
textarea.addEventListener('change', function () {
    localStorage.setItem('textarea', this.value)
})
split.addEventListener('change', function () {
    localStorage.setItem('split', this.value)
})
format.addEventListener('click', () => {
    const elms = Array.from(document.querySelectorAll('elm-'))
    const arr = elms.filter(e => e.minutes.value > 0)
    const dates = getList(arr, number.value)
    const offset = new Date().getTimezoneOffset() / - 60
    let offsetResult
    const offsetType = Math.sign(offset)
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
    listText.value = `[UTC${offsetResult}] ${dates.join(' ⏩ ')}`
})
add.addEventListener('click', () => {
    section.insertAdjacentHTML('beforeend', `<elm-></elm->`)
})
generate.addEventListener('click', () => {
    const value = textarea.value
    const arr = value.split(split.value)
    arr.forEach(val => {
        const elm = document.createElement('elm-')
        section.append(elm)
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

const template = document.createElement('template')
template.innerHTML = `<div class="wrap">
<label>Search: <input type="text"></label>
<label>Year: <input type="text" class="year"></label>
<button class="update">Update</button>
<button class="remove">Remove</button>
<label>Minutes: <input type="number" value="0" min="0" class="minutes"></label>
<div class="title"></div>
</div>
`

customElements.define('elm-', class extends HTMLElement {
    constructor() {
        super()
    }
    connectedCallback() {
        if (!this.hasChildNodes()) {
            this.append(template.content.cloneNode(true))
            const update = this.querySelector('.update')
            const remove = this.querySelector('.remove')
            const minutes = this.querySelector('.minutes')
            const year = this.querySelector('.year')
            const input = this.querySelector('input')
            const title = this.querySelector('.title')
            this.minutes = minutes
            this.update = update
            this.input = input
            let errCount = 0
            update.addEventListener('click', () => {
                title.innerHTML = 'Loading...'
                this.classList.remove('err')
                fetch(`https://www.omdbapi.com/?apikey=${apikey || default_apikey}&t=${input.value}&y=${year.value}`)
                    .then(e => e.json())
                    .then(e => {
                        title.innerHTML = ''
                        let content
                        errCount++
                        if (e.Title || e.Year) {
                            errCount = 0
                            content = document.createElement('a')
                            content.href = 'https://www.imdb.com/title/' + e.imdbID
                            content.target = '_blank'
                            content.textContent = `${e.Title} ${e.Year}`
                        } else if (e.Error === 'Movie not found!')
                            content = e.Error + ' Try adding a year, or different search term.' + ' Error count:  ' + errCount
                        else
                            content = e.Error + ' Error count:' + errCount
                        title.append(content)
                        if (e.Runtime === undefined) {
                            this.classList.add('err')
                            minutes.value = 0
                            return
                        }
                        minutes.value = e.Runtime.replace(/\D/g, '')
                    })
            })
            remove.addEventListener('click', () => {
                this.remove()
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