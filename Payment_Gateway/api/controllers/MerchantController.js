/**
 * MerchantController
 *
 * @description :: Server-side logic for managing Merchants
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	get: function(req, res){
		Merchant.get(function(err, merchants){
			if(err){
				res.serverError(err);
			}else{
				res.json({merchants: merchants});
			}
		});
	}
};