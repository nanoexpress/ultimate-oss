import httpExpose from './route/http-expose.js';
import publishExpose from './route/publish-expose.js';
import wraps from './route/wraps.js';
import wsExpose from './route/ws-expose.js';

export default (Route) => {
  httpExpose(Route);
  wsExpose(Route);
  publishExpose(Route);
  wraps(Route);

  return Route;
};
