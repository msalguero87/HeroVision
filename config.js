'use strict';

var projectId = 'herovision';
var bucketName = 'herovision';

var credentialsApiKey = '';

module.exports = {
  port: process.env.PORT || 8080,

  gcloud: {
    projectId: process.env.GCLOUD_PROJECT || projectId,
    keyFilename: './lib/HeroVision-d0cd6ae9a2a5.json'
  },

  gcloudStorageBucket: process.env.CLOUD_BUCKET || bucketName,
  dataBackend: 'datastore',

  gcloudVision: {
    key: process.env.CLOUD_VISION_KEY || credentialsApiKey
  }
};
