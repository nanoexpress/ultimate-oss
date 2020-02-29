export default (middleware) => async (req, res) =>
  await new Promise((resolve, reject) => {
    middleware(req, res, (err, done) => {
      if (err) {
        reject(err);
      } else {
        resolve(done);
      }
    });
  });
