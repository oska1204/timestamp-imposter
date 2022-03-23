function dataConst(queryElm = document) {
    const s = document.createElement('script')
    const elms = Array.from(queryElm.querySelectorAll('[data-const]'))
    const arr = elms.filter(e => e)
    window.__temp = arr
    const scriptArr = arr.map((e, i) => {
        const val = e.dataset.const
        return `const ${val} = window.__temp[${i}];\n`
    })
    s.text = scriptArr.join('')
    document.head.append(s)
    arr.forEach(e => e.removeAttribute('data-const'))
    delete window.__temp
    s.remove()
}
function dataConstAll(queryElm = document) {
    const s = document.createElement('script')
    const elms = Array.from(queryElm.querySelectorAll('[data-const-all]'))
    const arrFiltered = elms.filter(e => e)
    const tempArr = []
    arrFiltered.forEach(e => {
        const val = e.dataset.constAll
        if (!tempArr.includes(val))
            tempArr.push(val)
    })
    const arr = tempArr.map(e => Array.from(queryElm.querySelectorAll(`[data-const-all="${e}"]`)))
    window.__tempAll = arr
    const scriptArr = arr.map((e, i) => {
        const val = e[0].dataset.constAll
        return `const ${val} = window.__tempAll[${i}];\n`
    })
    s.text = scriptArr.join('')
    document.head.append(s)
    arrFiltered.forEach(e => e.removeAttribute('data-const-all'))
    delete window.__tempAll
    s.remove()
}
