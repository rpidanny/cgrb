const parser = require('xml2json');
const request = require('request-promise');

const BASE_URL = 'https://www.goodreads.com';

const { GR_KEY, GR_SECRET } = process.env;

exports.listShelves = (grKey) =>
  new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri: `${BASE_URL}/shelf/list.xml`,
      qs: {
        key: grKey
      }
    })
      .then(data => {
        console.log('Parsing XML to JSON');
        const jsonData = parser.toJson(data, { object: true });
        resolve(jsonData.GoodreadsResponse)
      })
      .catch(err => reject(err));
  })

exports.getUser = (userID) =>
  new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri: `${BASE_URL}/user/show/${userID}.xml`,
      qs: {
        key: GR_KEY
      }
    })
      .then(data => {
        console.log('Parsing XML to JSON');
        const jsonData = parser.toJson(data, { object: true });
        resolve(jsonData.GoodreadsResponse)
      })
      .catch(err => reject(err));
  })

exports.listBooksInShelf = (userID, shelf='read', sort='date_updated') =>
  new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri: `${BASE_URL}/review/list`,
      qs: {
        key: GR_KEY,
        v: '2',
        id: userID,
        shelf,
        sort
      },
    })
      .then(data => {
        console.log('Parsing XML to JSON');
        const jsonData = parser.toJson(data, { object: true });
        resolve(jsonData.GoodreadsResponse)
      })
      .catch(err => reject(err));
  })