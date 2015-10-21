/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var jwt = require('jsonwebtoken');
var Client = require('node-rest-client').Client;
var baseUrl = "http://52.11.231.112:8080";
var NODEUSERNAME = 'admin';
var NODEPASSWORD = 'admin';

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

		client.post(baseUrl+"/user/register", args, function(data, resp){
			if (data.error) {
				res.negotiate({error: data.error, message: data.message});
			} else {
				res.json(data);
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

			client.post(baseUrl+"/user/login", args, function(data, resp){
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

			if(req.body.vendorUserId && req.body.merchantId){
				var args = {
					data: {
						merchantId: req.body.merchantId,
						vendorUserId: req.body.vendorUserId
					},
					headers: {
						"A2B-AUTH-TOKEN": req.user.javaToken,
						"Content-Type": "application/json"
					}
				};

				client.post(baseUrl+"/user/merchant", args, function(data, response){
					if(data.error){
						res.json({error: data.error, message: data.message});
						sails.log.debug(data);
					}
				});
			}
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

		client.get(baseUrl+"/user", args, function(data, resp){
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
		console.log(req);
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

    userAuthorization: function(req, res){
    	sails.log.debug('user authorization initiated');
    	// var userId = req.user.id;
    	// Merchant.validateMerchant(req.body.merchantId, function(err, merchantDetails){
    	// 	if(err){
    	// 		res.serverError(err);
    	// 	}else if(merchantDetails == false){
    	// 		res.status(401).json({msg : 'Merchant not registered'});
    	// 	}else{
    	// 		// var encodedStr = new Buffer(process.env.NODEUSERNAME+":"+process.env.NODEPASSWORD).toString('base64');
    	// 	}
    	// });
	
		sails.log.debug(req.user);
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

		client.post(baseUrl+"/user/authToken",args,function(data, response){
			// sails.log.debug(data);
			if(data.error){
				res.json({error: data.error, message: data.message});
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
		var client = new Client();

		var args = {
			data: {
				// userId: req.body.userId,
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

		client.post(baseUrl+"/merchant/charge",args,function(data, response){
			if(data.error){
				sails.log.debug('error in user payment');
				res.json({error:data.error, message: data.message});
			}else{
				sails.log.debug('successfull payment');
				res.json({paymentResponse:data});
			}
		});

    	//Check if merchant is legitimate
    	// User.checkMerchantAuthorization(merchantCredentials, function(err, merchantDetails){
    	// 	if(err){
    	// 		res.serverError(err);
    	// 	}else if(merchantDetails == 'unknown'){
    	// 		res.status(403).json({msg : 'Unknown merchant credentials'});
    	// 	}else if(merchantDetails == 'unregistered'){
    	// 		res.status(401).json({msg : 'Merchant not registered'});
    	// 	}else if(merchantDetails.status == true){
    	// 	}
    	// });
    }

    // check:function(req, res){
    // 	res.json({env: process.env});
    // }
};