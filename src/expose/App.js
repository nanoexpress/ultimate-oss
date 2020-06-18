import httpExpose from './App/http-expose.js';
import wsExpose from './App/ws-expose.js';
import publishExpose from './App/publish-expose.js';
import prepareListen from './App/prepare-listen.js';
import applyListen from './App/apply-listen.js';
import closeListen from './App/close-listen.js';

export default (App) => {
  httpExpose(App);
  wsExpose(App);
  publishExpose(App);
  prepareListen(App);
  applyListen(App);
  closeListen(App);

  return App;
};
