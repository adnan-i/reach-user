'use strict';

describe('User Module', function () {
  this.timeout(10000);

  // ### Jobs
  // Test the modules queues

  describe('Jobs', function () {
    require('./jobs.js');
  });

  // ### Routes
  // Test against user module routes

  describe('Routes', function () {
    require('./routes.js');
  });
});