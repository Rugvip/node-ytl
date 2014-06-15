'use strict';

require('colors');
var fs = require('fs');
var util = require('util');
var ytdl = require('ytdl');
var EventEmitter = require('events').EventEmitter;

var BASE_YOUTUBE_URL = "http://www.youtube.com/watch?v=";
var VIDEO_FORMAT = 'mp4';

function stripTitle(filename) {
    return filename.replace(/[^A-Za-z0-9\s-_\[\]\(\)\{\}\+\.\*]/g, "");
}

function Downloader(videoId, options) {
    if (!this) {
        console.error("use as a contructor you fool");
    } else {
        EventEmitter.call(this);
    }

    if (!videoId) {
        console.error("No video id");
    }

    var dir = "./";

    if (options) {
        if (options.dir) {
            dir = options.dir;
        }
    }

    this.videoId = videoId;

    var stream = ytdl(BASE_YOUTUBE_URL + this.videoId, {
        filter: function (format) {
            return format.container === VIDEO_FORMAT;
        }
    });

    stream.on('info', function (info, format) {
        this.title = info.title;
        this.filename = stripTitle(this.title)+ '.' + VIDEO_FORMAT;

        this.emit('start', format.size);

        var output = fs.createWriteStream(dir + this.filename);

        stream.pipe(output);

        stream.on('end', function () {
            this.emit('done');
            output.end();
        }.bind(this));

        stream.on('data', function (data) {
            this.emit('tick', data.length);
        }.bind(this));

        stream.on('error', this.emit.bind(this));
        output.on('error', this.emit.bind(this));
    }.bind(this));
}

util.inherits(Downloader, EventEmitter);

module.exports = Downloader;
