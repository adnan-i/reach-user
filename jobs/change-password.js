'use strict';

Reach
  .service('queue')
  .process('user-change-password', function (job, done) {
    done();
  });