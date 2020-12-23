import assert from 'assert';
import baretest from 'baretest';
import { __request } from '../../../src/constants.js';
import redirect from '../../../src/polyfills/http-response/polyfill-chunks/redirect.js';
import HttpResponse from '../../mock/HttpResponse.js';

const test = baretest('HttpResponse.redirect');

test('should return correct code', () => {
  const res = new HttpResponse();

  redirect.call(res, 301);

  assert.equal(res.___code, '301 Moved Permanently');
});
test('should return correct path and autocorrected code', () => {
  const res = new HttpResponse();

  redirect.call(res, '/path');

  assert.equal(res.___code, '301 Moved Permanently');
  assert.deepStrictEqual(res.___headers, [{ key: 'Location', value: '/path' }]);
});
test('should return correct path with host', () => {
  const res = new HttpResponse();
  res[__request].headers = {
    host: 'localhost:3333'
  };

  redirect.call(res, '/path');

  assert.equal(res.___code, '301 Moved Permanently');
  assert.deepStrictEqual(res.___headers, [
    { key: 'Location', value: 'https://localhost:3333/path' }
  ]);
});

test.run();
