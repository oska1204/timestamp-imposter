const updateListLink = e => {
    const elms = Array.from(document.querySelectorAll('elm-'))
    const idArr = elms.map(elm => elm.json?.imdbID || elm.imdb?.value || '')
        .filter(e => e.match(elms[0].imdbIDRegex))
    const url = new URL(location)
    url.searchParams.set('list', idArr.join('_'))
    listLink.href = url
}
document.addEventListener('send-data', updateListLink)
document.addEventListener('elm-removed', updateListLink)
const url = new URL(location)
listLink.href = url
const linkListStr = url.searchParams.get('list')
const linkListArr = linkListStr?.split('_')
if (linkListArr) {
    elmWrapper.innerHTML = ''
    linkListArr.forEach(id => {
        elmWrapper.insertAdjacentHTML('beforeend', `
            <elm- imdb="${id}" update></elm->
        `)
    })
}
