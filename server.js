'use strict';

var mongo = require('mongodb').MongoClient;
var express = require('express');
var app = express();

function insertUrlsIntoDatabase(urlObject){
	mongo.connect("mongodb://localhost:27017/fcc-url-shortener", function(err, db) {
		if (err) throw err;
		var urls = db.collection('shortenedUrls');
		urls.insert(urlObject, function(err,data){
		if (err) throw err;
		//console.log(JSON.stringify(urlObject));
		db.close();
		});
	});
}

// Create new shortened Url
app.get('/new/*', function(req, res){
    var originalUrl = req.originalUrl.substr(5); //skip "/new/"
    
    // Validate URL
    var regexUrl = /https?:\/\/\w+.\w+/;
    if (regexUrl.exec(originalUrl) == null){
    	res.end(JSON.stringify({"error": "URL invalid"}));
    } else {
		// Check for URL in database? duplicates shouldnt matter, although
    
	    // Generate shortened URL
	    var basisUrl = "https://" + req.headers["host"] + "/";
	    var shortUrl = basisUrl + Math.random().toString(10).substr(2,6);
	    
	    var outputObject = { "original_url": originalUrl, "short_url": shortUrl};
	    insertUrlsIntoDatabase(outputObject);
		res.end(JSON.stringify(outputObject));
    }
});

// Redirect to shortened Url
app.get('/*', function(req, res){
    //console.log(url);
    
    // Look up shortened Url in database
    //var url = findUrlFromDatabase("https://" + req.headers["host"] + "/" +req.originalUrl.substr(1));
    var url = "https://" + req.headers["host"] + "/" +req.originalUrl.substr(1);
    console.log("hello! ", url);
   mongo.connect("mongodb://localhost:27017/fcc-url-shortener", function(err, db) {
		if (err) throw err;
		var urls = db.collection('shortenedUrls');
		urls.find({short_url: url}).toArray(function(err, items) {
				if (err) throw err;
				console.log("here are items: ", items)
				if (items.length == 0){
					res.end("Could not find the provided URL.");
				} else {
                	res.redirect(items[0].original_url);
				}
             });
	});
});


var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});