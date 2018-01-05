const ffmpeg = require('fluent-ffmpeg')
const ProgressBar = require("progress")
const utils = require('../lib/utils')

const bar = new ProgressBar('Merging ass to the movie: ├:bar┤ :current% :elapseds', {
    total: 100,
    complete: "█",
    incomplete: "─",
    width: 60
})

const merge = (movie, ass, target) => {
    let last = 0

    if (utils.isArray(movie)){

    }
    else{
        ffmpeg(movie)
            .videoFilters({
                filter: 'ass',
                options: ass
            })
            .on('progress', function (progress) {
                let progressFix = progress.percent.toFixed(2)
                delta = progressFix - last;
                bar.tick(delta);
                last = progressFix;
            })
            .on('end', function () {
                bar.tick(100 - last);
            })
            .save(target)	
    }
}	

module.exports = {
    merge: merge
}