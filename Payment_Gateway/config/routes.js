/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },
  'GET /v1/show_hide_atob_button'          : 'AppController.showHideAtoBButton',

  'POST /v1/user/signup'                   : 'UserController.add',
  'POST /v1/user/login'                    : 'UserController.login',
  'GET /v1/user/logout'                    : 'UserController.logout',
  'GET /v1/user'                           : 'UserController.profile',

  // 'POST /user/signup'                   : 'UserController.add',
  // 'GET /user'                           : 'UserController.profile',
  // 'PUT /user'                           : 'UserController.edit',
  // 'POST /user/login'                    : 'UserController.login',
  // 'GET /user/logout'                    : 'UserController.logout',
  // 'DELETE /user/:id'                    : 'UserController.delete',  
  // 'GET /user/activate/:random'          : 'UserController.signupActivate',
  // 'POST /user/reset_password_initiate'  : 'UserController.resetPasswordInitiate',
  // 'PUT /user/reset_password'            : 'UserController.resetPassword',

  'POST /v1/merchant/user/exists'          : 'MerchantController.autoLogin',
  // '/user/getUserProfile'        :           'UserController.getUserProfile',
  'GET /v1/user/accounts'                  : 'UserController.getAccounts',
  'GET /v1/user/account/:id'               : 'UserController.getAccount',
  'GET /v1/user/charges'                   : 'UserController.getCharges',
  'GET /v1/user/charge/:id'                : 'UserController.getCharge',
  'GET /v1/user/transactions'              : 'UserController.getTransactions',
  'GET /v1/user/allbills'                  : 'UserController.getBills',
  // '/user/getUserPurchases'      :           'UserController.getUserPurchases',
  'POST /v1/user/exists'                   : 'UserController.checkUserMerchantAssociation',
  'POST /v1/user/authorize'                : 'UserController.userAuthorization',
  'POST /v1/user/payment'                  : 'UserController.userPayment',

  'GET /v1/merchants'                      : 'MerchantController.get',

  'POST /v1/admin/users'                   : 'AdminController.getUsers',
  'GET /v1/admin/charges'                  : 'AdminController.getCharges',
  'GET /v1/admin/transactions'             : 'AdminController.getTransactions',
  'GET /v1/admin/accounts'                 : 'AdminController.getAccounts',
  'GET /v1/admin/bills'                    : 'AdminController.getBills'

  // 'POST /merchant'              :           'MerchantController.add',
  // 'GET /check'  : 'UserController.check'

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
