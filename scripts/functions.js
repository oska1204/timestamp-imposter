function minToMs(minutes) {
    return parseInt(minutes) * 60 * 1000
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
        let baseStr
        const text = e.dataset.rawText?.trim()
        const search = e.search.value
        const j = { ...e.json }
        for (const key in j) {
            if (j[key] === 'N/A')
                j[key] = ''
            j.Ratings?.forEach(e => {
                if (e.Source === 'Rotten Tomatoes')
                    j.Tomato = e.Value
            })
        }
        const defaultFormat = `${text || j.Title || search}`
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
        e.json?.Ratings.forEach(e => {
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
