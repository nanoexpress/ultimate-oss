import nanoexpress from '../src/nanoexpress.js';
import Route from '../src/Route.js';

const app = nanoexpress({
  json_spaces: 2
});

class HeaderSupportedRoute extends Route {
  async middleware(req) {
    req.headers = {};
    req.forEach((key, value) => {
      req.headers[key] = value;
    });
  }
  onPrepare() {
    const { _middlewares } = this;

    if (_middlewares) {
      _middlewares.unshift(this.middleware);
    } else {
      this._middlewares = [this.middleware];
    }
  }
}

const route = new HeaderSupportedRoute();

app.use(route);

route.get('/', async (req, res) => {
  return res.send({ headers: req.headers });
});

app.listen(8000);
