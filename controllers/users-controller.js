'use strict';

let bcrypt = require('co-bcrypt');
let query  = Reach.service('sequelize/helpers').query;
let queue  = Reach.service('queue');
let User   = Reach.model('User');
let config = Reach.config;
let error  = Reach.ErrorHandler;
let flux   = Reach.IO.flux;

Reach.Register.ResourceController('User', 'UsersController', function (controller) {

  /**
   * Stores the user and sends a welcome email.
   * @method store
   * @param  {Object} post
   * @return {User}
   */
  controller.store = function *(post) {
    let user = new User(post);

    // ### Save User

    user._actor   = this._actor;
    user.password = yield bcrypt.hash(post.password, 10);
    yield user.save();

    // ### Email

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

    // ### Flux Action

    let payload = {};

    payload.actionType = 'user:stored';
    payload.user       = user.toJSON();

    flux(payload);

    return user;
  },

  /**
   * @method me
   * @return {User}
   */
  controller.me = function *() {
    return this.auth.user;
  };

  /**
   * @method update
   * @param  {Mixed}  id
   * @param  {Object} data
   * @return {User}
   */
  controller.update = function *(id, data) {
    let user = yield getUser(id, this._actor);
    controller._hasAccess(this.auth.user, user);
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
   * @param  {Mixed} id
   * @return {User}
   */
  controller.delete = function *(id) {
    let user = yield getUser(id, this._actor);
    controller._hasAccess(this.auth.user, user);
    yield user.delete();
    return user;
  };

  /**
   * Check if the authenticated client has access to edit content.
   * @method _hasAccess
   * @param  {User} user
   * @param  {User} model
   */
  controller._hasAccess = function (user, model) {
    if (user.id !== model.id && user.role !== 'admin') {
      throw error.parse({
        code    : 'ACCESS_DENIED',
        message : 'You do not have access to update this user'
      }, 401);
    }
  };

  /**
   * @property _options
   * @type     Function
   */
  controller._options = config.user.filter.bind(null, query);

  /**
   * @private
   * @method getUser
   * @param  {String} id
   * @param  {Object} actor
   * @return {User}
   */
  function *getUser(id, actor) {
    let user = yield User.findById(id);
    if (!user) {
      throw error.parse({
        code    : 'USER_NOT_FOUND',
        message : 'The requested user was not found in our records'
      }, 404);
    }
    user._actor = actor;
    return user;
  }

  return controller;
  
});