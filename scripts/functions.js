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
    for (let i = 0; i < arr.length + 1; i++) {
        const e = arr[i]
        if (arr.length === 0 || preset === 'rating' & !e)
            break
        let baseStr
        if (e) {
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
                baseStr = eval(`\`${customFormatInput.value}\``) || defaultFormat
            } catch (err) {
                baseStr = defaultFormat
                console.error(err)
            }
        } else
            baseStr = tail.value
        let timeStr = ''
        let ratingStr = ''
        if ((preset === 'time' || preset === 'rating + time')) {
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
            timeStr = squareBrackets.checked
                ? `[${h}:${m}]`
                : `(${h}:${m})`
        }
        if ((preset === 'rating' || preset === 'rating + time') && e) {
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
        }
        let result = baseStr
        switch (preset) {
            case 'time':
                result = `${baseStr} ${timeStr}`
                break;
            case 'rating':
                result = `${ratingStr} ${baseStr}`
                break;
            case 'rating + time':
                result = `${ratingStr} ${baseStr} ${timeStr}`
                break;
        }
        if (!e && preset === 'rating + time')
            result = result.slice(1)
        finalArr.push(result)
    }
    return finalArr
}
