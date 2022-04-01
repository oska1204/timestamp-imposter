elmItem.addEventListener('send-data', e => {
    const { json } = e.target
    preJson.textContent = JSON.stringify(json, null, 2)
})

elmItem.update.click()