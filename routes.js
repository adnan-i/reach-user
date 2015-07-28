'use strict';

Route.get('/users/me', ['authenticate', 'UsersController@me']);
Route.get('/users/confirm-email/:token', 'UsersController@confirmEmail');

Route.resource('users', 'UsersController', {
  params : ['firstName', 'lastName', 'email', 'password']
});