const template = document.createElement('template')
template.innerHTML = `
<div>
    <button class="up">⬆</button>
    <div class="drag">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
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
        <label class="exclude"><input data-_exclude type="checkbox"></label>
    </div>
    <div class="select-title-wrapper">
        <select class="select-title"></select>
        <label>S<input type="number" class="season" placeholder="Season" min="0"></label>
        <label>E<input type="number" class="episode" placeholder="Episode" min="0"></label>
        <div class="warning-wrapper">
            <div class="warning-icon">
                <div class="warning-outer">
                    <div class="warning-inner">
                        <span>!</span>
                    </div>
                </div>
            </div>
            <span class="warning-span">might be wrong title</span>
        </div>
    </div>
    <div class="title-wrapper">
        <span class="info-button" hidden>
            <span>i</span>
        </span>
        <span class="title"></span>
        <span class="rated" hidden><span></span></span>
        <label class="minute-label">Minutes: <input type="number" value="0" min="0" class="minutes"></label>
    </div>
    <div class="info-outer-wrapper">
        Access custom format <code>\${j.&lt;name>}</code>. Example <code>\${j.Released}</code>
        <label>Full plot: <input type="checkbox" class="full-plot"></label>
        <div class="info-wrapper"></div>
    </div>
</div>
<div class="poster-wrapper">
    <img class="poster" width="100" height="150">
</div>
<div class="poster-overlay"></div>
<div class="loading-overlay">
    <div class="circle"></div>
</div>
`

const infoDiv = document.createElement('div')
infoDiv.appendChild(document.createElement('span'))
infoDiv.insertAdjacentHTML('beforeend', `<span class="seperator">: </span>`)
infoDiv.appendChild(document.createElement('span'))

const optionElm = document.createElement('option')

