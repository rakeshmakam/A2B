/**
 * MerchantController
 *
 * @description :: Server-side logic for managing Merchants
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Client = require('node-rest-client').Client;

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

	merchantUserLogin: function(req, res){
		var client = new Client();

		var args = {
			data: {
				email: req.body.email,
				phoneNumber: req.body.phoneNumber,
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
};