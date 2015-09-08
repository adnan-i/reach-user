'use strict';

let queue  = Reach.provider('queue');
let config = Reach.config; 

/**
 * @class EmailService
 */
let EmailService = module.exports = {};

/**
 * @method welcome
 * @param  {User} user
 */
EmailService.welcome = function (user) {
  let job = queue
    .create('user-welcome-email', {
      to       : user.email,
      from     : config.email.sender,
      subject  : 'Registration complete',
      template : 'user-welcome-email',
      context  : {
        name    : user.name(),
        company : config.api.name,
        confirm : 'http://local.io:8081/users/email-confirm/sample'
      }
    })
    .save()
  ;
  job.on('complete', function () {
    job.remove();
  });
};

/**
 * @method passwordToken
 * @param  {User}   user
 * @param  {String} token
 * @param  {String} resetUrl
 */
EmailService.passwordToken = function (user, token, resetUrl) {
  let job = queue
    .create('user-password-reset', {
      to       : user.email,
      from     : config.email.sender,
      subject  : 'Password Reset',
      template : 'user-password-reset',
      context  : {
        name     : user.name(),
        service  : config.api.name,
        token    : token,
        resetUrl : resetUrl
      }
    })
    .save()
  ;
  job.on('complete', function () {
    job.remove();
  });
};