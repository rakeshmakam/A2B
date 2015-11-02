/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var jwt = require('jsonwebtoken');
var Client = require('node-rest-client').Client;
var baseUrl = "http://52.11.231.112:8080";

module.exports = {
	// Add user
	add: function (req, res) {
		var client = new Client();
		var args = {
			data: {
				fullName: req.body.fullName,
				email: req.body.email,
				phoneNumber: req.body.phoneNumber,
				password: req.body.password,
				addressLine1: req.body.addressLine1,
				addressLine2: req.body.addressLine2,
				addressLine3: req.body.addressLine3,
				city: req.body.city,
				pinCode: req.body.pinCode
			},
			headers:{
				"Content-Type": "application/json"
			} 
		};

		client.post(baseUrl+"/addtobill/v1/user/register", args, function(data, resp){
			if (data.error) {
				res.negotiate({error: data.error, message: data.message});
			} else {
				var args = {
					data: {
						userName: req.body.email,
						password: req.body.password
					},
					headers:{
						"Content-Type": "application/json"
					} 
				};

				client.post(baseUrl+"/addtobill/v1/user/login", args, function(data, resp){
					if (data.error) {
						res.negotiate({error: data.error, message: data.message});
					} else {
						var sailsToken = jwt.sign(data, 'secret', {expiresIn: 1296000}); //15 days
						data.sailsToken = sailsToken;
						data.javaToken = data.token;
						delete data.token;
						console.log(data);
						req.user = data;
						res.json({token: data.sailsToken});
					}
				});
			}
		});
	},

	// Login
	login: function (req, res) {
		if (!req.body && !req.body.userName && !req.body.password) {
			res.badRequest('Email or password missing in request');
		} else {
			var client = new Client();
			var args = {
				data: {
					userName: req.body.userName,
					password: req.body.password
				},
				headers:{
					"Content-Type": "application/json"
				} 
			};

			client.post(baseUrl+"/addtobill/v1/user/login", args, function(data, resp){
				if (data.error) {
					res.negotiate({error: data.error, message: data.message});
				} else {
					var sailsToken = jwt.sign(data, 'secret', {expiresIn: 1296000}); //15 days
					data.sailsToken = sailsToken;
					data.javaToken = data.token;
					delete data.token;
					console.log(data);
					req.user = data;
					res.json({token: data.sailsToken});
				}
			});
		}
	},

	// Get user profile
	profile: function (req, res) {
		var client = new Client();
		var args = {
			headers:{
				"Content-Type": "application/json",
				"A2B-AUTH-TOKEN": req.user.token
			} 
		};

		client.get(baseUrl+"/addtobill/v1/user", args, function(data, resp){
			if (data.error) {
				res.negotiate({error: data.error, message: data.message});
			} else {
				res.json(data);
			}
		});
	},

	// // Edit user profile
	// edit: function (req, res) {
	// 	var userId = req.user.id;

	// 	if(userId){
	// 		User.edit(userId, req.body, function (err, user) {
	// 			if (!err) {
	// 				delete user['password'];
	// 				res.json(user);
	// 			} else {
	// 				res.negotiate(err);
	// 			}
	// 		});
	// 	}
	// },

	// Log out user
	logout: function (req, res) {
		delete req['user'];
        res.ok("Logout Successfully");
    },

    // // Delete user
    // delete: function (req, res){
    // 	var userId = req.param('id');

    //     if (userId) {
    //     	User.delete(userId, function (err, user) {
    //     		if (!err) {
    //     			res.json("Deleted Successfully");
    //     		} else { 
    //     			res.negotiate(err);
    //     		}
    //     	})
    //     } else {
    //     	res.status(400).json({message: "ID is missing"});
    //     }
    // },

 //    //Reset Password Initiate.
	// resetPasswordInitiate: function (req, res) {
 //    	if (req.body.email) {
	// 		User.resetPasswordInitiate(req.body.email, function (err, user) {
	// 			if (!err) {
	// 				Activate.add({user: user.id}, function (e, result) {
	// 					if (e) {
	// 						res.negotiate(e);
	// 					} else { 
	// 						res.json({message: "Please check your mail"});

	// 						EmailService.resetPassword(user.emailId, result, function (error, data) {
	// 							if (!error) {
	// 								sails.log.debug(data);
	// 							} else {
	// 								sails.log.error(error);
	// 							}
	// 						});
	// 					}
	// 				});
	// 			} else {
	// 				res.negotiate(err);
	// 			}
	// 		});
 //    	} else {
 //    		res.status(400).json({message: "Email is missing"});
 //    	}
 //    },

    // //reset the password
    // resetPassword: function(req, res){
    // 	if(req.body.emailVerificationToken && req.body.password){
    // 		Activate.resetPassword(req.body, function (err, user) {
    // 			if (!err) {
    // 				res.json("Password has been reset successfully.");
    // 			} else {
    // 				res.negotiate(err);
    // 			}
    // 		})
    // 	} else {
    // 		res.status(400).json({message: "Password or hashKey is missing"});
    // 	}
    // },

    // addOrUpdateAddress: function(req, res){
    // 	sails.log.debug('Address adding/updating initiated');
    // 	if(!req.body && !req.body.addresses){
    // 		res.badRequest('No address supplied');
    // 	}else{
    // 		var userId = req.user.id;
    // 		Address.addOrUpdate(userId, req.body.addresses, function(err, updatedData){
    // 			if(err){
    // 				res.serverError(err);
    // 			}else{
    // 				sails.log.debug('Address added/updated');
    // 				res.json({status:true, addresses: updatedData});
    // 			}
    // 		});
    // 	}
    // },

    getAccounts: function(req, res){
    	sails.log.debug('getting accounts for user id - '+req.user.id);
    	var client = new Client();

    	var getArgs = {
    		headers: {
    			"A2B-AUTH-TOKEN": req.user.token,
				"Content-Type": "application/json"
    		}
    	};

    	client.get(baseUrl+"/addtobill/v1/user/accounts", getArgs, function(userAccounts, resp){
    		if(userAccounts.error){
    			sails.log.debug('error in getting accounts for user '+req.user.id);
    			sails.log.debug(userAccounts);
    			res.negotiate({error: userAccounts.error, message: userAccounts.message});
    		}else{
    			sails.log.debug('accounts fetched for this user successfully');
    			res.json({accounts: userAccounts});
    		}
    	});
    },

    getAccount: function(req, res){
    	sails.log.debug('fetching single account for user '+req.user.id);
    	var accountId = req.param('id');
    	var client = new Client();

    	var getArgs = {
    		headers: {
    			"A2B-AUTH-TOKEN": req.user.token,
				"Content-Type": "application/json"
    		}
    	};

    	client.get(baseUrl+"/addtobill/v1/user/account?id="+accountId, getArgs, function(userAccountData, resp){
    		if(userAccountData.error){
    			sails.log.debug('error fetching user account');
    			sails.log.debug(userAccountData);
    			res.negotiate({error: userAccountData.error, message: userAccountData.message});
    		}else{
    			sails.log.debug('user account fetched successfully');
    			res.json({userAccount: userAccountData});
    		}
    	});
    },

    getCharges: function(req, res){
    	sails.log.debug('fetching charges for user '+req.user.id);
    	var client = new Client();

    	var getArgs = {
    		headers: {
    			"A2B-AUTH-TOKEN": req.user.token,
				"Content-Type": "application/json"
    		}
    	};
    	//default size is 20 and page is 1
    	//page is how many pages you wanna show
    	//size is hwo many elements in each page
    	client.get(baseUrl+"/addtobill/v1/user/charges?size=100&page=0", getArgs, function(userCharges, resp){
    		if(userCharges.error){
    			sails.log.debug('error fetching user charges');
    			sails.log.debug(userCharges);
    			res.negotiate({error: userCharges.error, message: userCharges.message});
    		}else{
    			sails.log.debug('user charges fetched successfully');
    			res.json({accounts: userCharges});
    		}
    	});
    },

    getCharge: function(req, res){
    	sails.log.debug('fetching single charge for user '+req.user.id);
    	var chargeId = req.param('id');
    	var client = new Client();

    	var getArgs = {
    		headers: {
    			"A2B-AUTH-TOKEN": req.user.token,
				"Content-Type": "application/json"
    		}
    	};

    	client.get(baseUrl+"/addtobill/v1/user/charge?id="+chargeId, getArgs, function(userChargeData, resp){
    		if(userChargeData.error){
    			sails.log.debug('error fetching user charge');
    			sails.log.debug(userChargeData);
    			res.negotiate({error: userChargeData.error, message: userChargeData.message});
    		}else{
    			sails.log.debug('user charge fetched successfully');
    			res.json({userAccount: userChargeData});
    		}
    	});
    },

    getTransactions: function(req, res){
    	sails.log.debug('fetching transactions for user '+req.user.id);
    	var client = new Client();

    	var getArgs = {
    		headers: {
    			"A2B-AUTH-TOKEN": req.user.token,
				"Content-Type": "application/json"
    		}
    	};

    	client.get(baseUrl+"/addtobill/v1/user/transactions", getArgs, function(userTransactions, resp){
    		if(userTransactions.error){
    			sails.log.debug('error fetching user transactions');
    			sails.log.debug(userTransactions);
    			res.negotiate({error: userTransactions.error, message: userTransactions.message});
    		}else{
    			sails.log.debug('user transactions fetched successfully');
    			res.json({accounts: userTransactions});
    		}
    	});
    },

    getBills: function(req, res){
    	// console.log(req.user);
    	sails.log.debug('fetching bills for user '+req.user.id);
    	var client = new Client();

    	var getArgs = {
    		headers: {
    			"A2B-AUTH-TOKEN": req.user.token,
				"Content-Type": "application/json"
    		}
    	};

    	client.get(baseUrl+"/addtobill/v1/user/accounts", getArgs, function(userAccounts, resp){
    		if(userAccounts.error){
    			sails.log.debug('error in getting accounts for user '+req.user.id);
    			// sails.log.debug(userAccounts);
    			res.negotiate({error: userAccounts.error, message: userAccounts.message});
    		}else{
    			sails.log.debug(userAccounts);
    			Bills.get(userAccounts[0].accountId, function(err, bills){
    				if(err){
    					res.serverError(err);
    				}else{
    					res.json({userBills: bills});
    				}
    			});
    		}
    	});
    },

    checkUserMerchantAssociation: function(req, res){
    	if(!req.body && !req.body.vendorUserId && !req.body.merchantId){
			res.badRequest('Please provide all details');
		}else{
			var client = new Client();
			var args = {
				data: {
					merchantId: req.body.merchantId,
					// vendorUserId: req.body.vendorUserId
					vendorUserId: parseInt((Math.random())*1000)

				},
				headers: {
					"A2B-AUTH-TOKEN": req.user.token,
					"Content-Type": "application/json"
				}
			};

			var getArgs = {
				headers: {
					"A2B-AUTH-TOKEN": req.user.token,
					"Content-Type": "application/json"
				}
			};

			client.get(baseUrl+"/addtobill/v1/user/merchant?merchantId="+req.body.merchantId, getArgs, function(existingData, response){
				if(existingData.status != 404 && existingData.error){
					sails.log.debug('user-merchant mapping search failed!');
					res.negotiate({error: existingData.error, message: existingData.message});
				}else if(existingData.status == 404){
					sails.log.debug('user-merchant mapping not found. Creating a new mapping.');

					client.post(baseUrl+"/addtobill/v1/user/merchant", args, function(createdData, response){
						if(createdData.error){
							sails.log.debug('user-merchant mapping creation failed!');
							res.negotiate({error: createdData.error, message: createdData.message});
						}else{
							sails.log.debug('new user-merchant mapping created.')
							res.json({mappingResponse : createdData});
						}
					});

				}else{
					sails.log.debug('user-merchant mapping found.');
					res.json({mappingResponse : existingData});
				}
			});
		}
    },

    userAuthorization: function(req, res){
    	sails.log.debug('user authorization initiated');	
    	var client = new Client();

		var args = {
			data: {
	    		// userId: req.user.id,
	    		merchantId: req.body.merchantId,
	    		amount: req.body.amount,
	    		currency : req.body.currency
	    	},
	    	headers:{
	    		"A2B-AUTH-TOKEN": req.user.token,
	    		"Content-Type": "application/json"
	    	}
		};

		client.post(baseUrl+"/addtobill/v1/user/authToken",args,function(data, response){
			// sails.log.debug(data);
			if(data.error){
				sails.log.debug('user authorization failed');
				res.negotiate({error: data.error, message: data.message});
			}else if(data.token){
				sails.log.debug('user authorization successfull');
				res.json({userToken: data.token});
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
    	// 	merchantEmail : usn,
    	// 	merchantPassword : pwd
    	// };
    	
    	// var encodedStr = new Buffer(process.env.NODEUSERNAME+":"+process.env.NODEPASSWORD).toString('base64');
		console.log(req.body);
		var client = new Client();

		var args = {
			data: {
				token: req.body.user_token,
				description: req.body.description,
				statementDescriptor: req.body.statement_descriptor
	    	},
	    	headers:{
	    		// "authorization": "Basic "+encodedStr,
	    		"Authorization" : req.headers.authorization,
	    		"Content-Type": "application/json"
	    	}
		};
		console.log('args--',args);

		client.post(baseUrl+"/addtobill/v1/merchant/charge",args,function(data, response){
			if(data.error){
				sails.log.debug('error in user payment');
				res.negotiate({error:data.error, message: data.message});
			}else{
				sails.log.debug('successfull payment');
				res.json({paymentResponse:data});
			}
		});
    }
};