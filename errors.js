'use strict';

Reach.ErrorHandler.addRouteHandler('POST /users', function (err) {
  if (err.name === 'SequelizeUniqueConstraintError') {
    err.code    = 'USER_EMAIL_DUP';
    err.status  = 400;
    err.data    = err.fields;
    err.message = 'The email you entered is already in use';
  }
  return err;
});