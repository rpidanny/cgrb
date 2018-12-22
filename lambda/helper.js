
exports.saveToS3 = (bucket, key, body) =>
  new Promise((resolve, reject) => {
    /* The following example creates an object. If the bucket is versioning enabled, S3 returns version ID in response. */
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3();

    const params = {
      Body: body, 
      Bucket: bucket, 
      Key: key
    };

    s3.putObject(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });