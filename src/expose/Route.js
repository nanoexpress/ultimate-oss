import httpExpose from './Route/http-expose.js';
import wsExpose from './Route/ws-expose.js';
import publishExpose from './Route/publish-expose.js';

export default (Route) => {
  httpExpose(Route);
  wsExpose(Route);
  publishExpose(Route);

  return Route;
};
