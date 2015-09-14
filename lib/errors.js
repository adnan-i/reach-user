'use strict';

module.exports = {

  CONFIG_MISSING : {
    code     : `USER_CONFIG_MISSING`,
    message  : `Missing required user configuration.`,
    solution : `Make sure you have created the user configuration in your configuration setup.`
  },

  CONFIG_MISSING_ADMINS : {
    code     : `USER_CONFIG_MISSING_ADMINS`,
    message  : `Missing administrator list in the user configuration.`,
    solution : `Make sure 'admins' has been defined in your user configuration.`
  },

  CONFIG_INVALID_ADMINS_TYPE : {
    code     : `USER_CONFIG_INVALID_ADMINS_TYPE`,
    message  : `The 'admins' value is not an array.`,
    solution : `Make sure 'admins' is a valid array.`
  }

};