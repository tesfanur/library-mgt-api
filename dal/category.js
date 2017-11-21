// Access Layer for Category Data.

/**
 * Load Module Dependencies.
 */
var debug   = require('debug')('api:dal-category');
var moment  = require('moment');
var _       = require('lodash');

var Category        = require('../models/category');

var returnFields = Category.whitelist;
var population = [];

/**
 * create a new Category.
 *
 * @desc  creates a new Category and saves them
 *        in the database
 *
 * @param {Object}  CategoryData  Data for the Category to create
 * @param {Function} cb       Callback for once saving is complete
 */
exports.create = function create(CategoryData, cb) {
  debug('creating a new Category');

  // Create Category if is new.
  var CategoryModel  = new Category(CategoryData);

  CategoryModel.save(function saveCategory(err, data) {
    if (err) {
      return cb(err);
    }

    exports.get({ _id: data._id }, function (err, Category) {
      if(err) {
        return cb(err);
      }

      cb(null, Category);

    });

  });

};

/**
 * delete a Category
 *
 * @desc  delete data of the Category with the given
 *        id
 *
 * @param {Object}  query   Query Object
 * @param {Function} cb Callback for once delete is complete
 */
exports.delete = function deleteCategory(query, cb) {
  debug('deleting Category: ', query);

  Category
    .findOne(query, returnFields)
    .populate(population)
    .exec(function deleteCategory(err, Category) {
      if (err) {
        return cb(err);
      }

      if(!Category) {
        return cb(null, {});
      }

      Category.remove(function(err) {
        if(err) {
          return cb(err);
        }

        cb(null, Category);

      });

    });
};

/**
 * update a Category
 *
 * @desc  update data of the Category with the given
 *        id
 *
 * @param {Object} query Query object
 * @param {Object} updates  Update data
 * @param {Function} cb Callback for once update is complete
 */
exports.update = function update(query, updates,  cb) {
  debug('updating Category: ', query);

  var now = moment().toISOString();
  var opts = {
    'new': true,
    select: returnFields
  };

  Category
    .findOneAndUpdate(query, updates, opts)
    .populate(population)
    .exec(function updateCategory(err, Category) {
      if(err) {
        return cb(err);
      }

      cb(null, Category || {});
    });
};

/**
 * get a Category.
 *
 * @desc get a Category with the given id from db
 *
 * @param {Object} query Query Object
 * @param {Function} cb Callback for once fetch is complete
 */
exports.get = function get(query, toFilter, cb) {
  debug('getting Category ', query);

  if(arguments.length < 3) {
    cb = toFilter;
    toFilter = true;
  }

  Category
    .findOne(query, toFilter ? returnFields : null)
    .populate(population)
    .exec(function(err, Category) {
      if(err) {
        return cb(err);
      }

      cb(null, Category || {});
    });
};

/**
 * get a collection of Categorys
 *
 * @desc get a collection of Categorys from db
 *
 * @param {Object} query Query Object
 * @param {Function} cb Callback for once fetch is complete
 */
exports.getCollection = function getCollection(query, qs, cb) {
  debug('fetching a collection of Categorys');

  cb(null,
     Category
      .find(query, returnFields)
      .populate(population)
      .stream({ transform: JSON.stringify }));

};

/**
 * get a collection of Categorys using pagination
 *
 * @desc get a collection of Categorys from db
 *
 * @param {Object} query Query Object
 * @param {Function} cb Callback for once fetch is complete
 */
exports.getCollectionByPagination = function getCollection(query, qs, cb) {
  debug('fetching a collection of Categorys');

  var opts = {
    columns:  returnFields,
    sortBy:   qs.sort || {},
    populate: population,
    page:     qs.page,
    limit:    qs.limit
  };


  Category.paginate(query, opts, function (err, docs, page, count) {
    if(err) {
      return cb(err);
    }


    var data = {
      total_pages: page,
      total_docs_count: count,
      docs: docs
    };

    cb(null, data);

  });

};


/**
 * Hash password
 */
exports.hashPasswd = function hashPasswd(passwd, cb) {
  Category.hashPasswd(passwd, cb);
};
