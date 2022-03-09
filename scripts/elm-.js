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
        this.init()
    }
    static get observedAttributes() {
        return ['text', 'minutes', 'json', 'search', 'year', 'imdb']
    }
    attributeChangedCallback() {
        if (!this._init)
            this._temp.push(arguments)
        else
            this.attributeChangedHandler(...arguments)
    }
    attributeChangedHandler(name, oldVal, newVal) {
        if (window.isUnloading)
            return
        if (name === 'text') {
            const val = newVal.trim()
            if (newVal !== val)
                this.setAttribute(name, val)
            else
                this.search.value = val
        } else if (name === 'json') {
            try {
                const json = JSON.parse(newVal)
                this.resFunc(json)
                this.json = json
            } catch (err) {
                console.error(err);
            }
        } else {
            this[name].value = newVal
        }
    }
    init() {
        if (this._init)
            return
        if (!this.hasChildNodes())
            this.append(template.content.cloneNode(true))
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
        this.imdb = imdb
        this.poster = poster
        let errCount = 0
        this.errFunc = () => {
            minutes.value = 0
            this.classList.add('err')
            poster.removeAttribute('src')
            poster.removeAttribute('alt')
        }
        this.resFunc = e => {
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
                if (e.minutes)
                    minutes.value = e.minutes
                else if (!e.Runtime || e.Runtime === 'N/A')
                    minutes.value = 0
                else
                    minutes.value = e.Runtime.replace(/\D/g, '') || e.minutes
                if (e.Poster && e.Poster !== 'N/A') {
                    poster.src = e.Poster
                    poster.alt = `${e.Title} poster`
                }
            } else if (e.Response === 'False') {
                errCount++
                let content = e.Error
                if (e.Error === 'Movie not found!')
                    content += ' Try adding a year, search term, or IMDb ID.'
                else if (e.Error === 'Incorrect IMDb ID.')
                    content += ' Try adding a year, search term, or IMDb ID.'
                content += ` Error count: ${errCount}`
                title.append(content)
                this.errFunc()
            }
        }
        update.addEventListener('click', () => {
            if (!this.search.value && !this.imdb.value)
                return
            title.innerHTML = 'Loading...'
            this.classList.remove('err')
            const baseUrl = `https://www.omdbapi.com/?apikey=${apikey || default_apikey}`
            const queryUrl = imdb.value
                ? `&i=${imdb.value}`
                : `&t=${search.value.trim()}&y=${year.value}`
            fetch(baseUrl + queryUrl)
                .then(res => res.json())
                .then(this.resFunc)
                .catch(err => {
                    title.innerHTML = err.message
                    this.errFunc()
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
        this._temp = []
    }
})
