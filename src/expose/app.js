import applyListen from './app/apply-listen.js';
import closeListen from './app/close-listen.js';
import httpExpose from './app/http-expose.js';
import prepareListen from './app/prepare-listen.js';
import publishExpose from './app/publish-expose.js';
import wsExpose from './app/ws-expose.js';

export default (App) => {
  httpExpose(App);
  wsExpose(App);
  publishExpose(App);
  prepareListen(App);
  applyListen(App);
  closeListen(App);

  return App;
};
