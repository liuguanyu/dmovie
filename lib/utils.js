const fetchUrl = require("fetch").fetchUrl;
const zlib = require("zlib")
const request = require("request")
const progress = require("request-progress")

const ProgressBar = require("progress")

const fs = require("fs")

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

    download: function (url, referrer, target){
        let headers = this.getHeaders()
        headers = Object.assign(headers, {"Referer": referrer})

        let opt = {
            'headers': headers,
            'url': url
        }

        let percent = 0

        const bar = new ProgressBar('Downloading movie : ├:bar┤ :current% :elapseds', {
            total: 100,
            complete: "█",
            incomplete: "─",
            width: 60
        })

        return new Promise((resolve, reject) => {
            progress(request.get(opt))
                .on('progress', function (state) {
                    // The state is an object that looks like this:
                    // {
                    //     percent: 0.5,               // Overall percent (between 0 to 1)
                    //     speed: 554732,              // The download speed in bytes/sec
                    //     size: {
                    //         total: 90044871,        // The total payload size in bytes
                    //         transferred: 27610959   // The transferred payload size in bytes
                    //     },
                    //     time: {
                    //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
                    //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
                    //     }
                    // }
                    let progressFix = ((state.percent) * 100).toFixed(2)
                    delta = progressFix - percent;
                    bar.tick(delta);
                    percent = progressFix;
                })
                .on("error", () => {
                    return reject()
                })
                .on('end',  () => {
                    bar.tick(100 - percent);
                    console.log('\n')
                    return resolve()
                })
                .pipe(fs.createWriteStream(target));
        })
    }
}