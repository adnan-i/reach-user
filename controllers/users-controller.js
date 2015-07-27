'use strict';

let bcrypt = require('co-bcrypt');
let queue  = Reach.service('queue');
let User   = Reach.model('User');
let error  = Reach.ErrorHandler;
let flux   = Reach.IO.flux;

module.exports = Reach.resource(function (_super) {

  Reach.extends(UsersController, _super);

  /**
   * @class UsersController
   */
  function UsersController() {
    _super.call(this, 'User');
  }

  /**
   * Creates a new user
   * @method store
   * @param  {Object} post
   */
  UsersController.prototype.store = function *(post) {
    let resourceName = this._resource.name;
    let model        = new User(post);

    model.password = yield bcrypt.hash(post.password, 10);
    model._actor   = this._actor;

    yield model.save();

    // ### Email

    let job = queue
      .create('user-welcome-email', {
        template : 'user-welcome-email',
        context  : {
          name    : model.firstName + ' ' + model.lastName,
          company : 'Reach',
          confirm : 'http://local.io:8081/users/email-confirm/sample'
        },
        from     : 'no-reply@reach.github.io',
        to       : model.email,
        subject  : 'Welcome to Reach'
      })
      .save()
    ;

    job.on('complete', function () {
      job.remove();
    });

    // ### Flux Action

    let payload = {};

    payload.actionType    = 'user:stored';
    payload[resourceName] = model.toJSON();

    flux(payload);

    return model;
  };

  /**
   * Returns the profile of the authenticated user
   * @method me
   * @return {object}
   */
  UsersController.prototype.me = function *() {
    return this.auth.user;
  };

  /**
   * @method update
   * @param  {String} id
   * @param  {Object} data
   */
  UsersController.prototype.update = function *(id, data) {
    let user = yield getUser(id, this._actor);
    yield verifyOwnership(this.auth.user, user);
    for (let key in data) {
      if (user.hasOwnProperty(key)) {
        user[key] = data[key];
      }
    }
    yield user.update();
    return user;
  };

  /**
   * @method delete
   * @param  {String} id
   */
  UsersController.prototype.delete = function *(id) {
    let user = yield getUser(id, this._actor);
    yield verifyOwnership(this.auth.user, user);
    yield user.delete();
    return user;
  };

  /**
   * @private
   * @method getUser
   * @param  {String} id
   * @param  {Object} actor
   * @return {User}
   */
  function *getUser(id, actor) {
    let user = yield User.find(id);
    if (!user) {
      throw error.parse({
        code    : 'USER_NOT_FOUND',
        message : 'The requested user was not found in our records'
      }, 404);
    }
    user._actor = actor;
    return user;
  }

  /**
   * @private
   * @method verifyOwnership
   * @param  {Object} user
   * @param  {Object} model
   */
  function *verifyOwnership(user, model) {
    if (user.id !== model.id && 'admin' !== user.role) {
      throw error.parse({
        code    : 'ACCESS_DENIED',
        message : 'You do not have access to update this user'
      }, 401);
    }
  }

  return UsersController;

});