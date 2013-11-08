'use strict';

var _ = require('lodash'),
    nodemailer = require('nodemailer'),
    Faker = require('Faker'),
    assert = require('assert'),
    async = require('async'),
    mockMailer = require('../index'),
    transport = nodemailer.createTransport('Sendmail', '');

suite('expectEmail-nodemailer', function() {

    test('should handle correct email, as object', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(email, done);

        email.from = Faker.Internet.email();

        transport.sendMail(email, function() {});
    });

    test('should throw with unexpected email, changed later', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(email, done);

        email.to = Faker.Internet.email();

        assert.throws(function() {
            transport.sendMail(email, function() {});
        }, /unexpected email/);

        done();
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

        var amount = 5 + Faker.random.number(8);

        mockMailer.expectEmail(amount, function(sentEmail) {
            return _.isEqual(email, sentEmail);
        }, done);

        _.times(amount, function() {
            transport.sendMail(email, function() {});
        });
    });

    test('should handle async mailing', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        var amount = 5 + Faker.random.number(8);

        mockMailer.expectEmail(amount, email, done);

        _.times(amount, function(i) {
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

        async.parallel([

            function(done) {
                mockMailer.expectEmail(email, done);
            },
            function(done) {
                mockMailer.expectEmail(email2, done);
            }

        ], done);

        transport.sendMail(email, function() {});
        transport.sendMail(email2, function() {});
    });

    test('should handle multiple identical emails in one test', function(done) {
        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        async.parallel([

            function(done) {
                mockMailer.expectEmail(email, done);
            },
            function(done) {
                mockMailer.expectEmail(email, done);
            }

        ], done);

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
