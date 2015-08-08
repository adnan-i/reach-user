# Reach User

  - [Introduction](#introduction)
  - [Dependencies](#dependencies)
  - [Config](#config)
  - [Routes](#routes)
    - [Postman](https://www.getpostman.com/collections/c04c087ffb8793e2db9c)

## [Introduction](#introduction)

This module provides reach-api with user management features such as creating, listing, updating and deleting users.

## [Dependencies](#dependencies)

Make sure you have the following dependencies available:

 - reach-email@0.0.4

## [Config](#config)

Default configuration file:

```js
module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | User
   |--------------------------------------------------------------------------------
   |
   | filter : Function providing the available filtering options for the user
   |
   */

  user : {
    filter : function (query, options) {
      return query(options, {
        where : {
          firstName : { $like : query.STRING },
          lastName  : { $like : query.STRING },
          email     : query.STRING,
          facebook  : query.STRING,
          twitter   : query.STRING,
          linkedin  : query.STRING,
          stripeId  : query.STRING
        }
      });
    }
  }

};
```

## [Routes](#routes)

The module currently provides the following routing options:

```
POST /users
GET  /users
GET  /users/me
GET  /users/:id
PUT  /users/:id
DEL  /users/:id
```