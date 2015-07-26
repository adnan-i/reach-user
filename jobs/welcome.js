'use strict';

let co           = require('co');
let queue        = Reach.service('queue');
let EmailService = Reach.service('email');

queue.process('user-welcome-email', function (job, done) {
  if ('test' === Reach.ENV) { return done(); }
  co(function *() {
    let email = new EmailService();
    yield email.send(job.data);
    done();
  });
});