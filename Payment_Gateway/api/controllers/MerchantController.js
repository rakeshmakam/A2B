/**
 * MerchantController
 *
 * @description :: Server-side logic for managing Merchants
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Client = require('node-rest-client').Client;
var Aes = require('crypto-libraries/aes-ctr');

module.exports = {
	get: function(req, res){
		Merchant.get(function(err, merchants){
			if(err){
				res.serverError(err);
			}else{
				res.json({merchants: merchants});
			}
		});
	},

	autoLogin: function(req, res){
		var payloadFlag = false;
		var cipherText = req.body.payload;
		var plainText = Aes.decrypt(cipherText, 'rakesh', 256);
		if(cipherText.email != req.body.email){
			payloadFlag = true;
		}else if(cipherText.phoneNumber != req.body.phoneNumber){
			payloadFlag = true;
		}else if(cipherText.billingAddress.street != req.body.street){
			payloadFlag = true;
		}else if(cipherText.billingAddress.city != req.body.city){
			payloadFlag = true;
		}else if(cipherText.billingAddress.postalCode != req.body.postalCode){
			payloadFlag = true;
		}else if(cipherText.billingAddress != req.body.state){
			payloadFlag = true;
		}else if(payloadFlag == true){
			res.status(401).json({error:'Data unauthorized!'});
		}else{
			var client = new Client();

			var args = {
				data: {
					email: req.body.email,
					phoneNumber: req.body.phoneNumber,
					payload: req.body.payload,
					billingAddress: {
						street: req.body.street,
						city: req.body.city,
						postalCode: req.body.postalCode,
						state: req.body.state
					}
		    	},
		    	headers:{
		    		"Authorization" : req.headers.authorization,
		    		"Content-Type": "application/json"
		    	}
			};

			client.post(baseUrl+"/addtobill/v1/merchant/user/login",args,function(data, response){
				if(data.error){
					sails.log.debug('error in merchant user login');
					res.negotiate({error:data.error, message: data.message});
				}else{
					sails.log.debug('successfull merchant user login');
					res.json({paymentResponse:data});
				}
			});
		}
	}
};