'use strict';

require('colors');
var _ = require('lodash');
var _a = require('async');
var ui = require('./ui.js');
var Downloader = require('./downloader');

parseArgs(process.argv);

function abort(str) {
    console.log("%s".red.bold, str);
    ui.stop();
}

function parseArgs(argv) {
    argv.splice(0, 2);

    if (!argv.length) {
        return abort("Pass video url/id as arguments");
    }

    var i, dArr, dir;

    for (i = 0; i < argv.length; i++) {
        if (argv[i] === '-d') {
            dArr = argv.splice(i, 2);

            if (dArr.length !== 2) {
                return abort("no directory provided");
            }

            dir = dArr[1];
        }
    }

    downloadAll(dir, argv);
}

function downloadAll(dir, ids) {
    ids = _(ids).
        drop(2).
        map(function (str) {
            var m = str.match(/(?:.*watch?.*v=)?([a-zA-Z0-9_-]{11})/);
            return m ? m[1] : null;
        }).
        filter(function (e) {return !!e; }).
        value();

    _a.each(ids, function (id, callback) {
        callback = _.once(callback);

        var download = new Downloader(id, {
            dir: dir
        });

        download.on('start', function (length) {
            var bar = new ui.ProgressBar({
                max: length,
                title: ("" + download.title).green.bold
            });
            download.on('tick', function (tick) {
                bar.tick(tick);
            });
            download.on('done', function () {
                callback();
            });
        });

        download.on('error', function (err) {
            var bar = new ui.ProgressBar({
                max: 1,
                title: err.error.red.bold
            });
            bar.tick(0);
            callback();
        });
    }, function () {
        ui.stop();
        console.log("");
        process.exit();
    });
}
