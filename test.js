const lambda = require('./lambda');

lambda.handler()
  .then(data => console.log(data))
  .catch(err => console.log(err));