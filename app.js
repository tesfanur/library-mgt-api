//LOAD THIRD PARTY MODULE DEPENDENCIES
var express    = require('express');
var bodyParser = require('body-parser');
var jwt        = require('jsonwebtoken');
var mongoose   = require('mongoose'); 

//LOAD CUSTOM MODULES
var config     = require('./config');
var Book       = require('./models/book');
var Category   = require('./models/category');
var User       = require('./models/user'); 
//===================================== 
var debug       = require('debug')('api');
var validator   = require('express-validator'); 
var logger       = require('./lib/logger');  
global.config = require('./config');

//LOCAL VARIABLES
var app          = express(); 
var libraryDbURI = config.LIBRARY_DB_URI;
var PORT         = config.HTTP_PORT;
var jwt_secret   = config.JWT_SECRET; 
var jwt_secret   = "shhh"; 

//===========
  
mongoose.Promise=global.Promise;
mongoose.connect(libraryDbURI);//deprecated function 

//handle db connection events
mongoose.connection.on('connected',  function () {
console.log('&\nMongoose  connected  to ' + libraryDbURI+ " database.");
return; 
});
//Handle db connection error
mongoose.connection.on('error', function dbError(error){
  console.log('Error occurred while connecting to database.\nPlease check your database server running status.\n');
});
//handle when db disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

// Parser JSON body Requests
app.use(bodyParser.json());//allows you to parse json data from postman body
app.use(bodyParser.urlencoded({extended:true}));//allows you to parse url data from postman address bar

app.use(require('./controllers'));
//=====================================

/// Logging HTTP Method and URL
app.use(logger()); 

// Express Validator
app.use(validator());

//home page
app.get('/', function(req, res){
  res.json({"message":"Wlecom to Libray Mangement API!"});

});

//router(app); 
app.get('/users', function(req,res){
 console.log('Getting all users');
 User.find({})
     .exec() 
     .then(function(users){
            console.log(users);
            res.json(users);
           })
     .catch(function(err){
      console.log(err);
      res.send('error occurred. \nError detail info: '+ err);
     });
    });



  //=================
  //create new user
app.post('/user', function(req,res){

var  addNewUser      = new User();
//add new user detail info
 var newUser =  req.body; 
  //=========================
  addNewUser.email    = newUser.email;
  addNewUser.password   = newUser.password;
  //=========================
  //check if there's a user first
  var foundUser = User.findOne({email: newUser.email});
  if(foundUser){
    return res.json({"Error": "Email already in use"});
  }
  //respond with token
  //use json web toke for authentication and authorization:
  //you may use the following github repo and support manual for
  //your first token  base authenticationa and authorization
  //https://github.com/auth0/node-jsonwebtoken
//save new user credentials
addNewUser.save(function(err,user){
    if(err){
      res.send('error occurred while saving user: ' + err);
    }else{
         console.log(user);
         res.send(user);
    }
  });
});
//=======================

//get all books using promise
app.get('/books', function(req,res){
 console.log('Getting all books');
 Book.find({})
     .exec() 
     .then(function(books){
            console.log(books);
            res.json(books);
           })
     .catch(function(err){
      console.log(err);
      res.send('error occurred. \nError detail info: '+ err);
     });
    });


//get book by id
app.get('/book/:id',function(req,res){
console.log('Getting book by id:');
Book.findOne({ _id:req.params.id}).exec(function(err,book){
  if (err) { 
  	res.send('Error has occurred\n Error:' +err);
  }
  else{
  	console.log(book);
  	res.json(book);
  }
});
});

