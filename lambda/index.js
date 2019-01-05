const fs = require('fs-extra')

const goodReads = require('./goodreads');
const { userID, shelves, gitRepo, gitDir } = require('./config');
const { saveToS3, handleError, handleSuccess, pushToGithub } = require('./helper');

const git = require('simple-git/promise')(gitDir);

exports.handler = (event, context) =>
  new Promise((resolve, reject) => {
    const { GR_KEY, ENV, GH_KEY } = process.env;

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
                console.log(`[S3]: Saving ${shelf} books list to S3(${S3_KEY})`);
                return saveToS3(S3_BUCKET, S3_KEY, JSON.stringify(books, null, 2));
              }
              // save locally
              return fs.ensureDir(`${gitDir}/src/data/books/shelf`)
                .then(() => fs.writeJSON(`${gitDir}/src/data/books/${S3_KEY}`, books))
            })
            .then(data => {
              console.log(`[S3]: ${S3_KEY} Saved`);
              return a.concat(data);
            })
            .catch(err => {
              handleError(err);
            });
        }
        ),
        Promise.resolve([])
      );

      cache
        .then(data => {
          // push data to github repo
          if (GH_KEY) {
            return pushToGithub(git, gitRepo, GH_KEY, gitDir)
          }
          throw {
            title: 'GitHub Key',
            message: 'No GitHub key in ENV'
          }
        })
        .then(data => resolve(handleSuccess(data)))
        .catch(err => reject(handleError(err)));
    } else {
      reject(handleError('GR_KEY, GR_SECRET not set in env'));
    }
  });
