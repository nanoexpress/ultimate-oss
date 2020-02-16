import httpExpose from './App/http-expose.js';
import wsExpose from './App/ws-expose.js';
import publishExpose from './App/publish-expose.js';

export default (App) => {
  httpExpose(App);
  wsExpose(App);
  publishExpose(App);

  return App;
};
