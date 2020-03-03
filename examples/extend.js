import nanoexpress from '../src/nanoexpress.js';
import Route from '../src/Route.js';
import qs from 'querystring';

const app = nanoexpress({
  json_spaces: 2
});

class HeaderSupportedRoute extends Route {
  async middleware_header(req) {
    req.headers = {};

    req.forEach((key, value) => {
      req.headers[key] = value;
    });
  }
  async middleware_body(req, res) {
    if (req.method === 'POST' || req.method === 'PUT') {
      const contentType = req.headers['content-type'];

      let buffer = Buffer.allocUnsafe(0);
      await new Promise((resolve, reject) => {
        res.onAborted(reject);
        res.onData((chunk, isLast) => {
          buffer = Buffer.concat([buffer, Buffer.from(chunk)]);

          if (isLast) {
            if (contentType && contentType.indexOf('/json') !== -1) {
              res.writeHeader('Content-Type', contentType);
              req.body = JSON.parse(buffer.toString('utf8'));
            } else if (
              contentType &&
              contentType.indexOf('/x-www-form-urlencoded') !== -1
            ) {
              req.body = qs.parse(buffer.toString('utf8'));
            } else if (contentType && contentType.indexOf('/plain') !== -1) {
              req.body = buffer.toString('utf8');
            } else {
              req.body = buffer;
            }
            resolve();
          }
        });
      });
    }
  }
  async middleware_query(req) {
    const query = req.getQuery();

    if (query) {
      req.query = qs.parse(query);
    }
  }
  onPrepare() {
    const { _middlewares } = this;

    if (_middlewares) {
      _middlewares.unshift(this.middleware_query);
      _middlewares.unshift(this.middleware_header);
      _middlewares.splice(_middlewares.length - 1, 0, this.middleware_body);
    } else {
      this._middlewares = [
        this.middleware_header,
        this.middleware_query,
        this.middleware_body
      ];
    }
  }
}

const route = new HeaderSupportedRoute();

app.use(route);

route.get('/', async (req, res) => {
  return res.send({ headers: req.headers });
});
route.post('/', async (req, res) => {
  return res.send({ body: req.body });
});

app.listen(8000);
