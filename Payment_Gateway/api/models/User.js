/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var crypto = require('crypto');

module.exports = {

	attributes: {
		fullName: {
			type:'string',
			required : true
		},

		emailId: {
			type: "string",
			required : true,
			unique: true,
			size: 100
		},

		roles: {
			type:'array',
			defaultsTo: 'ROLE_USER',
			required : true
		},

		phoneNumber: {
			type:'string',
			required : true,
			size:10
		},

		phoneVerified: {
			type : 'boolean',
			defaultsTo : false,
			required : true
		},

		password: {
			type:'string',
			required : true,
			size: 50
		},

		billingAddressId: {
			collection: 'Address',
			via: 'user'
		},

		emailVerified: {
			type : 'boolean',
			defaultsTo : false,
			required : true
		},

		currency: {
			type: 'string',
			defaultsTo : 'inr',
			required : true
		},

		activate: {
			collection: 'Activate',
			via: 'user'
		},

		toJSON: function () {
			var obj = this.toObject();
			delete obj.password;
			return obj;
	    }

	},

	// Add user
	add: function (data, callback) {
		saltAndHash(data.password,function (hash) {
	  		data.password = hash;
			User.create(data, function (err, user) {
			   	if (err) {
					callback(err);
				} else {
					callback(null, user);
			 	}
		  	});
		});
	},

	// Login 
	login: function (data, callback) {
		User.findOne({where:{emailId: data.email}}).populateAll().exec(function (err, user) {
	  		if(err) {
	  			callback(err);
	  		} else if (user) {
	  			if (user.emailVerified) {
		  			validatePassword(data.password, user.password, function (res) {
						if (res) {
							callback(null,user);
						} else {
							callback({status: 402, message: "Email or password does not match"});
						}
	  				});
		  		} else {
		  			callback({status: 402, message: "Email yet to be verified"});
		  		}
  			}
  			else{
  				callback({status: 402, message: "User does not exists"});
  			}
	  	});
	},

	// Get user profile
	profile:  function (id, callback) {
		User.findOne({id : id}).exec(function (err, user){
			if(!err) {
				callback(null , user);
			} else {
				callback(err);
			}
		});
	},

	// Edit user details
	edit: function (userId, data, callback) {
		if (data.password) {
			saltAndHash(data.password, function (hash) {
				data.password = hash;
			});
		};
		
		User.update({id : userId}, data, function (err, user) {
			if (!err) {
				if (user.length == 0) {
					callback({status: 402, message: "User not found"});
				} else {
					callback(null, user[0]);
				}
			} else {
				callback(err);
			}
		});
	},

	// Delete user
	delete: function (userId, callback) {
		User.destroy({id : userId}).exec(function (err, data) {
			if (!err) {
				if (data.length == 0) {
					callback({status: 402, message: "User not found"});
				} else {
					callback(null, data.id);
				}
			} else {
				callback(err);
			}
		});
    },

    resetPasswordInitiate: function(email, callback){
    	User.findOne({where: {emailId: email}}).populateAll().exec(function (err, user) {
    		if(!err){
    			callback(null, user);
    		} else {
    			callback(err);
    		}
    	});
    },

    //resetting the password
	resetPassword: function(data, callback) {
		User.findOne({where: {hash_key: data.hash_key}}).exec(function(err, user){
			if(!err){
				var obj = {};
				if (data.password) {
					saltAndHash(data.password, function (hash) {
						obj.password = hash;
					});
				};
				User.update({id : user.id}, obj, function (err, user) {
					if (!err) {
						if (user.length == 0) {
							callback({status: 402, message: "User not found"});
						} else {
							callback(null, user);
						}
					} else {
						callback(err);
					}
				});
			} else {
				callback(err)
			}
		});
    },

    checkMerchantAuthorization: function(merchantCreds, callback){
		User.findOne({email: merchantCreds.merchantEmail, password: merchantCreds.merchantPassword}).exec(function(err, merchantRecord){
			if(err){
				callback(err, null);
			}else if(merchantRecord){
				if(_.contains(merchantRecord.roles, "ROLE_MERCHANT")){
					merchantRecord.status = true;
					callback(null, merchantRecord);
				}else{
					callback(null, 'unknown')
				}
			}else{
				callback(null, 'unregistered');
			}
		});
	},

	search: function(searchKey, callback){
		var searchExp = new RegExp(searchKey,"gi");
		User.find(
			{$or: [
					{full_name: searchExp},
					{email: searchExp},
					{phone_num: searchExp}
				]
			}
		).exec(function(err, results){
			if(err){
				callback(err, null);
			}else{
				callback(null, results);
			}
		});
	}

};

var generateSalt = function(){
  	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
  	var salt = '';
  	for (var i = 0; i < 10; i++) {
    	var p = Math.floor(Math.random() * set.length);
    	salt += set[p];
  	}
  	return salt;
}

var md5 = function(str) {
  	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback){
  	var salt = generateSalt();
  	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback){
  	var salt = hashedPass.substr(0, 10);
  	var validHash = salt + md5(plainPass + salt);
  	callback(hashedPass === validHash);
}