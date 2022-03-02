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

textarea.value = localStorage.getItem('textarea') || 'Aladdin ⏩ The Hangover'
split.value = localStorage.getItem('split') || ' ⏩ '
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
textarea.addEventListener('change', function () {
    localStorage.setItem('textarea', this.value)
})
split.addEventListener('change', function () {
    localStorage.setItem('split', this.value)
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
template.innerHTML = `<div>
<label>Search: <input type="text"></label>
<button class="update">Update</button>
<button class="remove">Remove</button>
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
            const update = this.querySelector('.update')
            const remove = this.querySelector('.remove')
            const minutes = this.querySelector('.minutes')
            const input = this.querySelector('input')
            this.minutes = minutes
            this.update = update
            this.input = input
            update.addEventListener('click', () => {
                fetch('https://www.omdbapi.com/?apikey=80bf610a&t=' + input.value)
                    .then(e => e.json())
                    .then(e => {
                        if (e.Runtime === undefined) {
                            this.classList.add('err')
                            return
                        }
                        minutes.value = e.Runtime.replace(/\D/g, '')
                        this.classList.remove('err')
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