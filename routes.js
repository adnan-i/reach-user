'use strict';

// ### Unique Routes

Route.get('/users/me',       ['authenticate', 'UsersController@me']);
Route.pst('/users/password',                  'UsersController@passwordToken');
Route.put('/users/password',                  'UsersController@passwordReset');

// ### User Resource

Route.resource('users', 'UsersController');