//create new book
app.post('/book', function(req,res){

var  addNewBook      = new Book();
//add new book detail info
 var newBook =  req.body; 
  //=========================
  addNewBook.title    = newBook.title;
  addNewBook.author   = newBook.author;
  addNewBook.isbn     = newBook.isbn;  
  addNewBook.price    = newBook.price;
  addNewBook.edition  = newBook.edition;
  addNewBook.pages    = newBook.pages;
  addNewBook.publisherInfo = newBook.publisherInfo;
  addNewBook.publishedYear = newBook.publishedYear;
  addNewBook.contentLanguage      = newBook.contentLanguage;
  addNewBook.numOfCopiesAvailable = newBook.numOfCopiesAvailable;
  addNewBook.category             = newBook.category;
  //=========================

//save new book info
addNewBook.save(function(err,book){
		if(err){
			res.send('error occurred while saving book: ' + err);
		}else{
         console.log(book);
         res.send(book);
		}
	});
});

//find and update book detail info
app.put('/book/:id', function(req,res){
  var updateBook= req.body;
  Book.findOneAndUpdate({_id:req.params.id},
      {$set:{
        title   : updateBook.title,
        author  : updateBook.author,  
        isbn    : updateBook.isbn,
        price   : updateBook.price,
        edition : updateBook.edition,
        pages   : updateBook.pages,
        publisherInfo : updateBook.publisherInfo,
        publishedYear : updateBook.publishedYear,
        contentLanguage      : updateBook.contentLanguage,
        numOfCopiesAvailable : updateBook.numOfCopiesAvailable,
        category: updateBook.category
        }
    },
    {upsert:true}, 

  function(err, updatedBook){
          if(err){
            console.log('Error occurred. Detail Error message: ' +err);
          }else{
            console.log(updatedBook);
            res.send(updatedBook);
            //res.status(204);//book succesfully updated
          }
         });
});

//find and delete a book
app.delete('/book/:id', function(req, res){
  var bookId=req.params.id;
  Book.findOneAndRemove({_id:bookId},
         function(err, book){
          if(err){
              res.send('Error Deleteing');
          }else{
               res.status(204).send("No content found"); 
          }
         });

});
//===================================================
//create category
app.post('/category', function(req,res){

var  addNewCategory = new Category();
console.log(addNewCategory);
//add new category detail info
  addNewCategory.name = req.body.name;   

//save new category info
addNewCategory.save(function(err,category){
    if(err){
      res.send('error occurred while saving category.\nThe category may be aleady exists!');
    }else{
         console.log(category);
         //res.writeHead(200,{"Content-Type":"application/json"});
         res.send(category);
    }
  });
});
//
//list all categories using promise
app.get('/categories', function(req,res){
 console.log('Getting all categories');
 /*Category.find({},{_id:0})*/
 Category.find({},{_id:0})
     .exec() 
     .then(function(categories){
            console.log(categories);
            res.json(categories);
           })
     .catch(function(err){
      console.log(err);
      res.send('error occurred');
     });
    });
//
//find and update book detail info
app.put('/category/:id', function(req,res){

  Category.findOneAndUpdate({_id:req.params.id},
      {$set:{name: req.body.name
        //author:  req.body.author, 
            }},
     {upsert:true}, 

  function(err, category){
          if(err){
            console.log('Error occurred. Detail Error message: ' +err);
          }else{
            console.log(category);
            res.send(category);
            //res.status(204);//category succesfully updated
          }
         });
});

//get category by id
app.get('/category/:id',function(req,res){
console.log('Getting category by id:');
Category.findOne({ _id:req.params.id}).exec(function(err,category){
  if (err) { 
    res.send('Error has occurred');
  }
  else{
    console.log(category);
    res.json(category);
  }
});
});

//find and delete a category
app.delete('/category/:id', function(req, res){
  var categoryId=req.params.id;
  Category.findOneAndRemove({_id:categoryId},
         function(err, category){
          if(err){
              res.send('Error Deleteing');
          }else{
               res.status(204).send("No content found");
               //res.json(category) 
          }
         });

});
///
//======================
 
//start running server
app.listen(PORT, function(){
	console.log('\nNodeJS server is up and running on port ' + PORT+"\n");
});
 