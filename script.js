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
    const msOffset = minToMs(minOffset)
    let tempDate
    const finalArr = []
    for (let i = 0; i < arr.length + 1; i++) {
        const e = arr[i]
        if (arr.length === 0 || preset === 'rating' & !e)
            break
        const baseStr = e
            ? `${e.getAttribute('text') || e.json?.Title || e.search.value}`.trim()
            : tail.value
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
            timeStr = `(${h}:${m})`
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
        let result
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
        finalArr.push(result.trim())
    }
    return finalArr
}
