var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var application = require('./server/routes/application');
var teamMember = require('./server/routes/team-member');
var project = require('./server/routes/project');
var mom = require('./server/routes/mom');
var user = require('./server/routes/api-user');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/momdb', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'meredadkimaruti',
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*Enable to allow cross-domain requests
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/

app.use('/', application);
app.use('/api/user', user);
app.use(function(req, res, next) {
  if(req.session.userid == null) {
	res.jsonp({message: 'Unauthenticated access is not allowed!'});
  } else {
	next();
  }
});
app.use('/api/team-members', teamMember);
app.use('/api/projects', project);
app.use('/api/mom', mom);
	
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


/*app.get('/mom/list', mom.findAll);
app.get('/mom/:id', mom.findById);
app.post('/mom', mom.add);
app.put('/mom/:id', mom.update);
app.delete('/mom/:id', mom.delete);*/

//module.exports = app;

app.listen(3000);
//console.log('Listening on port 3000...');