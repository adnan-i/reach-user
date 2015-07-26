'use strict';

var Router = Reach.Router;

Router.get('/users/me', ['authenticate', 'UsersController@me']);
Router.get('/users/confirm-email/:token', 'UsersController@confirmEmail');

Router.resource('users', 'UsersController', {
  params : ['firstName', 'lastName', 'email', 'password']
});