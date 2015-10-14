var nodemailer = require("nodemailer");
var hbs = require('nodemailer-express-handlebars');

var options = {
    service: 'Gmail',
    auth: {
        user: process.env.user_id,
        pass: process.env.password
    }
}

var transporter = nodemailer.createTransport(options);
transporter.use('compile', hbs({viewEngine: 'ejs', viewPath: 'views', extName: '.ejs'}));

exports.send = function(emailId, data, cb) {
	sails.log.debug(data, emailId);
	var mail = {
		from: 'A2B <noreply@a2b.com>',
		to: emailId,
		subject: 'A2B invitation',
		template: 'invitation',
		context: data
	}

	transporter.sendMail(mail, function(err, res){
		if (err) { 
			cb(err);
		}else{
			cb(null, res);
		}
	});
};

exports.resetPassword = function(data, cb) {
	var mail = {
		from: 'A2B <noreply@a2b.com>',
		to: data.email,
		subject: 'A2B invitation to Reset Password',
		template: 'resetpassword',
		context: data
	}

	transporter.sendMail(mail, function(err, res){
		if (err) { 
			cb(err);
		}else{
			cb(null, res);
		}
	});
};