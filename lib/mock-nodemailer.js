'use strict';

var _ = require('lodash'),
    nodemailer = require('nodemailer');

var callbacks = [];

nodemailer.createTransport = function() {
    return {
        sendMail: function(options, done) {
            done();

            var index = _.findIndex(callbacks, function(item) {
                return item.check(options);
            });

            if (index === -1) {
                throw new Error('sendmail called, but no check returned true');
            }


            var match = callbacks[index];
            match.times--;

            if (match.times === 0) {
                callbacks.splice(index, 1);
                match.done();
            }
        }
    };
};

/**
 * monkey patch nodemailer to override the sendMail function
 */
module.exports = {
    mock: function(times, check, done) {
        if (arguments.length === 2) {
            done = check;
            check = times;
            times = 1;
        }

        callbacks.push({
            check: check,
            done: done,
            times: times
        });
    }
};
