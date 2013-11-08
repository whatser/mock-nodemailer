'use strict';

var _ = require('lodash'),
    nodemailer = require('nodemailer');

var callbacks = [];

nodemailer.createTransport = function() {
    return {
        sendMail: function(options, callback) {
            callback(null, {
                message: 'Your message was not sent but processed by mock-nodemailer',
                messageId: Math.floor(Math.random() * 1000)
            });

            var index = _.findIndex(callbacks, function(item) {
                if (typeof item.check === 'function') {
                    try {
                        return item.check(options);
                    } catch (e) {
                        return false;
                    }
                }
                return _.isEqual(options, item.check);
            });

            if (index === -1) {
                throw new Error('An incorrect email was sent (no test returned true)');
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
