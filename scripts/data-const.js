function dataConst(queryElm = document) {
    const elms = Array.from(queryElm.querySelectorAll('[data-const]'))
    const arr = elms.filter(e => e)
    window.__temp = arr
    arr.forEach((e, i) => {
        const s = document.createElement('script')
        const val = e.dataset.const
        s.text = `const ${val} = window.__temp[${i}];\n`
        document.head.append(s)
        s.remove()
        e.removeAttribute('data-const')
    })
    delete window.__temp
}
function dataConstAll(queryElm = document) {
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
    arr.forEach((e, i) => {
        const s = document.createElement('script')
        const elm = e[0]
        const val = elm.dataset.constAll
        s.text = `const ${val} = window.__tempAll[${i}];\n`
        document.head.append(s)
        s.remove()
        elm.removeAttribute('data-const-all')
    })
    delete window.__tempAll
}
