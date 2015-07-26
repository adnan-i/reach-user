'use strict';

let co           = require('co');
let EmailService = Reach.service('email');

Reach
  .service('queue')
  .process('user-welcome-email', function (job, done) {
    if ('test' === Reach.ENV) { return done(); }
    co(function *() {
      let email = new EmailService();
      yield email.send(job.data);
      done();
    });
  });