import assert from 'assert';
import baretest from 'baretest';
import status from '../../../src/polyfills/http-response/polyfill-chunks/status.js';

const test = baretest('HttpResponse.status');
const _this = {
  writeStatus(statusCode) {
    this.statusCode = statusCode;
  }
};

test('empty values should throw', () => {
  try {
    status.call(_this);
  } catch (e) {
    assert.equal(e.message, 'Invalid Code: undefined');
  }
});
test('status string should not changed', () => {
  status.call(_this, '201 Created');

  assert.equal(_this.statusCode, '201 Created');
});
test('status http code should be normalised', () => {
  status.call(_this, 201);

  assert.equal(_this.statusCode, '201 Created');
});
test('status invalid code-type should be thrown', () => {
  try {
    status.call(_this, { code: 200 });
  } catch (e) {
    assert.equal(e.message, 'Invalid Code: {"code":200}');
  }
});

test.run();
