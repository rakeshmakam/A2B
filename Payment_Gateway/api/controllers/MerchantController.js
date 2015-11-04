/**
 * MerchantController
 *
 * @description :: Server-side logic for managing Merchants
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Client = require('node-rest-client').Client;
var Aes = require('crypto-libraries/aes-ctr');
var SHA1 = require('crypto-libraries/sha1');
var baseUrl = "http://52.11.231.112:8080";
var jwt = require('jsonwebtoken');

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
		// var cipherText = req.body.payload;

		var dataToHash = {
			email: req.body.email,
			phoneNumber:req.body.phoneNumber,
			billingAddress:{
				street: req.body.street,
				city: req.body.city,
				state: req.body.state,
				postalCode: req.body.postalCode
			}
		};

		var hashedData = SHA1.hash(JSON.stringify(dataToHash));
		// res.json(hashedData);
		// eb427e1129e3267dbd879af756f72da1bf934263
		// 80dca60cd040a3606679c9c32d9de29e8ad10c1f
		// var encyptedHash = Aes.encrypt(hashedData, 'Add2Bill', 256);
		// res.json(encyptedHash);

		var decryptedHash = Aes.decrypt(req.body.payload, 'rakesh', 256);
		res.json(decryptedHash);

		if(decryptedHash != hashedData){
			sails.log.debug('hashes not same! Data modified!');
			res.status(401).json({error:'Data unauthorized!'});
		}else{
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
		}
	}
};