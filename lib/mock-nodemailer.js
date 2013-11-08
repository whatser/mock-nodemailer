'use strict';

var _ = require('lodash'),
    nodemailer = require('nodemailer');

var expectedItems = [];

/**
 * monkey patch nodemailer to override the sendMail function
 */
nodemailer.createTransport = function() {
    return {
        sendMail: function(options, callback) {
            callback(null, {
                message: 'Your message was not sent but processed by mock-nodemailer',
                messageId: Date.now() + '.' + Math.floor(Math.random() * 1000) + '@mock-nodemailer'
            });

            var index = _.findIndex(expectedItems, function(item) {
                return item.check(options);
            });

            if (index === -1) {
                throw new Error('An unexpected email was sent (no test returned true)');
            }

            var match = expectedItems[index];
            match.times--;

            if (match.times === 0) {
                expectedItems.splice(index, 1);
                match.done();
            }
        }
    };
};

module.exports = {
    expectEmail: function(times, check, done) {
        if (arguments.length === 2) {
            done = check;
            check = times;
            times = 1;
        }

        if (typeof check !== 'function') {
            var checkObj = _.clone(check);
            check = function(options) {
                return _.isEqual(_.pick(options, _.keys(checkObj)), checkObj); // Check that checkObj is a subset of options
            };
        }

        expectedItems.push({
            check: check,
            done: done,
            times: times
        });
    }
};
