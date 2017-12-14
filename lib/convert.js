const convert = require('danmaku-to-ass').default
const fs = require("fs")
const path = require("path")

const convertToAss = (danmu, ass, site = 'bilibili') => {
    let text = fs.readFileSync(danmu, 'utf-8')
    let assText = convert(text, {}, { source: site, filename: danmu })

    fs.writeFileSync(path.join(__dirname, "../", ass), assText)
}

module.exports = {
    convertToAss: convertToAss
}