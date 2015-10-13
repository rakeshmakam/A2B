/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var jwt = require('jsonwebtoken');
var Client = require('node-rest-client').Client;

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

    //Reset Password Initiate.
	resetPasswordInitiate: function (req, res) {
    	if (req.body.email) {
			User.resetPasswordInitiate(req.body.email, function (err, user) {
				if (!err) {
					res.json(user);

					EmailService.resetPassword(user, function (error, data) {
						if (!error) {
							sails.log.debug(data);
						} else {
							sails.log.error(error);
						}
					});
				} else {
					res.negotiate(err);
				}
			});
    	} else {
    		res.status(400).json({message: "Email is missing"});
    	}
    },

    //reset the password
    resetPassword: function(req, res){
    	if(req.body.hash_key && req.body.password){
    		User.resetPassword(req.body, function (err, user) {
    			if (!err) {
    				res.json("Password has been reset successfully.");
    			} else {
    				res.negotiate(err);
    			}
    		})
    	} else {
    		res.status(400).json({message: "Password or hashKey is missing"});
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
    	Merchant.validateMerchant(req.body.merchantId, function(err, merchantDetails){
    		if(err){
    			res.serverError(err);
    		}else if(merchantDetails == false){
    			res.status(401).json({msg : 'Merchant not registered'});
    		}else{
    			var encodedStr = new Buffer(process.env.USERNAME+":"+process.env.PASSWORD).toString('base64');
    			var client = new Client();

    			var args = {
    				data: {
			    		userId: '5618f029d4c6ef6543d6d42a',
			    		merchantId: req.body.merchantId,
			    		amount: req.body.amount,
			    		currency : req.body.currency
			    	},
			    	headers:{
			    		"authorization": "Basic "+encodedStr,
			    		"Content-Type": "application/json"
			    	} 
    			};

    			client.post("http://52.11.231.112:8080/admin/user/authToken",args,function(data, response){
    				sails.log.debug(data);
    				// sails.log.debug(response);
    				// res.json({Resp:response, Data: data});
    				res.send(response);
    			});

		    	// res.json({userToken: "ABC123"});
		    	//call java api
    		}
    	});
    },

    userPayment: function(req, res){
    	sails.log.debug('user payment initiated');
    	// var encodedAuth = req.headers.authorization.substr(6,req.headers.authorization.length-1);
    	// var decoded = new Buffer(encodedAuth,"base64").toString();
    	
    	// var usn = decoded.substr(0,decoded.indexOf(':'));
    	// var pwd = decoded.substr(decoded.indexOf(':')+1,decoded.length-1);

    	// var merchantCredentials = {
    	// 	merchantId : usn,
    	// 	merchantKey : pwd
    	// };

    	Merchants.authorizePayment(merchantCredentials, function(err, merchantData){
    		if(err){
    			res.serverError(err);
    		}else{
    			var validUserReq = null;
    			if(merchantData.status == true){
    				var encodedStr = new Buffer(process.env.USERNAME+":"+process.env.PASSWORD).toString('base64');
	    			var client = new Client();

	    			var args = {
	    				data: {
				    		merchantId: merchantData.merchant_id,
		    				merchant: merchantData.merchant_name,
		    				userId: req.user.id,
		    				currency: req.body.currency,
		    				amount: req.body.amount,
		    				description: req.body.description,
		    				metaData: req.body.metadata,
		    				reciptEmail: req.body.recipt_email,
		    				reciptNumber: req.body.recipt_number,
		    				shippingInfo: req.body.shipping_info,
		    				statementDescriptor: req.body.statement_descriptor,
		    				status: req.body.status,
		    				// transactionId: transaction_id,
		    				merchantTransactionId : req.body.merchant_transaction_id,
		    				userAuthToken: req.body.user_token
				    	},
				    	headers:{
				    		"authorization": "Basic "+encodedStr,
				    		"Content-Type": "application/json"
				    	} 
	    			};

	    			// client.post("http://52.11.231.112:8080/admin/user/authToken",args,function(data, response){
	    			// 	sails.log.debug(data);
	    			// 	sails.log.debug(response);
	    			// 	res.json({Resp:response, Data: data});
	    			// });

	    			//Make request to Java API
	    			sails.log.debug('Payment done successfully');
	    			res.json({msg:'payment done successfully'});
    			}else{
    				res.status(401).json({msg:'Unauthorized merchant key', status: false, error:'merchant'});
    			}
    		}
    	});
    },

    check:function(req, res){
    	res.json({env: process.env});
    }
};