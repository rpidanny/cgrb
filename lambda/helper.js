const fs = require('fs-extra')
const { tempDir } = require('./config')

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

exports.pushToGithub = (git, repo, key, path) =>
  new Promise((resolve, reject) => {
    const repoURL = `https://${key}@github.com/${repo}`
    // console.log(git(path).init())
    git
      .init()
      .then(() => git.addConfig('user.name', 'rpidanny'))
      .then(() => git.addConfig('user.email', 'abhishekmaharjan1993@gmail.com'))
      .then(() => git.addRemote('origin', repoURL))
      .then(() => git.pull('origin', 'master'))
      // .then(() => fs.remove(`${path}/src/data/books`))
      .then(() => fs.copy(`${tempDir}/books/shelf`, `${path}/src/data/books`))
      .then(() => git.add('./src/data/'))
      .then(() => git.commit('[AWS:Lambda] Update Books'))
      .then(() => git.push('origin', 'master'))
      .then(() => {
        console.log(`[GIT]: ${repo} updated`)
        resolve({
          success: true
        })
      })
      .catch(err => reject(err))
      
  })