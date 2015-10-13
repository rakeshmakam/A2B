/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var crypto = require('crypto');

module.exports = {

	attributes: {
		full_name: {
			type:'string',
			required : true,
		},

		email: {
			type: "string",
			required : true,
			unique: true,
			size: 100
		},

		phone_num: {
			type:'string',
			required : true,
			size:10
		},

		password: {
			type:'string',
			required : true,
			size: 50
		},

		address_line1: {
			type: "string",
			required : true,
			size: 200
		},

		address_line2: {
			type: "string",
			size: 200
		},

		address_line3: {
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

		email_verified: {
			type : 'boolean',
			defaultsTo : false,
			required : true
		},

		hash_key: {
			type: 'string'
		},

		email_verification_token: {
			type: 'string'
		},

		currency: {
			type: 'string',
			defaultsTo : 'INR',
			required : true
		},

		toJSON: function () {
			var obj = this.toObject();
			delete obj.password;
			delete obj.hash_key;
			delete obj.email_verification_token;
			return obj;
	    }

	},

	// Add user
	add: function (data, callback) {
		saltAndHash(data.password,function (hash) {
	  		data.password = hash;
	  		data.email_verification_token = crypto.randomBytes(20).toString('hex');
	  		data.hash_key = crypto.randomBytes(20).toString('hex');
			User.create(data, function (err, user) {
			   	if (err) {
					callback(err);
				} else {
					callback(null, user);
			 	}
		  	});
		});
	},

	signupActivate: function (emailVerificationToken, callback) {
		User.findOne({where:{email_verification_token: emailVerificationToken}}).exec(function (err, user) {
			if(err) {
	  			callback(err);
	  		} else if (user) {
				User.update({id : user.id}, {email_verified: true}, function (error, data) {
					if(!error) {
						callback(null, data);
					} else {
						callback(error);
					}
				});
			} else {
				callback({status: 404, message: "We could not find your account."});
			}
		});
	},

	// Login 
	login: function (data, callback) {
		User.findOne({where:{email:data.email}}).exec(function (err, user) {
	  		if(err) {
	  			callback(err);
	  		} else if (user) {
	  			if (user.email_verified) {
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
    	User.findOne({where: {email: email}}).exec(function (err, user){
    		if(!err){
    			callback(null, {message: "Please check your mail"});
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