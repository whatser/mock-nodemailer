'use strict';

var _ = require('lodash'),
    nodemailer = require('nodemailer'),
    Faker = require('Faker'),
    assert = require('assert'),
    mockMailer = require('../index'),
    transport = nodemailer.createTransport('Sendmail', '/usr/sbin/sendmail');

suite('expectEmail-nodemailer', function() {

    test('should handle correct email, as object', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(email, done);

        transport.sendMail(email, function() {});
    });

    test('should handle correct email, returning true', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(function(sentEmail) {
            return _.isEqual(email, sentEmail);
        }, done);

        transport.sendMail(email, function() {});
    });

    test('should throw with unexpected email, returning false', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };
        var email2 = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(function(sentEmail) {
            return _.isEqual(email, sentEmail);
        }, done);

        assert.throws(function() {
            transport.sendMail(email2, function() {});
        }, /unexpected email/);

        done();
    });

    test('should handle multiple emails', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(5, function(sentEmail) {
            return _.isEqual(email, sentEmail);
        }, done);

        _.times(5, function() {
            transport.sendMail(email, function() {});
        });
    });

    test('should handle async mailing', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(5, email, done);

        _.times(5, function(i) {
            setTimeout(function() {
                transport.sendMail(email, function() {});
            }, 100 * i);
        });
    });

    test('should handle concurrency', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(email, done);

        setTimeout(function() {
            transport.sendMail(email, function() {});
        }, 200);
    });

    test('should throw an error when too many emails were sent', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(email, done);

        transport.sendMail(email, function() {});

        assert.throws(function() {
            transport.sendMail(email, function() {});
        }, /unexpected email/);
    });

    test('should handle multiple emails in one test', function(done) {
        var emailDone = function() {
            emailDone = done;
        };

        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };
        mockMailer.expectEmail(email, function() {
            emailDone();
        });

        var email2 = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };
        mockMailer.expectEmail(email2, function() {
            emailDone();
        });

        transport.sendMail(email, function() {});
        transport.sendMail(email2, function() {});
    });

    test('should handle multiple identical emails in one test', function(done) {
        var emailDone = function() {
            emailDone = done;
        };

        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };
        mockMailer.expectEmail(email, function() {
            emailDone();
        });
        mockMailer.expectEmail(email, function() {
            emailDone();
        });

        transport.sendMail(email, function() {});
        transport.sendMail(email, function() {});
    });

    test('sendMail callback shouldn\'t get an error', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(email, done);

        transport.sendMail(email, function(error) {
            assert.strictEqual(null, error);
        });
    });

    test('sendMail callback should get a populated response', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(email, done);

        transport.sendMail(email, function(error, response) {
            assert(response, 'callback gets a response');
            assert(response.message, 'response has a message');
            assert(response.messageId, 'response has a message id');
        });
    });

});
