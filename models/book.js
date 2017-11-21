//'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 //ref the following site for more detail information how to model 
 //complex schemas like this below: https://coursework.vschool.io/mongoose-schemas
 //TODO: isolate the publisher schema so that publisher's is not duplicated/do db normalization
var PublisherSchema = new Schema({ 
                      name:   {type: String, required:true},
                      address:{
                              country:{type: String},
                              city:   {type: String},
                              street: {type: String},
                              email:  {type: String},
                              web:    {type: String},
                              tel:    {type: String}
                            }}); 

//module.exports = mongoose.model("Publisher", publisherSchema); 

var BookSchema = new Schema({
    title  :  {type: String, required:  true},
    author :  [{type: String, required: true}],
    isbn   :  {type: String, required:  true},  
    price  :  {type: Number, min:0.0},
    edition:  {type: String},
    publisherInfo:   PublisherSchema,
    publishedYear:   {type: Number},
    contentLanguage: {type:String},
    numOfCopiesAvailable:{type:Number,min:0},
    pages:{type: Number}, 
    category:  {type: Schema.ObjectId, ref: 'Category'}
});
 
//export book model
var bookModel = mongoose.model('Book', BookSchema);
module.exports =bookModel;