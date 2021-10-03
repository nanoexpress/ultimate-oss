import assert from 'assert';
import baretest from 'baretest';
import { App, Route } from '../../esm/nanoexpress.js';

const test = baretest('Route.define via App');

const define1 = (instance) => {
  instance.foo = true;
};

test('defined successfully', () => {
  const route = new Route();
  const app = new App({}, null, route);

  app.define(define1);

  assert.equal(route.foo, true);
});
test('defined externally successfully', () => {
  const route = new Route();
  const routeExternal = new Route();
  const app = new App({}, null, route);

  app.define(define1);
  app.use(routeExternal);

  assert.equal(route.foo, true);
  assert.equal(routeExternal.foo, true);
});

test.run();
