/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var jwt = require('jsonwebtoken');

module.exports = {
	// Add user
	add: function (req, res) {
		User.add(req.body, function(err, user){
			if (err) {
				res.serverError(err);
			} else {
				res.ok({message: "Thank you for signing up with us"});

				EmailService.send(user, function(error, data){
					if (!error) {
						sails.log.debug(data);
					} else {
						sails.log.error(error);
					}
				});
			}
		});
		// if (!req.body && !req.body.full_name && !req.body.email && !req.body.phone_num && !req.body.userPassword) {
		// 	res.badRequest('Email or password missing in request');
		// } else {
		// 	User.add(req.body, function(err, user){
		// 		if (err) {
		// 			res.serverError(err);
		// 		} else {
		// 			res.ok({message: "Thank you for signing up with us"});

		// 			EmailService.send(user, function(error, data){
		// 				if (!error) {
		// 					sails.log.debug(data);
		// 				} else {
		// 					sails.log.error(error);
		// 				}
		// 			});
		// 		}
		// 	});
		// }
	},

	signupActivate: function (req, res) {
		User.signupActivate(req.param('randam'), function (err, data) {
			if (!err) {
				res.json(data);
			} else { 
				res.negotiate(err);
			}
		});
	},

	// Login
	login: function (req, res) {
		if (!req.body && !req.body.email && !req.body.userPassword) {
			res.badRequest('Email or password missing in request');
		} else {
			User.login(req.body, function (err, user) {
				if (err) {
					res.serverError(err);
				} else {
					var token = jwt.sign(user, 'secret', {expiresInMinutes: 60*5*100});
					user.token = token;
					req.user = user;
					res.json({user: user});
				}
			});
		}
	},

	// Get user profile
	profile: function (req, res) {
		var userId = req.user.id;
		
		User.profile(userId, function (err, user) {
			if (!err) {
				res.json(user);
			} else { 
				res.negotiate(err);
			}
		});
	},

	// Edit user profile
	edit: function (req, res) {
		var userId = req.user.id;

		if(userId){
			User.edit(userId, req.body, function (err, user) {
				if (!err) {
					delete user['password'];
					res.json(user);
				} else {
					res.negotiate(err);
				}
			});
		}
	},

	// Log out user
	logout: function (req, res) {
		delete req['user'];
        res.ok("Logout Successfully");
    },

    // Delete user
    delete: function (req, res){
    	var userId = req.param('id');

        if (userId) {
        	User.delete(userId, function (err, user) {
        		if (!err) {
        			res.json("Deleted Successfully");
        		} else { 
        			res.negotiate(err);
        		}
        	})
        } else {
        	res.status(400).json({message: "ID is missing"});
        }
    },

    addOrUpdateAddress: function(req, res){
    	sails.log.debug('Address adding or updating initiated');
    	if(!req.body && !req.body.addresses){
    		res.badRequest('No address supplied');
    	}else{
    		var userId = req.user.id;
    		Address.addOrUpdate(userId, req.body.addresses, function(err, updatedData){
    			if(err){
    				res.serverError(err);
    			}else{
    				sails.log.debug('Address added/updated');
    				res.json({status:true, addresses: updatedData});
    			}
    		});
    	}
    },

    userAuthorization: function(req, res){
    	sails.log.debug('user authorization initiated');
    	var dataToBeSigned = {
    		cart_value : req.body.cartValue,
    		amount: req.body.amount,
    		merchant_id: req.body.merchantId
    	};
		var token = jwt.sign(dataToBeSigned, 'secret', {expiresInMinutes: 2});
		sails.log.debug('Generated user authorization token');
		res.json({userAuthToken: token});
    },

    userPayment: function(req, res){
    	sails.log.debug('user payment initiated');
    	var payloadDigest = req.headers.digest;
    	//encrypt payload using your own key and match it with the digest in request header
    	//If they match then send a true status else false

    }
};

