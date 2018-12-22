const goodReads = require('./goodreads');
const { userID } = require('./config');
const { saveToS3, handleError, handleSuccess } = require('./helper');

exports.handler = (event, context) =>
  new Promise((resolve, reject) => {
    const { GR_KEY, ENV } = process.env;

    if( GR_KEY ) {
      goodReads
        .listBooksInShelf(userID)
        .then(list => {
          const books = list.map(book => {
            return {
              ...book.book 
            }
          });
          if (ENV && ENV === 'prod') {
            // Save books to S3
            console.log('Saving read books list to s3');
            const { S3_BUCKET, S3_KEY } = process.env;
            saveToS3(S3_BUCKET, S3_KEY, JSON.stringify(books, null, 2))
              .then(() => {
                console.log(`Read books saved to S3: ${S3_BUCKET}:${S3_KEY}`);
                resolve(handleSuccess(books));
              })
              .catch(err => {
                reject(handleError(err));
              })
          } else {
            resolve(handleSuccess(books));
          }
        })
        .catch(err => {
          reject(handleError(err));
        });
    } else {
      reject(handleError('GR_KEY, GR_SECRET not set in env'));
    }
  });
