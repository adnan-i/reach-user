'use strict';

let co    = require('co');
let Email = Reach.provider('email');
let log   = Reach.Log;

Reach
  .provider('queue')
  .process('user-welcome-email', function (job, done) {
    if (Reach.ENV === 'test') { return done(); }
    log.debug('Sending user welcome email to: ' + job.data.to);
    co(function *() {
      let email = new Email();
      yield email.send(job.data);
      done();
    });
  })
;