customElements.define('elm-', class extends HTMLElement {
    constructor() {
        super()
        this._temp = []
    }
    connectedCallback() {
        this.init()
    }
    disconnectedCallback() {
        elmWrapper.dispatchEvent(new CustomEvent('elm-removed', { bubbles: true }))
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
            'episode',
            'update',
            'full_plot',
            'exclude',
        ]
    }
    attributeChangedCallback() {
        if (!this._init)
            this._temp.push(arguments)
        else
            this.attributeChangedHandler(...arguments)
    }
    attributeChangedHandler(name, oldVal, newVal) {
        if (name === 'text') {
            const val = newVal.trim()
            if (newVal !== val)
                this.setAttribute(name, val)
            else
                this.search.value = val
        } else if (name === 'year') {
            if (newVal.length === 2) {
                const d = new Date()
                const firstPart = d.getFullYear().toString().slice(0, -2)
                let isWhat = firstPart + newVal
                if (isWhat > d.getFullYear())
                    isWhat = firstPart - 1 + newVal
                this.year.value = isWhat
            } else {
                this.year.value = newVal
            }
        } else if (name === 'imdb') {
            this[name].value = newVal.match(this.imdbIDRegex)?.toString() || newVal
        } else if (name === 'json') {
            if (!newVal)
                return
            try {
                const json = JSON.parse(newVal)
                this.resFunc(json)
                this.json = json
                this.removeAttribute('json')
            } catch (err) {
                console.error(err);
            }
        } else if (name === 'title_json') {
            if (!newVal)
                return
            try {
                const json = JSON.parse(newVal)
                this.titleJson = json
                this.formatSearch(json)
                this['select_title'].value = this.getAttribute('select_title')
                this.removeAttribute('title_json')
            } catch (err) {
                console.error(err);
            }
        } else if (name === 'update') {
            if (newVal === null)
                return
            this.updateFunc()
            this.removeAttribute('update')
        } else if (name === 'exclude') {
            if (newVal === null)
                this.exclude.checked = false
            else
                this.exclude.checked = true
        } else if (name === 'full_plot') {
            if (newVal === null)
                this.fullPlot.checked = false
            else
                this.fullPlot.checked = true
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
        const rated = query('.rated')
        const infoButton = query('.info-button')
        const infoOuterWrapper = query('.info-outer-wrapper')
        const infoWrapper = query('.info-wrapper')
        const posterWrapper = query('.poster-wrapper')
        const posterOverlay = query('.poster-overlay')
        const warningWrapper = query('.warning-wrapper')
        const fullPlot = query('.full-plot')
        const exclude = query('.exclude input')
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
        this.rated = rated
        this.fullPlot = fullPlot
        this.exclude = exclude

        const imdbIDRegex = /[a-z]{2}\d{7,}/
        this.imdbIDRegex = imdbIDRegex
        let errCount = 0
        this.infoFunc = () => {
            infoWrapper.innerHTML = ''
            const newDiv = (key, elm) => {
                const div = infoDiv.cloneNode(true)
                const [span1, , span2] = div.children
                span1.textContent = key
                span2.textContent = elm
                return div
            }
            for (const key in this.json) {
                const element = this.json[key]
                if (key === 'minutes')
                    break
                if (typeof element === 'string')
                    infoWrapper.appendChild(newDiv(key, element))
                else if (key === 'Ratings')
                    element.forEach(obj => {
                        const { Source, Value } = obj
                        if (Source === 'Rotten Tomatoes')
                            infoWrapper.appendChild(newDiv('Tomato', Value))
                    })
                else
                    infoWrapper.appendChild(newDiv(key, JSON.stringify(element, null, 2)))
            }
        }
        this.isInfoOn = () => infoOuterWrapper.classList.contains('info')
        infoButton.addEventListener('click', () => {
            const isOn = infoOuterWrapper.classList.toggle('info')
            if (isOn && this.json)
                this.infoFunc()
        })
        year.addEventListener('change', () => {
            if (year.value.length === 2) {
                const d = new Date()
                const firstPart = d.getFullYear().toString().slice(0, -2)
                let isWhat = firstPart + year.value
                if (isWhat > d.getFullYear())
                    isWhat = firstPart - 1 + year.value
                year.value = isWhat
            }
        })
        imdb.addEventListener('change', function () {
            this.value = this.value.match(imdbIDRegex)?.toString() || this.value
        })
        const updateSearch = elm =>
            elm.addEventListener('change', () => this.updateFunc())
        updateSearch(search)
        updateSearch(year)
        updateSearch(imdb)
        selectType.addEventListener('change', () => {
            this.updateFunc()
            if (selectType.value === 'movie') {
                this.classList.add('movie')
                this.classList.remove('series')
            } else {
                this.classList.remove('movie')
                this.classList.add('series')
            }
        })
        const updateChange = elm => {
            elm.addEventListener('change', () => {
                if (elm.valueAsNumber <= 0 && elm.valueAsNumber !== undefined)
                    elm.value = ''
                const selected = selectTitle.children[selectTitle.value]
                const { id, type, title } = selected.dataset
                if (type === 'series' && (
                    season.value === '' && episode.value !== '' ||
                    season.value !== '' && episode.value === '') &&
                    (elm === season || elm === episode)
                )
                    return
                if (type !== 'series' && (
                    elm === season ||
                    elm === episode
                ))
                    return
                this.classList.remove('err')
                let queryUrl = `&i=${id}`
                if (fullPlot.checked)
                    queryUrl += '&plot=full'
                if (season.value === '' && episode.value === '')
                    fetchApi(this.resFunc, queryUrl)
                if (type === 'series' && !(
                    season.value === '' && episode.value !== '' ||
                    season.value !== '' && episode.value === '' ||
                    season.value === '' && episode.value === ''
                )) {
                    const extraQueryUrl = queryUrl
                    queryUrl += `&season=${season.value}&episode=${episode.value}`
                    fetchApi(this.epFunc, queryUrl, e => {
                        if (e.Response === 'False')
                            fetchApi(this.resFunc, extraQueryUrl)
                        return e
                    })
                }
            })
        }
        updateChange(selectTitle)
        updateChange(season)
        updateChange(episode)
        updateChange(fullPlot)
        minutes.addEventListener('change', function () {
            if (this.value !== '0')
                this.classList.remove('err')
        })
        this.errFunc = () => {
            minutes.value = 0
            this.classList.add('err')
            poster.removeAttribute('src')
            poster.removeAttribute('alt')
            infoButton.hidden = true
            infoWrapper.innerHTML = ''
            infoOuterWrapper.classList.remove('info')
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
            if (e.seriesID)
                e.seriesID = e.seriesID?.replace(/t+/, 'tt')
            const selectTitleId = selectTitle.children[selectTitle.value]?.dataset.id
            if (e.imdbID !== selectTitleId &&
                e.seriesID !== selectTitleId &&
                selectTitle.value)
                return
            this.json = e
            this.dispatchEvent(new CustomEvent('send-data', { bubbles: true }))
            if (this.isInfoOn())
                this.infoFunc()
            title.innerHTML = ''
            if (e.Response === 'True') {
                errCount = 0
                const link = document.createElement('a')
                link.href = 'https://www.imdb.com/title/' + e.imdbID
                link.rel = 'noopener noreferrer'
                link.textContent = `${e.Title} (${e.Year})`
                const technical = link.cloneNode()
                technical.href += '/technical'
                technical.textContent = 'versions'
                title.append(link, ' — ', technical)
                minutes.classList.remove('err')
                const imdbVotesNum = parseInt(e.imdbVotes?.replace(/,/g, ''))
                if (e.imdbVotes === 'N/A' ||
                    imdbVotesNum < 1000)
                    this.classList.add('warning', 'warning-red')
                else
                    this.classList.remove('warning-red')
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
                } else {
                    poster.removeAttribute('src')
                    poster.removeAttribute('alt')
                }
                if (e.Type === 'movie') {
                    this.classList.add('movie')
                    this.classList.remove('series')
                } else {
                    this.classList.remove('movie')
                    this.classList.add('series')
                }
                if (e.Rated === 'N/A' ||
                    !e.Rated ||
                    e.Rated === 'Not Rated') {
                    rated.textContent = 'Not Rated'
                    rated.classList.add('warn')
                } else
                    rated.textContent = `Rated ${e.Rated}`
                infoButton.hidden = false
                rated.hidden = false
                if (e.Rated === 'R' ||
                    e.Rated === 'TV-MA' ||
                    e.Rated === 'X')
                    rated.classList.add('warn')
            } else if (e.Response === 'False') {
                resFalse(e)
            }
            return e
        }
        this.epFunc = e => {
            if (e.Response === 'True')
                this.resFunc(e)
            return e
        }
        const optionFn = (e, i = 0) => {
            const option = optionElm.cloneNode()
            option.value = i
            option.dataset.title = e.Title
            option.dataset.id = e.imdbID
            option.dataset.type = e.Type
            option.textContent = `${e.Title} (${e.Year})`
            selectTitle.appendChild(option)
        }
        this.formatSearch = searchArr => {
            searchArr.forEach((e, i) => {
                optionFn(e, i)
            })
        }
        const minTitle = str => {
            return str.replace(/\W|\s/g, ' ')
                .match(/\w+/g)
                .join(' ')
                .toLowerCase()
        }
        this.searchFunc = async e => {
            title.innerHTML = ''
            selectTitle.innerHTML = ''
            if (e.Response === 'True') {
                title.innerHTML = 'Loading...'
                const searchFiltered = e.Search.filter(e => e.Type !== 'game')
                const searchArr = searchFiltered
                this.titleJson = searchFiltered
                this.formatSearch(searchFiltered)
                const minTitleFunc = f => minTitle(f.Title) === minTitle(search.value)
                let index = searchArr.findIndex(minTitleFunc)
                if (index === -1)
                    index = 0
                selectTitle.value = selectTitle.children[index].value
                const s = searchArr[index]
                if (minTitle(s.Title) !== minTitle(search.value) ||
                    searchArr.slice(1).findIndex(minTitleFunc) !== -1)
                    this.classList.add('warning')
                let queryUrl = `&i=${s.imdbID}`
                if (fullPlot.checked)
                    queryUrl += '&plot=full'
                await fetchApi(this.resFunc, queryUrl)
                if (s.Type === 'series' && !(
                    season.value === '' && episode.value !== '' ||
                    season.value !== '' && episode.value === '' ||
                    season.value === '' && episode.value === ''
                )) {
                    queryUrl += `&season=${season.value}&episode=${episode.value}`
                    fetchApi(this.epFunc, queryUrl)
                }
            } else if (e.Response === 'False') {
                if (e.Error === 'Too many results.') {
                    let queryUrl = `&t=${encodeURIComponent(search.value.trim())}`
                    if (fullPlot.checked)
                        queryUrl += '&plot=full'
                    queryUrl += `&y=${year.value}&type=${selectType.value}`
                    fetchApi(this.resFunc, queryUrl, extraFn)
                } else
                    resFalse(e)
            }
            return e
        }
        const fetchApi = (fn, queryUrl, extraFn = ff => ff) => {
            const baseUrl = `https://www.omdbapi.com/?apikey=${apikey || default_apikey}`
            this.classList.add('loading')
            rated.classList.remove('err')
            rated.textContent = ''
            rated.hidden = true
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
        const extraFn = e => {
            this.titleJson = [e]
            selectTitle.innerHTML = ''
            if (e.Response === 'True') {
                if (e.seriesID && e.seriesID !== 'N/A') {
                    fetchApi(f => {
                        if (f.Response === 'True') {
                            this.titleJson = [f]
                            optionFn(f)
                            season.value = e.Season
                            episode.value = e.Episode
                        }
                    }, `&i=${e.seriesID}`)
                } else
                    optionFn(e)
            }
            return e
        }
        this.updateFunc = () => {
            if (!this.search.value && !this.imdb.value)
                return
            title.innerHTML = 'Loading...'
            this.classList.remove('err')
            this.classList.remove('warning')
            this.json = []
            this.titleJson = []
            if (imdb.value.match(imdbIDRegex)) {
                let queryUrl = `&i=${imdb.value}`
                if (fullPlot.checked)
                    queryUrl += '&plot=full'
                fetchApi(this.resFunc, queryUrl, extraFn)
            } else {
                let queryUrl = `&s=${encodeURIComponent(search.value.trim())}`
                queryUrl += `&y=${year.value}&type=${selectType.value}`
                fetchApi(this.searchFunc, queryUrl)
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
            this.classList.remove('drag-elm')
            this.style.transform = ''
            document.removeEventListener('pointermove', this.mouseMove)
            document.removeEventListener('mouseup', this.mouseUp)
            this.mouseMoveVal = null
        }
        drag.addEventListener('mousedown', e => {
            this.classList.add('drag-elm')
            this.mouseMove = mouseMove.bind(this, e)
            this.mouseUp = mouseUp.bind(this, e)
            document.addEventListener('pointermove', this.mouseMove)
            document.addEventListener('mouseup', this.mouseUp)
        })
        poster.addEventListener('click', () => {
            if (!poster.src)
                return
            posterOverlay.classList.add('overlay')
            posterOverlay.innerHTML = ''
            const img = document.createElement('img')
            img.src = poster.src
            posterOverlay.appendChild(img)
            document.documentElement.style.overflow = 'hidden'
        })
        posterOverlay.addEventListener('click', e => {
            posterOverlay.classList.remove('overlay')
            document.documentElement.style.overflow = ''
        })
        warningWrapper.addEventListener('click', () => {
            this.classList.remove('warning')
        })
        this.querySelectorAll('code').forEach(code => {
            code.addEventListener('click', e => {
                const selection = window.getSelection()
                selection.removeAllRanges()

                const range = document.createRange()
                range.selectNodeContents(e.target)
                selection.addRange(range)
            })
        })
        exclude.addEventListener('click', e => {
            if (e.altKey ||
                e.ctrlKey ||
                e.metaKey ||
                !e.shiftKey) {
                window._elmExclude = null
            } else {
                if (window._elmExclude) {
                    const { _elmExclude } = window
                    const children = Array.from(elmWrapper.children)
                    const first = children.indexOf(_elmExclude)
                    const second = children.indexOf(this)
                    const [start, end] = [first, second].sort((a, b) => a - b)
                    const list = children.slice(start, end + 1)
                    list.forEach(f => {
                        f.exclude.checked = _elmExclude.exclude.checked
                    })
                    window._elmExclude = null
                } else {
                    window._elmExclude = this
                }
            }
        })
        return this
    }
})
addEventListener('click', e => {
    if (e.target.dataset._exclude === undefined)
        window._elmExclude = null
})
