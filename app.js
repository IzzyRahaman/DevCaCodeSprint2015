//var express = require('express');
//var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');
//
//var routes = require('./routes/index');
//var users = require('./routes/users');
//
//var app = express();
//
//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
//
//// uncomment after placing your favicon in /public
////app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
//
//app.use('/', routes);
//app.use('/users', users);
//
//// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});
//
//// error handlers
//
//// development error handler
//// will print stacktrace
//if (app.get('env') === 'development') {
//    app.use(function(err, req, res, next) {
//        res.status(err.status || 500);
//        res.render('error', {
//            message: err.message,
//            error: err
//        });
//    });
//}
//
//// production error handler
//// no stacktraces leaked to user
//app.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.render('error', {
//        message: err.message,
//        error: {}
//    });
//});
//
//
//module.exports = app;

var fs = require("fs");
var express = require("express");
var path = require("path");
var config = require("./lib/config");
var mongoose = require("mongoose");
var mongooseAPI = require("mongoose-api");
var app = config.init(express());

var http = require("http").Server(app);
//mongooseAPI.serveModels(app);
var db = mongoose.connection;
var static_loc = path.join(path.join(__dirname, 'app'), 'views');
var csvParser = require("csv-parse");

app.use(express.static(static_loc));
//var mongooseModel = require("./lib/mongo-models").create(undefined);

var mongoModels = require("./lib/mongo-models").create(mongoose);

var subs = require("./lib/subscription-manager").createSubscriptionManager(http, mongoModels);

mongoose.connect('mongodb://localhost/test');
var rest = require("./lib/rest")(app, mongoModels);
mongoose.connection.on('error', console.error.bind(console, "console.log"));

var parse = csvParser();
parse.on('finish', console.log);
parse.on('error', function(err) {
   console.log(err.message);
});

mongoose.connection.once('open', function() {

    http.listen(config.port, function(){
        console.log("Listening on http://127.0.0.1:"+config.port);
        subs.start_streaming();
        var input = fs.createReadStream(__dirname + "/csv/accidents.csv");
        input.pipe(parse);
    });

});
