function minToMs(minutes) {
    return parseInt(minutes) * 60 * 1000
}

function getList(arr, minOffset, startTime) {
    const startDate = new Date
    if (startTime) {
        const [h, m] = startTime.split(':')
        startDate.setHours(h)
        startDate.setMinutes(m)
    }
    const msOffset = minToMs(minOffset)
    let tempDate
    const finalArr = []
    for (let i = 0; i < arr.length; i++) {
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
        const m = ('0' + d.getMinutes())
        const mt = m.length === 3 ? m.slice(1) : m
        const e = arr[i]
        finalArr.push(`${e.getAttribute('text') || e.json?.Title || e.input.value} (${h}:${mt})`)
    }
    const elm = arr[arr.length - 1];
    if (elm) {
        const min = elm.minutes.value
        const ms = minToMs(min)
        const d = new Date(ms + tempDate)
        const h = d.getHours()
        const m = ('0' + d.getMinutes())
        const mt = m.length === 3 ? m.slice(1) : m
        finalArr.push(`${tail.value} (${h}:${mt})`)
    }
    return finalArr
}
