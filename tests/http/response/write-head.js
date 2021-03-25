import assert from 'assert';
import baretest from 'baretest';
import writeHead from '../../../src/polyfills/http-response/polyfill-chunks/write-head.js';
import HttpResponse from '../../mock/http-response.js';

const test = baretest('HttpResponse.writeHead');
test('empty status should do nothing', () => {
  const res = new HttpResponse();
  writeHead.call(res);
  assert.ok(res);
});
test('string status code should work', () => {
  const res = new HttpResponse();
  writeHead.call(res, '201 Created');

  assert.equal(res.statusCode, '201 Created');
});

test('empty status should do nothing', () => {
  const res = new HttpResponse();
  writeHead.call(res, 201);
  assert.ok(res);
});
test('http headers should work', () => {
  const res = new HttpResponse();
  writeHead.call(res, 201, { Location: '/path_head' });
  res.applyHeaders();

  assert.equal(res.statusCode, '201 Created');
  assert.deepStrictEqual(res.___headers, [
    { key: 'Location', value: '/path_head' }
  ]);
});

test.run();
