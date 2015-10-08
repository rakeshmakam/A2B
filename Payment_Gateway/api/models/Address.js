/**
* Address.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	attributes: {
		UserId:{
			type:'int'
		},
		Address:{
			type:'string'
		}
	},

	addOrUpdate:function(userId, addresses, callback){
		Address.find({UserId: userId}).exec(function(err, user){
			if(user.length>0){
				Address.destroy({UserId: userId}).exec(function(err){
					if(err){
						callback(err, null);
					}else{
						var counter = 0;
						_.each(function(addresses, address){
							Address.create({UserId:userId, Address: address}).exec(function(err, addr){
								if(err){
									callback(err, null);
								}else{
									if(counter == addresses.length-1){
										callback(null, addresses);
									}else{
										counter = counter + 1;
									}
								}
							});
						});
					}
				});
			}else{
				var counter = 0;
				_.each(function(addresses, address){
					Address.create({UserId:userId, Address: address}).exec(function(err, addr){
						if(err){
							callback(err, null);
						}else{
							if(counter == addresses.length-1){
								callback(null, addresses);
							}else{
								counter = counter + 1;
							}
						}
					});
				});
			}
		});
	}
};

