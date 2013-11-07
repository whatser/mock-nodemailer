'use strict';

var nodemailer = require('nodemailer'),
    Faker = require('Faker'),
    assert = require('assert'),
    mockMailer = require('../index');

var SimpleEmail = function(to, text, subject) {
    var message = {
        from: 'Whatser Mailer <no-reply@whatser.com>',
        to: to,
        text: text,
        subject: subject
    };

    this.send = function(done) {
        var transport = nodemailer.createTransport('Sendmail', '/usr/sbin/sendmail');

        transport.sendMail(message, done);
    };

};

suite('mock-nodemailer', function() {
    test('mock-nodemailer should override the sendMail function', function(done) {
        var to = Faker.Internet.email(),
            message = Faker.Lorem.sentence(),
            subject = Faker.Lorem.sentence();

        var email = new SimpleEmail(to, message, subject);

        mockMailer.mock(function(mail) {
            if (mail.to === to) {
                assert.equal(mail.subject, subject, 'Matching mail subject is the same');
                assert.equal(mail.text, message, 'Matching mail text is the same');

                return true;
            }
        }, done);

        email.send(function() {
            // must never be called
        });
    });
});
