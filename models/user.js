/*var mongoose = require('mongoose');

var Schema = mongoose.Schema;
//UserSchema
var UserSchema = new Schema({
    email: {type: String, required: true,unique:true},
    password: {type: String, required: true}
});

 
//ctreat user model
var userModel=mongoose.model('User', UserSchema);

//export user model
module.exports = userModel;*/

//===========================
//code for jwt based user authorization
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('User', new Schema({ 
    email: String, 
    password: String
}));
