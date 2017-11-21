var mongoose = require('mongoose');

var Schema = mongoose.Schema;
//CategorySchema
var CategorySchema = new Schema({
    name: {type: String, required: true,unique:true, min: 2, max: 100} 
});

// Virtual for this category instance URL
/*CategorySchema
.virtual('url')
.get(function () {
  return '/category/'+this._id;
});*/

//Export model
var CategoryModel=mongoose.model('Category', CategorySchema);
module.exports = CategoryModel;
