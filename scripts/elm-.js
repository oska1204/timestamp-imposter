const template = document.createElement('template')
template.innerHTML = `
<div>
    <button class="up">⬆</button>
    <button class="drag">:::</button>
    <button class="down">⬇</button>
</div>
<div>
    <div>
        <label><input type="text" class="search" placeholder="Search"></label>
        <label><input type="number" class="year" placeholder="Year"></label>
        <label><input type="text" class="imdb" placeholder="IMDb ID/Link"></label>
        <select class="select-type">
            <option value="">--type--</option>
            <option value="movie">Movie</option>
            <option value="series">Series</option>
            <option value="episode">Episode</option>
        </select>
        <button class="update">Update</button>
        <button class="remove">Remove</button>
    </div>
    <div class="select-title-wrapper">
        <select class="select-title"></select>
        <label>s<input type="number" class="season" placeholder="Season" min="0"></label>
        <label>ep<input type="number" class="episode" placeholder="Episode" min="0"></label>
    </div>
    <div class="title-wrapper">
        <span class="title"></span>
        <div class="warning-wrapper" hidden>
            <div class="warning-outer">
                <div class="warning-inner">
                    <span>!</span>
                </div>
            </div>
            <span>might be wrong title</span>
        </div>
        <label class="minute-label">Minutes: <input type="number" value="0" min="0" class="minutes"></label>
    </div>
</div>
<div>
    <img class="poster" width="100" height="150">
</div>
<div class="loading-overlay">
    <div class="circle"></div>
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
        return [
            'text',
            'minutes',
            'json',
            'search',
            'year',
            'imdb',
            'select_type',
            'select_title',
            'title_json',
            'season',
            'episode'
        ]
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
        } else if (name === 'imdb') {
            this[name].value = newVal.match(this.imdbIDRegex)?.toString() || newVal
        } else if (name === 'json') {
            try {
                const json = JSON.parse(newVal)
                this.resFunc(json)
                this.json = json
            } catch (err) {
                console.error(err);
            }
        } else if (name === 'title_json') {
            try {
                if (!newVal)
                    return
                const json = JSON.parse(newVal)
                this.titleJson = json
                this.formatSearch(json)
                this['select_title'].value = this.getAttribute('select_title')
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
        const drag = query('.drag')
        const selectType = query('.select-type')
        const selectTitle = query('.select-title')
        const season = query('.season')
        const episode = query('.episode')
        this.update = update
        this.minutes = minutes
        this.year = year
        this.search = search
        this.imdb = imdb
        this.poster = poster
        this.select_type = selectType
        this.select_title = selectTitle
        this.season = season
        this.episode = episode

        const imdbIDRegex = /[a-z]{2}\d{7,}/
        this.imdbIDRegex = imdbIDRegex
        let errCount = 0
        const updateEnter = elm =>
            elm.addEventListener('keyup', e => {
                if (e.key === 'Enter')
                    this.updateFunc()
            })
        updateEnter(search)
        updateEnter(year)
        updateEnter(imdb)
        imdb.addEventListener('change', function () {
            this.value = this.value.match(imdbIDRegex)?.toString() || this.value
        })
        selectType.addEventListener('change', () => {
            this.updateFunc()
        })
        const updateChange = elm => {
            elm.addEventListener('change', () => {
                if (elm.valueAsNumber <= 0 && elm.valueAsNumber !== undefined)
                    elm.value = ''
                const [id, type] = selectTitle.value.split(',')
                if (type === 'series' && (
                    season.value === '' && episode.value !== '' ||
                    season.value !== '' && episode.value === '') &&
                    (elm === season || elm === episode)
                )
                    return
                this.classList.remove('err')
                let queryUrl = `&i=${id}`
                if (type === 'series' && !(
                    season.value === '' && episode.value !== '' ||
                    season.value !== '' && episode.value === '' ||
                    season.value === '' && episode.value === ''
                ))
                    queryUrl += `&season=${season.value}&episode=${episode.value}`
                if (type !== 'series' && (
                    elm === season ||
                    elm === episode
                ))
                    return
                fetchApi(this.resFunc, queryUrl)
            })
        }
        updateChange(selectTitle)
        updateChange(season)
        updateChange(episode)
        minutes.addEventListener('change', function () {
            if (this.value !== '0')
                this.classList.remove('err')
        })
        this.errFunc = () => {
            minutes.value = 0
            this.classList.add('err')
        }
        const resFalse = e => {
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
        this.resFunc = e => {
            this.json = e
            title.innerHTML = ''
            if (e.Response === 'True') {
                errCount = 0
                const link = document.createElement('a')
                link.href = 'https://www.imdb.com/title/' + e.imdbID
                link.target = '_blank'
                link.rel = 'noopener noreferrer'
                link.textContent = `${e.Title} (${e.Year})`
                const technical = link.cloneNode()
                technical.href += '/technical'
                technical.textContent = 'versions'
                title.append(link, ' — ', technical)
                minutes.classList.remove('err')
                if (e.minutes)
                    minutes.value = e.minutes
                else if (!e.Runtime || e.Runtime === 'N/A') {
                    minutes.value = 0
                    minutes.classList.add('err')
                } else
                    minutes.value = e.Runtime.replace(/\D/g, '') || e.minutes
                if (e.Poster && e.Poster !== 'N/A') {
                    poster.src = e.Poster
                    poster.alt = `${e.Title} poster`
                }
                if (e.Type === 'movie') {
                    this.classList.add('movie')
                } else {
                    this.classList.remove('movie')
                }
            } else if (e.Response === 'False') {
                resFalse(e)
            }
            return e
        }
        this.formatSearch = searchArr => {
            searchArr.forEach(f => {
                selectTitle.insertAdjacentHTML('beforeend', `
                    <option value="${f.imdbID},${f.Type}">${f.Title} (${f.Year})</option>
                `)
            })
        }
        const minTitle = str => {
            return str.replace(/\W/g, e => {
                if (e === ' ')
                    return ' '
                return ''
            }).match(/\w+/g).join(' ').toLowerCase()
        }
        this.searchFunc = e => {
            title.innerHTML = 'Loading...'
            selectTitle.innerHTML = ''
            if (e.Response === 'True') {
                this.titleJson = e.Search
                const s = e.Search[0]
                if (minTitle(s.Title) !== minTitle(search.value))
                    this.classList.add('warning')
                else
                    this.classList.remove('warning')
                let queryUrl = `&i=${s.imdbID}`
                if (s.Type === 'series' && !(
                    season.value === '' && episode.value !== '' ||
                    season.value !== '' && episode.value === '' ||
                    season.value === '' && episode.value === ''
                ))
                    queryUrl += `&season=${season.value}&episode=${episode.value}`
                fetchApi(this.resFunc, queryUrl)
                selectTitle.innerHTML = ''
                this.formatSearch(e.Search)
            } else if (e.Response === 'False') {
                resFalse(e)
            }
            return e
        }
        const fetchApi = (fn, queryUrl, extraFn = ff => ff) => {
            const baseUrl = `https://www.omdbapi.com/?apikey=${apikey || default_apikey}`
            this.classList.add('loading')
            poster.removeAttribute('src')
            poster.removeAttribute('alt')
            return fetch(baseUrl + queryUrl)
                .then(res => res.json())
                .then(fn)
                .then(extraFn)
                .then(e => {
                    this.classList.remove('loading')
                    return e
                })
                .catch(err => {
                    title.innerHTML = err.message
                    this.errFunc()
                    this.classList.remove('loading')
                })
        }
        this.updateFunc = () => {
            if (!this.search.value && !this.imdb.value)
                return
            title.innerHTML = 'Loading...'
            this.classList.remove('err')
            if (imdb.value.match(imdbIDRegex)) {
                fetchApi(this.resFunc, `&i=${imdb.value}`, e => {
                    this.titleJson = [e]
                    selectTitle.innerHTML = `
                        <option value="${e.imdbID},${e.Type}">${e.Title} (${e.Year})</option>
                    `
                })
            } else {
                fetchApi(this.searchFunc, `&s=${search.value.trim()}&y=${year.value}&type=${selectType.value}`)
            }
        }
        update.addEventListener('click', this.updateFunc)
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
        const mouseMove = (e, f) => {
            const val = f.pageY - e.layerY - this.offsetTop
            this.style.transform = `translate(0, ${val}px)`
            this.mouseMoveVal = f.pageY - e.layerY
        }
        const mouseUp = (e, f) => {
            if (this.mouseMoveVal) {
                const offsetTop = this.mouseMoveVal
                const firstElm = elmWrapper.firstElementChild
                const lastElm = elmWrapper.lastElementChild
                if (offsetTop < firstElm.offsetTop)
                    elmWrapper.prepend(this)
                if (offsetTop > lastElm.offsetTop)
                    elmWrapper.append(this)
                for (const g of elmWrapper.children) {
                    const topLine = g.offsetTop
                    const bottomLine = topLine + g.offsetHeight
                    if (topLine < offsetTop && bottomLine > offsetTop) {
                        g.after(this)
                        break
                    }
                }
            }
            this.style.zIndex = ''
            this.style.background = ''
            this.style.transform = ''
            document.removeEventListener('mousemove', this.mouseMove)
            document.removeEventListener('mouseup', this.mouseUp)
            this.mouseMoveVal = null
        }
        drag.onmousedown = e => {
            this.style.zIndex = '1'
            this.style.background = '#8888'
            this.mouseMove = mouseMove.bind(this, e)
            this.mouseUp = mouseUp.bind(this, e)
            document.addEventListener('mousemove', this.mouseMove)
            document.addEventListener('mouseup', this.mouseUp)
        }
    }
})
