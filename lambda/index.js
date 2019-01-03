const goodReads = require('./goodreads');
const { userID, shelves } = require('./config');
const { saveToS3, handleError, handleSuccess } = require('./helper');

exports.handler = (event, context) =>
  new Promise((resolve, reject) => {
    const { GR_KEY, ENV } = process.env;

    if( GR_KEY ) {
      const cache = shelves.reduce((chain, shelf, idx) => 
        chain.then(a => {
          const { S3_BUCKET} = process.env;
          const S3_KEY = `shelf/${shelf}.json`;
          return goodReads
            .listBooksInShelf(userID, shelf)
            .then(list => {
              const books = list.map(book => {
                return {
                  ...book.book 
                }
              });
              if (ENV && ENV === 'prod') {
                // Save books to S3
                console.log(`Saving ${shelf} books list to S3(${S3_KEY})`);
                return saveToS3(S3_BUCKET, S3_KEY, JSON.stringify(books, null, 2));
              }
              throw {
                title: 'Environment',
                message: 'Not in Production Model'
              }
            })
            .then(data => {
              console.log(`Read books saved to S3: ${S3_BUCKET}:${S3_KEY}`);
              return a.concat(data);
            })
            .catch(err => {
              handleError(err);
            });
        }
        ),
        Promise.resolve([])
      );
      
      cache.then(data => resolve(handleSuccess(data)))
            .catch(err => reject(handleError(err)));
      
    } else {
      reject(handleError('GR_KEY, GR_SECRET not set in env'));
    }
  });
