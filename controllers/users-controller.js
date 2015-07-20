'use strict';

let bcrypt = require('co-bcrypt');
let flux   = Reach.IO.flux;
let User   = Reach.model('User');

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
    var resourceName   = this._resource.name;
    var model          = new User(post);
        model.password = yield bcrypt.hash(post.password, 10);

    yield model.save();

    // ### Flux Action

    var payload = {};

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

 return UsersController;

});