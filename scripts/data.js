elmItem.addEventListener('send-data', e => {
    const { json } = e.detail
    preJson.textContent = JSON.stringify(json, null, 3)
})

elmItem.update.click()