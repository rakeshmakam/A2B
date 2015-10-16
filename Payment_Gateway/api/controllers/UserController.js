/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var jwt = require('jsonwebtoken');
var Client = require('node-rest-client').Client;
var baseUrl = "http://localhost:8080";
var NODEUSERNAME = 'admin';
var NODEPASSWORD = 'admin';
module.exports = {
	// Add user
	add: function (req, res) {
		var reqData = {fullName: req.body.full_name, emailId: req.body.email, phoneNumber: req.body.phone_num, password: req.body.password}
		User.add(reqData, function(err, user){
			if (err) {
				res.negotiate(err);
			} else {
				var address = {user: user.id, addressLine1: req.body.address_line1, addressLine2: req.body.address_line2, addressLine3: req.body.address_line3, city: req.body.city, pinCode: req.body.pinCode}
				Address.add(address, function(e, resp){
					if (e) {
						res.negotiate(e);
					} else {
						Activate.add({user: user.id}, function (e, result) {
							if (e) {
								res.negotiate(e);
							} else {
								// var client = new Client();
				    // 			var encodedStr = new Buffer(NODEUSERNAME+":"+NODEPASSWORD).toString('base64');
 
								// var args = {
				    // 				data: {
							 //    		userId: user.id,
								// 		currency: user.currency
							 //    	},
							 //    	headers:{
							 //    		"authorization": "Basic "+encodedStr,
							 //    		"Content-Type": "application/json"
							 //    	} 
				    // 			};
								// client.post(baseUrl+"/admin/user", args, function(data, resp){
				    // 				if (data.error) {
				    // 					res.json({error: data.error, message: data.message});
				    // 				} else {
				    // 					res.json({message: "Your account is activated successfully, please try to login"});
				    // 				}
				    // 			});
				    			res.json({message: "Your account is activated successfully, please try to login"});

								EmailService.send(user.emailId, {'emailVerificationToken' : result.emailVerificationToken}, function(error, data){
									if (!error) {
										sails.log.debug(data);
									} else {
										sails.log.error(error);
									}
								});
							}
						});
					}
				});
			}
		});
	},

	signupActivate: function (req, res) {
		Activate.signup(req.param('random'), function (err, user) {
			if (!err) {
				var client = new Client();
				var encodedStr = new Buffer(NODEUSERNAME+":"+NODEPASSWORD).toString('base64');

				var args = {
					data: {
						userId: user[0].id,
						currency: user[0].currency
					},
					headers:{
						"authorization": "Basic "+encodedStr,
						"Content-Type": "application/json"
					} 
				};

				client.post(baseUrl+"/admin/user", args, function(data, resp){
					if (data.error) {
						res.json({error: data.error, message: data.message});
					} else {
						res.json({message: "Your account is activated successfully, please try to login"});
					}
				});
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
					Activate.add({user: user.id}, function (e, result) {
						if (e) {
							res.negotiate(e);
						} else { 
							res.json({message: "Please check your mail"});

							EmailService.resetPassword(user.emailId, result, function (error, data) {
								if (!error) {
									sails.log.debug(data);
								} else {
									sails.log.error(error);
								}
							});
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
    	if(req.body.emailVerificationToken && req.body.password){
    		Activate.resetPassword(req.body, function (err, user) {
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
    			var encodedStr = new Buffer(process.env.NODEUSERNAME+":"+process.env.NODEPASSWORD).toString('base64');
    			var client = new Client();

    			var args = {
    				data: {
			    		userId: req.user.id,
			    		merchantId: req.body.merchantId,
			    		amount: req.body.amount,
			    		currency : req.body.currency
			    	},
			    	headers:{
			    		"Authorization": "Basic "+encodedStr,
			    		"Content-Type": "application/json"
			    	}
    			};

    			client.post(baseUrl+"/admin/user/authToken",args,function(data, response){
    				// sails.log.debug(data);
    				if(data.error){
    					res.json({error: data.error, message: data.message});
    				}else if(data.token){
    					sails.log.debug('user authorization successfull');
    					res.json({userToken: data.token});
    				}
    			});
    		}
    	});
    },

    userPayment: function(req, res){
    	sails.log.debug('user payment initiated');
    	var encodedAuth = req.headers.authorization.substr(6,req.headers.authorization.length-1);
    	var decoded = new Buffer(encodedAuth,"base64").toString();
    	
    	var usn = decoded.substr(0,decoded.indexOf(':'));
    	var pwd = decoded.substr(decoded.indexOf(':')+1,decoded.length-1);

    	var merchantCredentials = {
    		merchantEmail : usn,
    		merchantPassword : pwd
    	};
    	
    	//Check if merchant is legitimate
    	User.checkMerchantAuthorization(merchantCredentials, function(err, merchantDetails){
    		if(err){
    			res.serverError(err);
    		}else if(merchantDetails == 'unknown'){
    			res.status(403).json({msg : 'Unknown merchant credentials'});
    		}else if(merchantDetails == 'unregistered'){
    			res.status(401).json({msg : 'Merchant not registered'});
    		}else if(merchantDetails.status == true){
    			var encodedStr = new Buffer(process.env.NODEUSERNAME+":"+process.env.NODEPASSWORD).toString('base64');
    			var client = new Client();

    			var args = {
    				data: {
	    				userId: req.body.userId,
	    				token: req.body.user_token,
	    				merchantId: req.body.merchantId,
	    				amount: req.body.amount,
	    				currency: req.body.currency,
	    				description: req.body.description,
	    				statementDescriptor: req.body.statement_descriptor,
	    				chargeDate : new Date()
			    	},
			    	headers:{
			    		"authorization": "Basic "+encodedStr,
			    		"Content-Type": "application/json"
			    	} 
    			};

    			client.post(baseUrl+"/admin/charge",args,function(data, response){
    				if(data.error){
    					sails.log.debug('error in user payment');
    					res.json({error:data.error, message: data.message});
    					sails.log.debug(data);
    				}else{
    					sails.log.debug('successfull payment');
    					res.json({paymentResponse:response});
    				}
    			});
    		}
    	});
    }

    // check:function(req, res){
    // 	res.json({env: process.env});
    // }
};