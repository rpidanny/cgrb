const lambda = require('./lambda');

const run = async () => {
  try {
    const data = await lambda.handler();
    console.log(data)
  } catch(err) {
    console.log(err);
  }
};

run();