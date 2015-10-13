/**
* Merchants.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		merchant_id:{
			type:"string"
		},

		merchant_name:{
			type:"string"
		},

		merchant_auth_key:{
			type:"string"
		}
	},

	addMerchant: function(merchantName, callback){
		var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
		var merchantAuthKey = '';
	  	for (var i = 0; i < 40; i++) {
	    	var p = Math.floor(Math.random() * set.length);
	    	merchantAuthKey += set[p];
	  	}
	  	var merchantId = '';
	  	for (var i = 0; i < 20; i++) {
	    	var p = Math.floor(Math.random() * set.length);
	    	merchantId += set[p];
	  	}
	  	var merchant = {
	  		merchant_id: merchantId,
			merchant_name: merchantName,
			merchant_auth_key: merchantAuthKey
	  	};
	  	Merchant.create(merchant).exec(function(err, merchantData){
	  		if(err){
	  			callback(err, null);
	  		}else{
	  			callback(null, merchantData);
	  		}
	  	});
	},

	validateMerchant: function(merchantId, callback){
		Merchant.findOne({id: merchantId}).exec(function(err, merchantData){
			if(err){
				callback(err, null);
			}else if(merchantData){
				callback(null,merchantData);
			}else{
				callback(null, false);
			}
		});
	},

	// authorizePayment: function(merchantCreds, callback){
	// 	Merchant.findOne({merchant_auth_key: merchantCreds.merchantId, merchant_auth_key: merchantCreds.merchantKey}).exec(function(err, merchantRecord){
	// 		if(err){
	// 			callback(err, null);
	// 		}else if(merchantRecord){
	// 			merchantRecord.status = true;
	// 			callback(null, merchantRecord);
	// 		}else{
	// 			callback(null, false);
	// 		}
	// 	});
	// }
};

