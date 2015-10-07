/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var jwt = require('jsonwebtoken');

module.exports = {
	userSignUp: function(req, res){
		if(!req.body && !req.body.full_name && !req.body.email && !req.body.phoneNum && !req.body.userPassword){
			res.badRequest('Please provide all the details');
		}else{
			sails.log.debug('SignUp initiated');
			User.signUp(req.body, function(err, userDetails){
				if(err){
					res.serverError(err);
				}else{
					sails.log.debug('SignUp successfull');
					res.json({status:true});
				}
			});
		}
	},

	userSignIn: function(req, res){
		if(!req.body && !req.body.email && !req.body.userPassword){
			res.badRequest('Incorrect username or password');
		}else{
			User.login(req.body, function(err, userDetails){
				if(err){
					res.serverError(err);
				}else{
					var token = jwt.sign(user[0], 'secret', {expiresInMinutes: 60*5*100});
					userDetails.token = token;
					req.user = userDetails;
					res.json({user: userDetails});
				}
			});
		}
	}
};

