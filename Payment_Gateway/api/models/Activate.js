/**
* Activate.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var crypto = require('crypto');
module.exports = {

	attributes: {
		emailVerificationToken: {
			type: 'string',
			required : true
		},

		user: {
			model: 'User',
			via: 'activate'
		}
	},

	add: function (data, callback) {
		data.emailVerificationToken = crypto.randomBytes(20).toString('hex');
		Activate.create(data, function (err, result) {
			if (err) {
				callback(err);
			} else {
				callback(null,result);
			}
		});
	},

	signup: function (emailVerificationToken, callback) {
		console.log(emailVerificationToken);
		Activate.findOne({where:{emailVerificationToken: emailVerificationToken}}).exec(function (err, activate) {
			sails.log.debug(activate);
			sails.log.debug(err);
			if(err) {
	  			callback(err);
	  		} else if (activate) {
				User.update({id : activate.user}, {emailVerified: true}, function (error, userData) {
					if(!error) {
						callback(null, userData);
					} else {
						callback(error);
					}
				});
			} else {
				callback({status: 404, message: "We could not find your account."});
			}
		});
	}


	
};

