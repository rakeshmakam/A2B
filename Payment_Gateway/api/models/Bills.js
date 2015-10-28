/**
* Bills.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {

	},

	get: function(userAcctId, callback){
		Bills.find({accountId: userAcctId}).exec(function(err, bills){
			if(err){
				callback(err, null);
			}else{
				callback(null, bills);
			}
		});
	}
};

