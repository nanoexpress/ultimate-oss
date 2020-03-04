import baretest from 'baretest';
import assert from 'assert';

import Route from '../../src/Route.js';

const test = baretest('Route.create');

test('created successfully', () => {
  assert.ok(new Route());
});

test.run();
