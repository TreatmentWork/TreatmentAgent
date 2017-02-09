var express = require('express');
var bodyParser = require('body-parser');
var clam = require('./ClamConfig.js');
var fs = require('fs');
var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

app.set('port', process.env.PORT || 8125);
app.set('host', process.env.HOST || '13.82.225.164');

app.post('/clamAV/scan', function(req, res) {
	var scanFile = req.body.scanFile;
	validateInput(scanFile, function (err, isValid) {
		if (err) {
			res.status(err.status || 500).send({msg: err.message, error : err});
		} else {
			var is_infected = clam.is_infected(scanFile, function(err, result, is_infected) {
		    if(err) {
					res.status(err.status || 500).send({msg: err.message, error : err});
		    }
				isDir(scanFile, function(status) {
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
	var body = [];
	var is_infected = clam.scan_files(req.body.scanFiles,  function(a, good_files, bad_files) {
			body.push({msg: "Good files:" + good_files});
			body.push({msg: "Bad files:" + bad_files});
			res.send(body);
		 }, function(err, file, is_infected) {
			if(err) {
				res.status(err.status || 500).send({msg: err.message, error : err});
			}
			if(is_infected) {
				body.push({msg: "File '" + file +  "' is infected!"});
			} else {
				body.push({msg: "File '" + file +  "' is clean!"});
			}
		}	);
	});



app.listen(app.get('port'), function (req, res){
  console.log('Treatment Agent is listening on port ' + app.get('host') + ':' + app.get('port'));
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
