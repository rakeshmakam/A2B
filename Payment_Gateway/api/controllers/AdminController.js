/**
 * AdminController
 *
 * @description :: Server-side logic for managing Admins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var Client = require('node-rest-client').Client;
var baseUrl = "http://52.11.231.112:8080";

module.exports = {
	getUsers: function(req, res){
		if(!req.body && !req.body.searchString){
			res.badRequest('No search string found');
		}else{
			var client = new Client();

			var getArgs = {
				headers: {
					"A2B-AUTH-TOKEN": req.user.token,
					"Content-Type": "application/json"
				}
			};

			client.get(baseUrl+"/addtobill/v1/admin/users?search="+req.body.searchString, getArgs, function(data, resp){
				if (data.error) {
					sails.log.debug('error in admin user search');
					res.negotiate({error: data.error, message: data.message});
				} else {
					sails.log.debug('admin user search successfull');
					res.json({results: data});
				}
			});
		}
	},

	getCharges: function(req, res){

	},

	getTransactions: function(req, res){

	},

	getAccounts: function(req, res){

	},

	getBills: function(req, res){
		
	}
};

