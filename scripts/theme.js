const setTheme = bool => {
    const { classList } = document.documentElement
    if (bool)
        classList.add('light')
    else
        classList.remove('light')
}
const mediaQueryLightFunc = mediaQuery => {
    if (localStorage.getItem('theme'))
        return
    setTheme(mediaQuery.matches)
}
const themeFunc = () => {
    const { classList } = document.documentElement
    const val = !classList.contains('light')
    setTheme(val)
    localStorage.setItem('theme', val)
}

const mediaQueryLight = matchMedia('(prefers-color-scheme: light)')
mediaQueryLightFunc(mediaQueryLight)
mediaQueryLight.addEventListener('change', mediaQueryLightFunc)

setTheme(localStorage.getItem('theme') === 'true')
toggleTheme.addEventListener('click', themeFunc)
