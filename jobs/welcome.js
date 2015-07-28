'use strict';

let co           = require('co');
let EmailService = Reach.service('email');
let log          = Reach.Log;

Reach
  .service('queue')
  .process('user-welcome-email', function (job, done) {
    if ('test' === Reach.ENV) { return done(); }
    log.debug('Sending user welcome email to: ' + job.data.to);
    co(function *() {
      let email = new EmailService();
      yield email.send(job.data);
      done();
    });
  });