
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

    s3.putObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

exports.handleError = (err, statusCode=500) => {
  console.log(err);
  return {
    statusCode,
    error: JSON.stringify(err)
  }
}

exports.handleSuccess = data => {
  // console.log(data);
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  }
}