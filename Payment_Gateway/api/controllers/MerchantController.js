/**
 * MerchantController
 *
 * @description :: Server-side logic for managing merchants
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
	add: function(req, res){
		if(!req.body && !req.body.merchantName){
			res.badRequest('Merchant name required');
		}else{
			Merchants.addMerchant(req.body.merchantName, function(err, merchantData){
				if(err){
					res.serverError(err);
				}else{
					res.json({merchantDetails: merchantData});
				}
			});
		}
	}
};

