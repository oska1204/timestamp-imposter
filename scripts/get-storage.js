textarea.value = localStorage.getItem('textarea') || 'Aladdin ⏩ The Hangover'
split.value = localStorage.getItem('split') || '⏩'
join.value = localStorage.getItem('join') || ' ⏩ '
tail.value = localStorage.getItem('tail') || 'Cartoons'

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

radioGenerate.forEach(e => {
    if (e.value === localStorage.getItem('radio-generate'))
        e.checked = true
})
preset.value = sessionStorage.getItem('preset') || preset.value

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