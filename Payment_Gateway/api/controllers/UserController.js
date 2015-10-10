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
		var reqData = {full_name: req.body.full_name, email: req.body.email, phone_num: req.body.phone_num, password: req.body.password}
		User.add(reqData, function(err, user){
			if (err) {
				res.negotiate(err);
			} else {
				res.json({message: "Thank you for signing up with us"});

				EmailService.send(user, function(error, data){
					if (!error) {
						sails.log.debug(data);
					} else {
						sails.log.error(error);
					}
				});
			}
		});
	},

	signupActivate: function (req, res) {
		User.signupActivate(req.param('random'), function (err, data) {
			if (!err) {
				res.json(data);
			} else { 
				res.negotiate(err);
			}
		});
	},

	// Login
	login: function (req, res) {
		if (!req.body && !req.body.email && !req.body.password) {
			res.badRequest('Email or password missing in request');
		} else {
			User.login(req.body, function (err, user) {
				if (err) {
					res.negotiate(err);
				} else {
					var token = jwt.sign(user, 'secret', {expiresIn: 1296000}); //15 days
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
    	sails.log.debug('Address adding/updating initiated');
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
    	var userId = req.user.id;
    	Merchants.validateMerchant(req.body.merchantId, function(err, merchantDetails){
    		if(err){
    			res.serverError(err);
    		}else if(merchantDetails == false){
    			res.status(401).json({msg : 'Merchant not registered'});
    		}else{
    			var dataToBeSigned = {
		    		user_id: userId,
		    		cart_value : req.body.cartValue,
		    		amount: req.body.amount,
		    		merchant_id: req.body.merchantId
		    	};
				var token = jwt.sign(dataToBeSigned, 'secret', {expiresIn: 120}); //2 minutes
				sails.log.debug('Generated user authorization token');
				res.json({userAuthToken: token});
    		}
    	});
    },

    userPayment: function(req, res){
    	sails.log.debug('user payment initiated');
    	var merchantKey = req.body.merchantAuthKey;
    	Merchants.authorizePayment(merchantKey, function(err, merchantData){
    		if(err){
    			res.serverError(err);
    		}else{
    			if(merchantData.status == true){
    				var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
					var transaction_id = '';
				  	for (var i = 0; i < 20; i++) {
				    	var p = Math.floor(Math.random() * set.length);
				    	transaction_id += set[p];
				  	}
	    			var transactionRequest = {
	    				merchantId: merchantData.merchant_id,
	    				merchant: merchantData.merchant_name,
	    				currency: req.body.currency,
	    				amount: req.body.amount,
	    				itemName: req.body.item_name,
	    				transactionId: transaction_id,
	    				merchantTransactionId : req.body.merchant_transaction_id
	    			};

	    			//Make request to Java API
	    			sails.log.debug('Payment done successfully');
	    			res.json({msg:'payment done successfully'});
    			}else{
    				res.status(401).json({msg:'Unauthorized merchant key', status: false, error:'merchant'});
    			}
    		}
    	});
    }
};