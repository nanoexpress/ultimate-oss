import qs from 'querystring';
import nanoexpress from '../src/nanoexpress.js';
import Route from '../src/Route.js';

const app = nanoexpress({
  json_spaces: 2
});

class HeaderSupportedRoute extends Route {
  middleware_header = async (req) => {
    req.headers = {};

    req.forEach((key, value) => {
      req.headers[key] = value;
    });
  };

  middleware_body = async (req, res) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      const contentType = req.headers['content-type'];

      let buffer;
      await new Promise((resolve, reject) => {
        res.onAborted(reject);
        // eslint-disable-next-line complexity
        res.onData((chunk, isLast) => {
          buffer = buffer
            ? Buffer.concat([buffer, Buffer.from(chunk)])
            : Buffer.from(chunk);

          if (isLast) {
            req.buffer = buffer;

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
  };

  middleware_query = async (req) => {
    const query = req.getQuery();

    if (query) {
      req.query = qs.parse(query);
    }
  };

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

app.wraps(null, (method, [url], self) => {
  if (url.indexOf(':') !== -1) {
    const matches = url.match(/:(.*)/g);

    if (matches && matches.length) {
      const names = matches.map((match) => {
        const slashIndex = match.indexOf('/');

        if (slashIndex !== -1) {
          return match.substr(1, slashIndex - 1);
        }

        return match.substr(1);
      });

      const handleParams = async (req) => {
        req.params = {};

        for (let i = 0, len = names.length; i < len; i += 1) {
          req.params[names[i]] = req.getParameter(i);
        }
      };
      if (self._middlewares) {
        self._middlewares.unshift(handleParams);
      } else {
        self._middlewares = [handleParams];
      }
    }
  }
});

const route = new HeaderSupportedRoute();

app.use(route);

route.get('/', async (req, res) => res.send({ headers: req.headers }));
route.get('/user/:id/', async (req, res) =>
  res.send({ headers: req.headers, params: req.params })
);
route.post('/', async (req, res) => res.send({ body: req.body }));

app.listen(8000);
