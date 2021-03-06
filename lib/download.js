const utils = require('../lib/utils')
const siteDispatcher = require("../lib/sitedispatcher") 

const chalk = require('chalk')

const path = require("path")
const fs = require("fs")

const transFormToMib = size => {
    return (size / 1048576).toFixed(1)
}

const download = (url, workDir) => {
    const vendorInfo = siteDispatcher.dispatch(url)
    console.log(`Parsing Movie From : ${url}`)

    return vendorInfo.vendor.extract(url)
        .then(data => {
            let { danmu, totalSize, rets, title } = data
            console.log(chalk.green(`Movie Title is : ${title}`))
            console.log(chalk.green(`Movie Size is : ${transFormToMib(totalSize)} MiB (${totalSize} bytes)`))

            let downloadUrl = data["rets"]

            fs.writeFileSync(`${workDir}${title}.xml`, danmu)
            console.log(chalk.green(`Download Movie Danmu Complete`))

            return utils.download(downloadUrl, url, `${workDir}${title}.flv`, totalSize)
                .then(targets => {
                    console.log(chalk.green(`Download Movie Complete`))

                    let myFile = utils.isArray(targets) 
                        ? targets.map(el => {
                            return path.join(__dirname, "../", el)
                        })
                        : path.join(__dirname, "../", targets)

                    return {
                        "danmu": path.join(__dirname, "../", `${workDir}${title}.xml`),
                        "movie": myFile,
                        "site" : `${vendorInfo["matchDomain"]}`,
                        "title": `${title}`
                    }
                })   
        })
}

module.exports = {
    download: download
}