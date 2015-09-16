# Reach User

  - [Setup](#setup)
  - [Config](#config)
  - [Routes](#routes)

## [Setup](#setup)

This module provides reach-api with user management features such as creating, listing, updating and deleting users.

First start off by going into the root of the reach-api and run the following command.

```sh
# Install required reach packages.
$ reach install reach-user reach-bcrypt --save
```

## [Config](#config)

Default configuration file:

```js
module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | User
   |--------------------------------------------------------------------------------
   |
   | admins : Array    > List of admin users to create if user table is empty.
   | params : Array    > List of required parameters when creating a new user.
   | filter : Function > Function providing the available filtering options for the 
   |                     user.
   |
   */

  user : {
    admins : [
      {
        firstName : 'John',
        lastName  : 'Doe',
        email     : 'admin@fixture.none',
        password  : 'admin'
      }
    ],
    params : [
      'firstName',
      'lastName',
      'password'
    ],
    filter : function (query, options) {
      return query(options, {
        where : {
          firstName : { $like : query.STRING },
          lastName  : { $like : query.STRING },
          email     : query.STRING
        }
      });
    }
  }

};
```

## [Hooks](#hooks)

This module currently provides access to two hooks, `user:registered` and `user:password-reset`.

**user:registered**

```js
hooks.set('user:registered', function *(user) {
  /*
    user : The User model that was created successfully.
   */
});
```

**user:password-reset**

```js
hooks.set('user:password-reset', function *(user, token, resetUrl) {
  /*
    user     : The User model that is requesting a password reset.
    token    : The token required to reset the password.
    resetUrl : The url pointing to the front end endpoint for resetting the password.
   */
});
```

## [Routes](#routes)

The module currently provides the following routing options:

**POST /users**

```
{
  ...values
}
```

**GET /users?...options**

The query options available are defined in the configuration filter.

**GET /users/me**

Returns the authenticated user based on the `Authorization` token provided.

**GET /users/:id**

Returns a single user based on the provided `id`.

**PUT /users/:id**

You must either be the owner of the user or be signed is an admin to successfully update a user.

```
{
  ...values
}
```

**DELELETE /users/:id**

You must either be the owner of the user or be signed is an admin to successfully delete a user.

**POST /users/password**

Sets up the account for resetting its password, it generates a reset token and executes the `user:password-reset` hook.

```
{
  user     : userId,
  resetUrl : 'http://mysite.com/password-reset'
}
```

**PUT /users/password**

Sets the new provided `password` for the account with the provided reset `token`.

```
{
  token    : STRING,
  password : STRING
}
```