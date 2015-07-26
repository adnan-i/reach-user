'use strict';

Reach
  .service('queue')
  .process('user-change-email', function (job, done) {
    done();
  });