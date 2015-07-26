'use strict';

let bcrypt = require('co-bcrypt');
let queue  = Reach.service('queue');
let User   = Reach.model('User');
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

  UsersController.prototype.confirmEmail = function *() {
    // ...
  };

  /**
   * Returns the profile of the authenticated user
   * @method me
   * @return {object}
   */
  UsersController.prototype.me = function *() {
    return this.auth.user;
  };

 return UsersController;

});