const goodReads = require('./goodreads');
const { userID } = require('./config');

exports.handler = async (event) => {
  // TODO implement
  let response = {}

  const { GR_KEY, GR_SECRET, ENV } = process.env;

  if( GR_KEY && GR_SECRET ) {
    goodReads
      .listBooksInShelf(userID)
      .then(res => {
        if (ENV && ENV === 'prod') {
          // Save books to S3
          const AWS = require('aws-sdk');
          const s3 = new AWS.S3();
        } else {
          console.log(JSON.stringify(res, null, 2));
        }
      })
      .catch(err => console.log(err));
    response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda!\nCache Read Book'),
    };
  } else {
    response = {
      statusCode: 500,
      body: JSON.stringify('GR_KEY, GR_SECRET not set in env'),
    };
  }
  return response;
};
