"use strict";
exports.__esModule = true;
/* eslint-disable max-classes-per-file */
var uWebSockets_js_1 = require("uWebSockets.js");
var HttpResponse = /** @class */ (function () {
    function HttpResponse() {
        this.res = null;
        this.done = false;
        this.aborted = false;
    }
    HttpResponse.prototype.setResponse = function (res) {
        this.res = res;
        this.done = false;
        this.aborted = res.aborted || false;
        return this;
    };
    HttpResponse.prototype.end = function (body) {
        if (!this.done && this.res) {
            var res = this.res.end(body);
            this.done = true;
            return res;
        }
        return null;
    };
    return HttpResponse;
}());
var httpResponsesPool = (function () {
    var _pools = [];
    return {
        create: function () {
            if (_pools.length > 0) {
                return _pools.shift();
            }
            return new HttpResponse();
        },
        free: function (pool) {
            _pools.push(pool);
        }
    };
})();
var app = uWebSockets_js_1["default"].App();
app.get('/', function (res) {
    var _res = httpResponsesPool.create();
    _res.setResponse(res);
    res.end('');
    httpResponsesPool.free(_res);
});
app.listen(4000, function () { return console.log('listening at 4000'); });
