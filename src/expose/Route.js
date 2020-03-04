import httpExpose from './Route/http-expose.js';
import wsExpose from './Route/ws-expose.js';
import publishExpose from './Route/publish-expose.js';
import wraps from './Route/wraps.js';

export default (Route) => {
  httpExpose(Route);
  wsExpose(Route);
  publishExpose(Route);
  wraps(Route);

  return Route;
};
