textarea.value = localStorage.getItem('textarea') || 'Aladdin ⏩\ntt1119646 ⏩\nSherlock S01E01 ⏩\nhttps://www.imdb.com/title/tt0325980'
split.value = localStorage.getItem('split') || '⏩'
customFormatInput.value = localStorage.getItem('customFormatInput') || '${text || j.Title || search}'
join.value = localStorage.getItem('join') || ' ⏩\n'
const tailVal = localStorage.getItem('tail')
tail.value = tailVal === null
    ? 'Cartoons'
    : tailVal

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