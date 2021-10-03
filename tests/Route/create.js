import assert from 'assert';
import baretest from 'baretest';
import { Route } from '../../esm/nanoexpress.js';

const test = baretest('Route.create');

test('created successfully', () => {
  assert.ok(new Route());
});

test.run();
