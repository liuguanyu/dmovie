const sites = {
    "bilibili": "bilibili"
}

module.exports = {
    dispatch : (url) => {
        let match = url.match(/https?:\/\/([^\/]+)\//)
        let siteInfo = match[1].split(".")
        let domain = siteInfo[1]

        let matchDomain = Object.keys(sites).find(el => {
            return el == domain
        }) 
        
        const vendor = require("../lib/extractor/" + matchDomain)

        return {vendor, matchDomain}
    }
}