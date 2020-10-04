

'use strict';

var assign = require('lodash').assign;
var some = require('lodash').some;
var map = require('lodash').map;
var express = require('express');
var router = express.Router();

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

var routes = function(storageClient, cloudVisionClient) {
  var defaultContext = {
    
  };

  router.get('/', function(req, res) {
    res.render('base', defaultContext);
  });

  router.post('/', 
    storageClient.multer.single('image'),
    storageClient.uploadToStorage,
    function(req, res) {
      var context = {
        vision: {}
      };

      if (req.file && req.file.cloudStoragePublicUrl) {
        cloudVisionClient.detectImage(
          req.file.cloudStorageUri,
          function(error, response) {
            if (error) {
              context.error = error;
            } else {
              // Indent 2 spaces the json response if exists.
              context.vision.prettyprint = response ? 
                  JSON.stringify(response, null, 2) : null;
              context.vision.imageUrl = req.file.cloudStoragePublicUrl;
              context.vision.response = JSON.stringify(response.responses);
              context.isSuperHero = response.responses && response.responses.length && some(response.responses[0].labelAnnotations, function(element){
                return element.description === "Superhero" && element.score > 0.5;
              });
              context.isSuperVillain = response.responses && response.responses.length && some(response.responses[0].labelAnnotations, function(element){
                return element.description === "Supervillain" && element.score > 0.5;
              });
              context.notASuperHero = !context.isSuperHero && !context.isSuperVillain;
              if(context.isSuperHero || context.isSuperVillain){
                context.colors = {
                  values: map(response.responses[0].imagePropertiesAnnotation.dominantColors.colors, function(element){
                      return element.score * 10;
                  }),
                  hex: map(response.responses[0].imagePropertiesAnnotation.dominantColors.colors, function(element){
                    return "#" + componentToHex(element.color.red) + componentToHex(element.color.green) + componentToHex(element.color.blue);
                })
                }
              }
            }

            res.render('base', assign(context, defaultContext));
          }
        );        
      } else {
        context.error = 'Something went wrong uploading the image!';
        res.render('base', assign(context, defaultContext));
      }
  });

  return router;
};

module.exports = routes;
