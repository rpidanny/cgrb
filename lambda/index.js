exports.handler = async (event) => {
  // TODO implement
  let response = {}

  const { GR_KEY, GR_SECRET } = process.env;

  if( GR_KEY && GR_SECRET ) {
    console.log(GR_KEY, GR_SECRET);
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
