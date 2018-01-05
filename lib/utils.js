const fetchUrl = require("fetch").fetchUrl;
const zlib = require("zlib")
const request = require("request")
const progress = require("request-progress")
const ffmpeg = require('fluent-ffmpeg')

const ProgressBar = require("progress")

const fs = require("fs")

const downloadMulti = (url, headers, target, totalSize) => {
    let percent = 0
    let transferred = 0
    let processTransferred = {}
    
    let count = url.length

    const bar = new ProgressBar('Downloading movie: ├:bar┤ :current% :elapseds', {
        total: 100,
        complete: "█",
        incomplete: "─",
        width: 60
    }) 

    let downloadSingle = (url, headers, target, i) => {
        let opt = {
            headers,
            url
        }

        return new Promise((resolve, reject) => {
            progress(request.get(opt))
                .on('progress', function (state) {
                    let size =  state.size.transferred

                    processTransferred[i] = size 

                    let alreadyTransferred = 0

                    for (let i in processTransferred){
                        alreadyTransferred += processTransferred[i]
                    }

                    let progressFix = ((alreadyTransferred / totalSize) * 100).toFixed(2)

                    delta = progressFix - percent
                    bar.tick(delta)
                    percent = progressFix
                })
                .on("error", () => {
                    return reject()
                })
                .on('end',  () => {
                    let targetTransform = target + ".ts"
                    return ffmpeg(target)
                        .outputOptions('-bsf:v h264_mp4toannexb')
                        .on('end', function () {
                            bar.tick(100 - last);
                            return resolve(targetTransform)
                        })
                        .save(targetTransform)
                })
                .pipe(fs.createWriteStream(target));
        })        
    }

    let downloadAll = url.map((el, i) => {
        return downloadSingle(el["url"], headers, target + "." + i, i)
    })

    return Promise.all(downloadAll)
        .then(files => {
            bar.tick(100 - percent);
            console.log('\n')

            return convertCode(files)
        })
}

const downloadOne = (url, headers, target, totalSize) => {
    let percent = 0

    const bar = new ProgressBar('Downloading movie : ├:bar┤ :current% :elapseds', {
        total: 100,
        complete: "█",
        incomplete: "─",
        width: 60
    })

    let opt = {
        headers,
        url: url[0]["url"]
    }

    return new Promise((resolve, reject) => {
        progress(request.get(opt))
            .on('progress', function (state) {
                let progressFix = ((state.percent) * 100).toFixed(2)
                delta = progressFix - percent
                bar.tick(delta)
                percent = progressFix
            })
            .on("error", () => {
                return reject()
            })
            .on('end',  () => {
                bar.tick(100 - percent)
                console.log('\n')
                return resolve(target)
            })
            .pipe(fs.createWriteStream(target));
    })
}

module.exports = {
    getHeaders: () => {
        const headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Charset': 'UTF-8,*;q=0.5',
            'Accept-Encoding': 'gzip,deflate,sdch',
            'Accept-Language': 'en-US,en;q=0.8',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:13.0) Gecko/20100101 Firefox/13.0'
        }

        return Object.assign({}, headers)
    },

    fetchText: function(url) {
        let headers = this.getHeaders()

        return new Promise((resolve, reject) => {
            fetchUrl(url, { headers }, (error, meta, body) => {
                if (error){
                    return reject(error)
                }

                return resolve(body.toString())
            })
        })
    },

    isArray: function(o) {
        return (Object.prototype.toString.call(o)=='[object Array]') && (o.length > 1)
    },

    download: function (url, referrer, target, totalSize){
        let headers = this.getHeaders()
        headers = Object.assign(headers, {"Referer": referrer})

        return this.isArray(url) 
            ? downloadMulti(url, headers, target, totalSize)
            : downloadOne(url, headers, target, totalSize)
    }
}