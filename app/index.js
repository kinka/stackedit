var express = require('express');
var app = express();
var compression = require('compression');
var serveStatic = require('serve-static');

// Configure ejs engine
app.set('views', __dirname + '/../views');
app.engine('html', require('ejs').renderFile);

// Force HTTPS on stackedit.io
app.all('*', function(req, res, next) {
	if (req.headers.host == 'stackedit.io' && !req.secure && req.headers['x-forwarded-proto'] != 'https') {
		return res.redirect('https://stackedit.io' + req.url);
	}
	/\.(eot|ttf|woff|svg)$/.test(req.url) && res.header('Access-Control-Allow-Origin', '*');
	next();
});

// Use gzip compression
app.use(compression());

app.post('/pdfExport', require('./pdf').export);
app.post('/sshPublish', require('./ssh').publish);
app.post('/picasaImportImg', require('./picasa').importImg);
app.get('/downloadImport', require('./download').importPublic);

// Serve static resources
app.use(serveStatic(__dirname + '/../public'));

app.use(function(req, res, next) {
	res.renderDebug = function(page) {
		return res.render(page, {
			cache: false && !req.query.hasOwnProperty('debug')
		});
	};
	next();
});

// Serve landing.html in /
app.get('/', function(req, res) {
	res.renderDebug('landing.html');
});

// Serve editor.html in /viewer
app.get('/editor', function(req, res) {
	res.renderDebug('editor.html');
});

// Serve viewer.html in /viewer
app.get('/viewer', function(req, res) {
	res.renderDebug('viewer.html');
});

app.get('/authenticate/:code', function(req, res) {
    var request = require('request')
    request.post({
        url: 'https://github.com/login/oauth/access_token', 
        form: {
            code: req.params.code,
            client_id:'f24168055554676ac4db',
            client_secret:'29499426d0dd2e5ca5089654fcf2f3f0253cb553'
        }, headers: {Accept: 'application/json'}}, 
        function(err, data) {
            console.log(data.body.toString())
            res.end(data.body.replace('access_token', 'token'))
        })
})

// Error 404
app.use(function(req, res) {
	res.status(404);
	res.render('error_404.html');
});

module.exports = app;
