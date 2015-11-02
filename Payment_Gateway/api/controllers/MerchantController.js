/**
 * MerchantController
 *
 * @description :: Server-side logic for managing Merchants
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Client = require('node-rest-client').Client;
var Aes = require('crypto-libraries/aes-ctr');
var baseUrl = "http://52.11.231.112:8080";

module.exports = {
	get: function(req, res){
		Merchant.get(function(err, merchants){
			if(err){
				res.serverError(err);
			}else{
				sails.log.debug('fetched successfully');
				res.json({merchants: merchants});
			}
		});
	},

	autoLogin: function(req, res){
		sails.log.debug('initialized autologin');
		var payloadFlag = false;
		var cipherText = req.body.payload;
		sails.log.debug(cipherText);
		var plainText = Aes.decrypt(cipherText, 'rakesh', 256);
		console.log(plainText);

		// if(plainText.email != req.body.email){
		// 	payloadFlag = true;
		// }else if(plainText.phoneNumber != req.body.phoneNumber){
		// 	payloadFlag = true;
		// }else if(plainText.billingAddress.street != req.body.street){
		// 	payloadFlag = true;
		// }else if(plainText.billingAddress.city != req.body.city){
		// 	payloadFlag = true;
		// }else if(plainText.billingAddress.postalCode != req.body.postalCode){
		// 	payloadFlag = true;
		// }else if(plainText.billingAddress != req.body.state){
		// 	payloadFlag = true;
		// }else if(payloadFlag == true){
		// 	sails.log.debug('error in flag');
		// 	res.status(401).json({error:'Data unauthorized!'});
		// }else{
			var client = new Client();

			var args = {
				data: req.body,
		    	headers:{
		    		"Authorization" : req.headers.authorization,
		    		"Content-Type": "application/json"
		    	}
			};

			sails.log.debug('before sending req to java');
			client.post(baseUrl+"/addtobill/v1/merchant/user/login",args,function(data, response){
				console.log(data);
				if(data.error){
					sails.log.debug('error in merchant user login');
					res.negotiate({error:data.error, message: data.message});
				}else{
					if(data.token){
						var sailsToken = jwt.sign(data, 'secret', {expiresIn: 1296000}); //15 days
						data.sailsToken = sailsToken;
						data.javaToken = data.token;
						delete data.token;
						console.log(data);
						req.user = data;
						sails.log.debug('successfull merchant user login');
						res.json({token: data.sailsToken});
					}else{
						sails.log.debug('other data');
						res.json({resp: data});
					}
				}
			});
		// }
	}
};