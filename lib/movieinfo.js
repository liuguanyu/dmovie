const ffprobe = require('ffprobe')
const ffprobeStatic = require('ffprobe-static')

const getMovieInfo = (movie) => {
    let ffp = new ffprobe(movie, { path: ffprobeStatic.path })

    return ffp.then(data => {
        let { width, height } = data["streams"].filter((el) => {
            return el['codec_type'] == "video"
        }).pop()

        return {width, height}
    })
}

module.exports = {
    getMovieInfo: getMovieInfo
}