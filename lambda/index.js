const fs = require('fs-extra')
const gitP = require('simple-git/promise')

const goodReads = require('./goodreads');
const { userID, shelves, gitRepo, tempDir } = require('./config');
const { saveToS3, handleError, handleSuccess, pushToGithub } = require('./helper');

const gitDir = `${tempDir}/git`

exports.handler = (event, context) =>
  new Promise((resolve, reject) => {
    const { GR_KEY, ENV, GH_KEY } = process.env;

    if( GR_KEY ) {
      const cache = shelves.reduce((chain, shelf, idx) => 
        chain.then(a => {
          const { S3_BUCKET} = process.env;
          const S3_KEY = `shelf/${shelf}.json`;
          return goodReads
            .listBooksInShelf(userID, shelf, 'title')
            .then(list => {
              const books = list.map(book => {
                return {
                  // ...book.book 
                  url: book.book.url,
                  link: book.book.link,
                  title: book.book.title,
                  title_without_series: book.book.title_without_series,
                  small_image_url: book.book.small_image_url,
                  description: book.book.description,
                  num_pages: book.book.num_pages,
                  average_rating: book.book.average_rating
                }
              }).sort((a, b) => (a.title > b.title) ? 1 : -1 );
              // if (ENV && ENV === 'prod') {
              //   // Save books to S3
              //   console.log(`[S3]: Saving ${shelf} books list to S3(${S3_KEY})`);
              //   saveToS3(S3_BUCKET, S3_KEY, JSON.stringify(books, null, 2));
              // }
              // save locally
              return fs.ensureDir(`${tempDir}/books/shelf`)
                .then(() => fs.writeFile(`${tempDir}/books/${S3_KEY}`, JSON.stringify(books, null, 2)))
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
        .then(() => fs.ensureDir(gitDir))
        .then(data => {
          // push data to github repo
          if (GH_KEY) {
            const git = gitP(gitDir);
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
