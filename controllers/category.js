//Load Module Dependencies
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('api:category-controller');

var CategoryDal 	= require('../dal/category');
//var TalentDal 	= require('../dal/talent');

// Create Category
exports.createCategory = function createCategory(req, res, next){
	debug('Create Category');
	var body = req.body;
	
	// Validate Data
	// Check If Category Exists
	// Create Category
	// Create Category Type
	// Return Category in Response

	var workflow = new EventEmitter();

	workflow.on('validation', function () {
		req.checkBody('email')
		   .notEmpty().withMessage('Email is Empty')
		   .isEmail().withMessage('Email is not Valid');
		req.checkBody('password')
			.notEmpty().withMessage('Password is Empty');
		req.checkBody('role')
			.notEmpty().withMessage('Role is Empty');

		var errors = req.validationErrors();

		if(errors) {
			res.status(400);
			res.json({
				status: 400,
				type: 'Category_CREATION_ERROR',
				message: errors
			});
		} else {
			body.Categoryname = body.email;
			workflow.emit('exists');
		}
	});

	workflow.on('exists', function () {
		CategoryDal.get({ Categoryname: body.Categoryname }, function CategoryExists(err, Category){
			if(err) {
				res.status(500);
				res.json({
					status: 500,
					type: 'Category_CREATION_ERROR',
					message: err.message
				});
				return;
			}
			// truthy vs falsey
			if(Category._id) {
				res.status(400);
				res.json({
					status: 400,
					type: 'Category_CREATION_ERROR',
					message: 'Category With Those Credentials Exists'
				});
				return;
			}

			workflow.emit('createCategory');
		})
	});

	workflow.on('createCategory', function(){
		CategoryDal.create(body, function createCategory(err, Category){
			if(err) {
				res.status(500);
				res.json({
					status: 500,
					type: 'Category_CREATION_ERROR',
					message: err.message
				});
				return;
			}
			body.Category = Category._id;
			workflow.emit('createCategoryType', Category);
		});
	});

	workflow.on('createCategoryType', function(Category) {
		if(Category.role === 'talent') {
			TalentDal.create(body, function createTalent(err, talent) {
				if(err) {
				res.status(500);
				res.json({
					status: 500,
					type: 'Category_CREATION_ERROR',
					message: err.message
				});
				return;
			}

			workflow.emit('respond', Category);
			})
		}
	});

	workflow.on('respond', function(Category) {
		res.status(201);
		res.json(Category);
	});


	workflow.emit('validation');
};

// Noop Method
exports.noop = function noop(req, res, next) {
	res.json({
		message: 'To be Implemented'
	});
}