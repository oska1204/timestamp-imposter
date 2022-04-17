function minToMs(minutes) {
    return parseInt(minutes) * 60 * 1000
}

function seasonEpisode(str, sVal, eVal) {
    str += ' S'
    if (sVal < 10 && sVal > 0)
        str += '0'
    str += sVal + 'E'
    if (eVal < 10 && eVal > 0)
        str += '0'
    str += eVal
    return str
}

function getDay(date) {
    switch (date.getDay()) {
        case 0:
            return 'SUNDAY'
        case 1:
            return 'MONDAY'
        case 2:
            return 'TUESDAY'
        case 3:
            return 'WEDNESDAY'
        case 4:
            return 'THURSDAY'
        case 5:
            return 'FRIDAY'
        case 6:
            return 'SATURDAY'
    }
}

function hhmm(strMin) {
    const min = parseInt(strMin)
    const hoursFloat = min / 60
    const hours = Math.floor(hoursFloat)
    const minFloat = (hoursFloat - hours) * 60
    const minutes = Math.round(minFloat)
    const minutesStr = ('0' + minutes).slice(-2)
    return `${hours}:${minutesStr}`
}

function getList(arr, minOffset, startTime, preset) {
    const startDate = new Date
    if (startTime) {
        const [h, m] = startTime.split(':')
        startDate.setHours(h)
        startDate.setMinutes(m)
    }
    const tzInput = minToMs(timezoneInput.value * 60)
    const tzOffset = minToMs(startDate.getTimezoneOffset())
    startDate.setTime(startDate.getTime() + tzInput + tzOffset)
    const msOffset = minToMs(minOffset)
    let tempDate
    const finalArr = []
    if (arr.length === 0)
        return finalArr
    const tailElm = document.createElement(arr[0].localName).init()
    tailElm.dataset.rawText = tail.value
    tailElm.isTail = true
    if (tail.value)
        arr.push(tailElm)
    for (let i = 0; i < arr.length; i++) {
        const e = arr[i]
        const j = { ...e.json }
        let baseStr
        const text = e.dataset.rawText?.trim()
        const search = e.search.value
        const selectTitle = e.select_title
        const selectedTitle = selectTitle.children[selectTitle.value]
        let titleStr
        if (selectedTitle) {
            const { title } = selectedTitle.dataset
            titleStr = title
            if (j.Type === 'episode' && e.season.value && e.episode.value) {
                titleStr = seasonEpisode(titleStr, j.Season, j.Episode)
            } else if (j.Type === 'series' && e.season.value && e.episode.value) {
                titleStr = seasonEpisode(titleStr, e.season.value, e.episode.value)
            }
        }
        for (const key in j) {
            if (j[key] === 'N/A')
                j[key] = ''
            j.Ratings?.forEach(e => {
                if (e.Source === 'Rotten Tomatoes')
                    j.Tomato = e.Value
            })
        }
        const defaultFormat = `${text || titleStr || j.Title || search}`
        try {
            baseStr = defaultFormat
        } catch (err) {
            baseStr = defaultFormat
            console.error(err)
        }
        let timeStr = ''
        let ratingStr = ''
        let d
        if (tempDate) {
            const elm = arr[i - 1];
            const min = elm.minutes.value
            const ms = minToMs(min)
            d = new Date(ms + tempDate)
        } else
            d = new Date(startDate.getTime() + msOffset)
        tempDate = d.getTime()
        const h = d.getHours()
        const m = ('0' + d.getMinutes()).slice(-2)
        const time = `${h}:${m}`
        timeStr = squareBrackets.checked
            ? `[${time}]`
            : `(${time})`
        let tomato
        e.json?.Ratings?.forEach(e => {
            if (e.Source === 'Rotten Tomatoes')
                tomato = e.Value
        })
        let { imdbRating, Metascore } = e.json || {}
        const ratingsUnfiltered = [
            imdbCheck.checked ? imdbRating : '',
            tomatoCheck.checked ? tomato : '',
            metacriticCheck.checked ? Metascore : ''
        ]
        const ratings = ratingsUnfiltered.filter(e => e !== 'N/A' && e)
        ratingStr = ratings.length
            ? `{${ratings.join(' ')}}`
            : ''
        let result = eval(`\`${customFormatInput.value}\``)
        if (e.isTail)
            result = eval(`\`${tail.value}\``)
        finalArr.push(result)
    }
    return finalArr
}
