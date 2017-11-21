// Load Model Dependencies
var crypto  = require('crypto');

var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('api:auth-controller');

var config  = require('../config');
var UserDal = require('../dal/user');
var TokenDal = require('../dal/token');
//var TalentDal = require('../dal/talent');

// Login Controller
exports.loginUser = function loginUser(req, res, next) {
	// Validate Username and Password
	// Verify Password
	// Create or Update Token
	// Respond with UserType and User and Token Value

	var workflow = new EventEmitter();
	var body = req.body;

	workflow.on('validation', function () {
		req.checkBody('username')
		   .notEmpty().withMessage('Username is not Valid');
		req.checkBody('password')
			.notEmpty().withMessage('Password is not Valid');

		var errors = req.validationErrors();

		if(errors) {
			res.status(400);
			res.json({
				status: 400,
				type: 'USER_LOGIN_ERROR',
				message: errors
			});
		} else {
			workflow.emit('verifyUsername');
		}
	});

	workflow.on('verifyUsername', function () {
		UserDal.get({ username: body.username }, false, function (err, user){
			if(err) {
				res.status(500);
				res.json({
					status: 500,
					type: 'USER_LOGIN_ERROR',
					message: err.message
				});
				return;
			}

			if(!user._id) {
				res.status(400);
				res.json({
					status: 400,
					type: 'USER_LOGIN_ERROR',
					message: 'User With Those Credentials Does Not Exist'
				});
				return;
			}

			workflow.emit('verifyPassword', user);
		}) 
	});

	workflow.on('verifyPassword', function (user) {
		user.verifyPassword(body.password, function (err, isMatch){
			if(err) {
				res.status(500);
				res.json({
					status: 500,
					type: 'USER_LOGIN_ERROR',
					message: err.message
				});
				return;
			}


			if(!isMatch) {
				res.status(400);
				res.json({
					status: 400,
					type: 'USER_LOGIN_ERROR',
					message: 'User With Those Credentials Does Not Exist'
				});
				return;
			}

			workflow.emit('upsertToken', user);
		})
	})

	workflow.on('upsertToken', function (user) {
		TokenDal.get({ user: user._id }, function (err, token){
			if(err) {
				res.status(500);
				res.json({
					status: 500,
					type: 'USER_LOGIN_ERROR',
					message: err.message
				});
				return;
			}

			var tokenValue = crypto.randomBytes(config.TOKEN_LENGTH).toString('base64');

			if(!token._id) {
				// Create a New Token
				TokenDal.create({
					value: tokenValue,
					user: user._id,
					revoked: false
				}, function(err, token){
					if(err) {
						res.status(500);
						res.json({
							status: 500,
							type: 'USER_LOGIN_ERROR',
							message: err.message
						});
						return;
					}

					workflow.emit('getUserType', token, user);
				})
			} else {
				// Update old with new Auth Token
				TokenDal.update({ _id: token._id }, {
					value: tokenValue,
					revoked: false
				}, function(err, token){
					if(err) {
						res.status(500);
						res.json({
							status: 500,
							type: 'USER_LOGIN_ERROR',
							message: err.message
						});
						return;
					}

					workflow.emit('getUserType', token, user);
				})
			}
		});
	});

	workflow.on('getUserType', function (token, user) {
		if(user.role === 'talent') {
			TalentDal.get({ user: user._id }, function(err, talent){
				if(err) {
					res.status(500);
					res.json({
						status: 500,
						type: 'USER_LOGIN_ERROR',
						message: err.message
					});
					return;
				}

				workflow.emit('respond', token, talent);

			});
		}
	});

	workflow.on('respond', function(token, user){
		res.json({
			token: token.value,
			user: user
		})
	})


	workflow.emit('validation');
};

// Logout Controller
exports.logoutUser = function logoutUser(req, res, next){
	debug('Logout User');

	var user = req._user;

	TokenDal.update({ user: user._id },{
		revoked: true,
		value: ''
	}, function (err, token){
		if(err) {
				res.status(500);
				res.json({
					status: 500,
					type: 'USER_LOGOUT_ERROR',
					message: err.message
				});
				return;
			}

		res.json({
			logged_out: true
		})
	})
}


// Noop Method
exports.noop = function noop(req, res, next) {
	res.json({
		message: 'To be Implemented'
	})
}