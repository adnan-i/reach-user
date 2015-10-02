'use strict';

let config = Reach.config.user;

// ### Unique Routes

Route.get('/users/me',       ['authenticate', 'UsersController@me']);
Route.pst('/users/verify',                    'UsersController@verify');
Route.pst('/users/password',                  'UsersController@passwordToken');
Route.put('/users/password',                  'UsersController@passwordReset');

// ### User Resource

Route.resource('users', 'UsersController', {
  params : config.params ? config.params : null
});