'use strict';

Route.get('/users/me',       ['authenticate', 'UsersController@me']);
Route.pst('/users/password',                  'UsersController@passwordToken');
Route.put('/users/password',                  'UsersController@passwordReset');

Route.resource('users', 'UsersController', {
  params : ['firstName', 'lastName', 'email', 'password']
});