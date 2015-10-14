/**
* Address.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		addressLine1: {
			type: "string",
			required : true,
			size: 200
		},

		addressLine2: {
			type: "string",
			size: 200
		},

		addressLine3: {
			type: "string",
			size: 200
		},

		city: {
			type: "string",
			required : true,
			size: 100
		},

		pinCode: {
			type: "integer",
			required : true,
			size: 6
		},

		user: {
			model: 'User',
			via: 'billingAddressId'
		}
	},

	add: function (data, callback) {
		Address.create(data, function (err, address) {
			if (err) {
				callback(err);
			} else {
				callback(null, address);
			}
		});
	}


	
};

