const goodReads = require('./goodreads');
const { userID } = require('./config');
const { saveToS3 } = require('./helper');

exports.handler = (event) =>
  new Promise((resolve, reject) => {
    const { GR_KEY, GR_SECRET, ENV } = process.env;

    if( GR_KEY && GR_SECRET ) {
      goodReads
        .listBooksInShelf(userID)
        .then(books => {
          if (ENV && ENV === 'prod') {
            // Save books to S3
            const { S3_BUCKET, S3_KEY } = process.env;
            saveToS3(S3_BUCKET, S3_KEY, books)
              .then(() => {
                console.log(`Read books saved to S3: ${S3_BUCKET}:${S3_KEY}`);
                resolve({
                  statusCode: 200,
                  body: books,
                });
              })
              .catch(err => {
                reject({
                  statusCode: 500,
                  body: err,
                });
              })

          } else {
            resolve({
              statusCode: 200,
              body: books,
            });
          }
        })
        .catch(err => {
          reject({
            statusCode: 500,
            body: err,
          });
        });
    } else {
      reject({
        statusCode: 500,
        body: JSON.stringify('GR_KEY, GR_SECRET not set in env'),
      });
    }
  });
