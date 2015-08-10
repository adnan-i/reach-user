'use strict';

let co    = require('co');
let Email = Reach.service('email');
let log   = Reach.Log;

Reach
  .service('queue')
  .process('user-password-reset', function (job, done) {
    if (Reach.ENV === 'test') { return done(); }
    log.debug('Sending password reset email to: ' + job.data.to);
    co(function *() {
      let email = new Email();
      yield email.send(job.data);
      done();
    });
  })
;