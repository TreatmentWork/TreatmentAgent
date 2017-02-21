var express = require('express');
var bodyParser = require('body-parser');
var clam = require('./clamConfig.js');
var fs = require('fs');
var commonConfig = require(appRoot + '/config/commonConfig.json');
var logger = require(appRoot + '/js/util/winstonConfig.js');
var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

app.set('port', process.env.PORT || commonConfig.port);
app.set('host', process.env.HOST || '127.0.0.1');

app.post('/clamAV/scan', function(req, res) {
	var requestId = req.body.requestId;
	var scanFile = req.body.scanFile;
	logger.info(requestId + 'Starting scan of single file.');
	validateInput(scanFile, function (err, isValid) {
		if (err) {
			res.status(err.status || 500).send({msg: err.message, error : err});
		} else {
			var is_infected = clam.is_infected(scanFile, function(err, result, is_infected) {
		    if(err) {
					res.status(err.status || 500).send({msg: err.message, error : err});
		    }
				isDir(scanFile, function(status) {
					logger.info(requestId + 'Finished scan of single file.');
					if(!status) {
				    if(is_infected) {
				        res.send({msg: "File '" + scanFile +  "' is infected!"});
				    } else {
				        res.send({msg: "File '" + scanFile +  "' is clean!"});
				    }
					} else {
						  res.send(result);
					}
				});
			});
		}
	});
});

app.post('/clamAV/multiscan', function(req, res) {
	var requestId = req.body.requestId;
	logger.info(requestId + 'Starting scan of multiple files.');
	var body = [];
	var result = '';
	var is_infected = clam.scan_files(req.body.scanFiles,  function(a, good_files, bad_files) {
			body.push({msg: "Good files:" + good_files});
			body.push({msg: "Bad files:" + bad_files});
			logger.info(requestId + 'Finished scan of multiple files.');
			res.send(body);
		 }, function(err, file, is_infected) {
			if(err) {
				body.push({msg: err.message, error : err});
			} else {
				if(is_infected) {
					body.push({msg: "File '" + file +  "' is infected!"});
				} else {
					body.push({msg: "File '" + file +  "' is clean!"});
				}
			}
		}	);
	});


// Checking if supplied path is directory
var isDir = function (file, callback) {
	fs.stat(file, function (err, stats){
    if (err) {
      // Directory doesn't exist or something.
      console.log('Directory doesn\'t exist ' + file);
    } else {
    	return callback(stats.isDirectory());
		}
  });
};

// Checking if supplied file path is valid
var validateInput = function  (file, callback) {
	fs.stat(file, function (err, stats){
    if (err) {
      console.log(err);
			return callback(err);
    } else {
    	return callback(null, true);
		}
  });
};

var server = app.listen(app.get('port'), function (req, res){
  console.log('Treatment Agent is listening on port ' + app.get('host') + ':' + app.get('port'));
});

// Never timeout as ClamAV scan could be very  long running process
server.timeout = 0;
