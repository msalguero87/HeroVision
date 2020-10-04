'use strict';

var gcloud = require('gcloud');

module.exports = function(gcloudConfig, gcloudStorageBucket) {
  var storage = gcloud.storage(gcloudConfig);
  var bucket = storage.bucket(gcloudStorageBucket);

  function getPublicUrl(filename) {
    return 'https://storage.googleapis.com/' +
      gcloudStorageBucket +
      '/' + filename;
  }

  function getStorageUri(filename) {
    return 'gs://' +
      gcloudStorageBucket +
      '/' + filename;
  }

  function uploadToStorage(req, res, next) {
    if(!req.file) { 
      next();
    }

    var gcsname = Date.now() + req.file.originalname;
    console.log("attempting to create " + gcsname);
    var file = bucket.file(gcsname);
    var stream = file.createWriteStream();

    stream.on('error', function(err) {
      console.log("error");
      console.log(err);
      req.file.cloudStorageError = err;
      next(err);
    });

    stream.on('finish', function() {
      req.file.cloudStorageObject = gcsname;
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      req.file.cloudStorageUri = getStorageUri(gcsname);
      next();
    });

    stream.end(req.file.buffer);
  }

  var multer = require('multer')({
    inMemory: true,
    fileSize: 5 * 1024 * 1024, // no larger than 5mb
    rename: function(fieldname, filename) {
      // generate a unique filename
      return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
    }
  });

  return {
    multer: multer,
    uploadToStorage: uploadToStorage
  };
};
