mock-nodemailer
===============

[![Build Status](https://drone.io/github.com/whatser/mock-nodemailer/status.png)](https://drone.io/github.com/whatser/mock-nodemailer/latest)

A small framework to mock out nodemailer in your tests.

Usage
-----

    test('email gets sent', function(done) {

        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.expectEmail(email, done);

        transport.sendMail(email, function() {});

    });

    test('email gets sent, throwing if an email is not ours', function(done) {

        var email = {
            to: Faker.Internet.email(),
            text: Faker.Lorem.sentence(),
            subject: Faker.Lorem.sentence()
        };

        mockMailer.mock(function(sentEmail) {
            assert.deepEqual(email, sentEmail);
            return true;
        }, done);

        transport.sendMail(email, function() {});

    });

    test('email gets sent, returning falsy if an email is not ours', function(done) {

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

    test('multiple emails get sent', function(done) {

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
