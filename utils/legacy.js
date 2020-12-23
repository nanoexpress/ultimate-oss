export default (middleware) => (req, res) =>
  new Promise((resolve, reject) => {
    middleware(req, res, (err, done) => {
      if (err) {
        reject(err);
      } else {
        resolve(done);
      }
    });
  });
