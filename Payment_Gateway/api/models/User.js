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

		email_verified: {
			type : 'boolean',
			defaultsTo : false,
			required : true
		},

		random_number: {
			type: 'string'
		}

	},

	// Add user
	add: function (data, callback) {
		saltAndHash(data.password,function (hash) {
	  		data.password = hash;
	  		data.random_number = Math.floor((Math.random() * 100000) + 1);
			User.create(data, function (err, user) {
			   	if (err) {
					callback(err);
				} else {
					delete user['password'];
					callback(null, user);
			 	}
		  	});
		});
		// User.findOne({where: {email:data.email}}).exec(function (err, user) {
	 //  		if (err) {
	 //  			callback(err);
	 //  		} else if(user){
	 //  			callback("User Already exists", null);
	 //  		} else {
	 //  			saltAndHash(data.password,function (hash) {
	 //  				data.password = hash;

	 //  				User.create(data, function (err, user) {
		// 			   	if (err) {
		// 					callback(err);
	 //  				 	} else {
	 //  						delete user['password'];
	 //  						callback(null, user);
	 //  				 	}
	 //  			  	});
	 //  			});
	 //      	}		
	 //  	});
	},

	signupActivate: function (randamNumber, callback) {
		User.find({where:{random_number: randamNumber}}).exec(function (err, user) {
			if(err) {
	  			callback(err);
	  		} else if (user.length > 0) {
				user.random_number = null;

				User.update({id : user.id}, user, function (error, data) {
					if(!error) {
						callback(null, {status: 200, message: "Your account is activated successfully, please try to login"});
					} else {
						callback(error);
					}
				});
			} else {
				callback({status: 404, message: "Your account is already activated"});
			}
		});
	},

	// Login 
	login: function (data, callback) {
		User.findOne({where:{email:data.email}}).exec(function (err, user) {
	  		if(err) {
	  			callback(err);
	  		} else if (user) {
	  			validatePassword(data.password, user.password, function (res) {
					if (res) {
						delete user['password'];
						callback(null,user);
					} else {
						callback({status: 402, message: "Email or password does not match"});
					}
  				});
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
				delete user['password'];				
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
					delete data['password'];
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