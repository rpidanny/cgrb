const lambda = require('./lambda');

lambda.handler()
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.log(err));