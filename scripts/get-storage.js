const currentVersion = '1.1.0'
if (localStorage.version !== currentVersion) {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.version = currentVersion
}

textarea.value = localStorage.getItem('textarea') || 'Aladdin 1992 ⏩\ntt1119646 ⏩\nSherlock S01E01 ⏩\nhttps://www.imdb.com/title/tt0449088'
output.value = localStorage.getItem('output')
output.cols = localStorage.getItem('output-cols') || output.cols
output.rows = localStorage.getItem('output-rows') || output.rows
split.value = localStorage.getItem('split') || '⏩'
window.tempPresetObj = localStorage.getItem('presetObj')
const presetObj = tempPresetObj
    ? JSON.parse(tempPresetObj)
    : {
        startInput: {
            time: '${timezoneStr}\n',
            rating: '${ratingsInfo}\n',
            'rating + time': '${ratingsInfo}\n${timezoneStr}\n',
            blank: '',
            watchlist: '',
        },
        customFormatInput: {
            time: '${baseStr} ${timeStr}',
            rating: '${ratingStr} ${baseStr}',
            'rating + time': '${ratingStr} ${baseStr} ${timeStr}',
            blank: '${baseStr}',
            watchlist: `{
    "total": "\${1212 + arr.length - i}"
    "day": "\${getDay(startDate)}",
    "date": "\${startDate.getDate()}/\${startDate.getMonth() + 1}/\${startDate.getFullYear()}",
    "order": "\${arr.length - i}",
    "title": "\${baseStr.replace(/"/g, '\\\\"')}",
    "year": "\${j.Year || ''}",
    "score": "\${j.imdbRating && j.imdbRating !== 'N/A' ? j.imdbRating.replace('.', '') + '%' : ''}",
    "mm": "\${j.Runtime && j.Runtime !== 'N/A' ? j.Runtime.replace(/\D/g, '') : '0'}",
    "hhmm": "\${j.Runtime && j.Runtime !== 'N/A' ? hhmm(j.Runtime.replace(/\D/g, '')) : '0:00'}"
},
`,
        },
        tail: {
            time: 'Cartoons ${timeStr}',
            rating: '',
            'rating + time': 'Cartoons ${timeStr}',
            blank: 'Cartoons',
            watchlist: '',
        },
        join: {
            time: ' ⏩\n',
            rating: ' ⏩\n',
            'rating + time': ' ⏩\n',
            blank: ' ⏩\n',
            watchlist: '',
        }
    }
delete window.tempPresetObj

const getCheckbox = (elm, name) => {
    switch (localStorage.getItem(name)) {
        case 'true':
            elm.checked = true
            break;
        case 'false':
            elm.checked = false
            break;
    }
}
getCheckbox(squareBrackets, 'square-brackets')
getCheckbox(streamElementsCurTimeCheck,
    'stream-elements-cur-time-check')
getCheckbox(imdbCheck, 'imdb-check')
getCheckbox(tomatoCheck, 'tomato-check')
getCheckbox(metacriticCheck, 'metacritic-check')

preset.value = sessionStorage.getItem('preset') || preset.value
startInput.value = presetObj.startInput[preset.value]
customFormatInput.value = presetObj.customFormatInput[preset.value]
tail.value = presetObj.tail[preset.value]
join.value = presetObj.join[preset.value]
offset.value = sessionStorage.getItem('offset') || offset.value

const defaultTimezone = (new Date).getTimezoneOffset() / - 60
const defaultTimezoneStr = `UTC${defaultTimezone >= 0 ? '+' : ''}${defaultTimezone}`
const time = sessionStorage.getItem('start-time') || ''
startTime.value = time
if (time)
    currentTime.textContent = `${defaultTimezoneStr} ${time}`

try {
    const elmsHTML = JSON.parse(localStorage.getItem('elms'))
    if (elmsHTML?.length !== undefined)
        elmWrapper.innerHTML = ''
    elmsHTML?.forEach(html => {
        elmWrapper.insertAdjacentHTML('beforeEnd', html)
    })
} catch (err) {
    console.error(err);
}