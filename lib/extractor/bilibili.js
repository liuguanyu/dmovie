const utils = require("../../lib/utils")
const md5 = require("md5")
const parseString = require("xml2js").parseString
const promisify = require("es6-promisify")

const xml2js = promisify(parseString)

const getQualityIdByFormat = (format) => {
    const formatMap = {
        hdflv : 4, 
        flv : 3, 
        hdmp4 : 2, 
        mp4 : 1
    }

    return formatMap[format] !== undefined ? formatMap[format] : 3
}

const extract = url => {
    const SEC1 = "1c15888dc316e05a15fdd0a02ed6584f"
    const SEC2 = "9b288147e5474dd2aa67085f716c560d"

    const apiUrl = "http://interface.bilibili.com/playurl?"
    const danmuUrl = "http://comment.bilibili.com/"

    let fetchHtml = utils.fetchText(url)

    let getBaseInfo = html => {
        let titleReg = /<h1\s*title="([^"]+)"/
        let match = html.match(titleReg)

        return Promise.resolve(match[1])
    } 

    let getCid = html => {
        let cidReg = /cid=(\d+)/
        let match = html.match(cidReg)

        return Promise.resolve(match[1])
    }

    let getFormat = html => {
        return Promise.resolve("flv")
    }

    let getVideoPath = (cid, format) => {
        const ts = Math.floor(+(new Date())/1000)
        let paramsStr = `cid=${cid}&player=1&quality=${getQualityIdByFormat(format)}&ts=${ts}`

        let chksum = md5(paramsStr + SEC1)
        let interfaceUrl = `${apiUrl}${paramsStr}&sign=${chksum}` 

        const parseXml = (xml) => {
            return xml2js(xml)
                .then(data => {
                    let totalSize = 0, durl

                    try {
                        durl = data.video.durl
                    }
                    catch(e){
                        durl = []
                    }   
                     
                    let rets = durl.map(el => {
                        let size = parseInt(el.size.shift(), 10),
                            url = el.url.shift()
                        totalSize += size 

                        return {size, url}
                    })

                    return {totalSize,rets}
                })
        }

        return utils.fetchText(interfaceUrl)
            .then(xml => parseXml(xml))
    }

    let getDanmu = (cid) => {
        return utils.fetchText(`${danmuUrl}${cid}.xml`)
    }

    return fetchHtml.then(html => {
        let getKeyParams = Promise.all([
            getCid(html),
            getFormat(html)
        ])
        
        return getKeyParams.then(data => {
            let [cid, format] = data 

            return Promise.all([
                getDanmu(cid),
                getVideoPath(cid, format),
                getBaseInfo(html)
            ])
            .then(data => {
                let [danmu, videoInfo, title] = data
                let {totalSize, rets} = videoInfo

                return {
                    danmu, totalSize, rets, title
                }
            })
        })
    })
}

module.exports = {
    extract: extract
}