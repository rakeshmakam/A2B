/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		full_name:{
			type:'string'
		},
		email:{
			type:'string'
		},
		Phone_num:{
			type:'string',
			size:10
		},
		password:{
			type:'string'
		}
	},

	signUp: function(signUpData, callback){
		User.findOne({where:{email:signUpData.email}}).exec(function(err, user){
	  		if(err)
	  			cb(err);
	  		else if(!user){
	  			saltAndHash(signUpData.password,function(hash){
	  				signUpData.password = hash;
	  				User.create(signUpData, function(err, user){
					   	if(err)
							cb(err);
	  				 	else{
	  						delete user['password'];
	  						cb(null, user);
	  				 	}
	  			  	});
	  			});
	  		}
	      	else{
	        	cb("User Already exists", null);
	      	}		
	  	});
	},

	login: function(loginData, callback){
		User.findOne({where:{email:loginData.email}}).exec(function(err, user){
	  		if(err)
	  			callback(err);
	  		else if(user){
	  			validatePassword(loginData.password,user.password,function(res){
					if(res){
						delete user['password'];
						callback(null,user);
					}
					else{
						callback("Email or password does not match");
					}
  				});
  			}
  			else{
  				callback("user does not exist");
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