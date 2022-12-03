'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var uWS = require('uWebSockets.js');
var debugLog = require('debug');
var queryParse = require('fast-query-parse');
var stream = require('stream');
var http = require('http');
var EventsEmitter = require('events');
var fs = require('fs');
var zlib = require('zlib');
var analyze = require('@nanoexpress/route-syntax-parser');
var fastDecodeURI = require('fast-decode-uri-component');
var pathToRegexp = require('path-to-regexp');

const request = Symbol('NanoexpressHttpRequestInstance');
const response = Symbol('NanoexpressHttpResponseInstance');
const reqConfig = Symbol('NanoexpressHttpRequestConfig');
const reqEvents = Symbol('NanoexpressHttpRequestEvents');
const reqRequest = Symbol('NanoexpressHttpRequestRawInstance');
const reqRawResponse = Symbol('NanoexpressHttpResponseRawInstance');
const resHeaders = Symbol('NanoexpressHttpResponseHeaders');
const resConfig = Symbol('NanoexpressHttpResponseConfig');
const resEvents = Symbol('NanoexpressHttpResponseEvents');
const resAbortHandler = Symbol('NanoexpressHttpResponseAbortHandler');
const resAbortHandlerExpose = Symbol('NanoexpressHttpResponseAbortHandlerExpose');
const appInstance = Symbol('NanoexpressAppInstance');
const routerInstances = Symbol('NanoexpressRouterInstances');
const wsInstances = Symbol('NanoexpressWebSocketInstances');

function _gc() {
    try {
        if (global.gc) {
            global.gc();
        }
        return true;
    }
    catch (e) {
        return false;
    }
}

const debug = debugLog('nanoexpress');
debugLog('nanoexpress:error');
const warn = debugLog('nanoexpress:warn');

const lastDeps = [];
const callbacks = [];
let hookIndex = 0;
const register = (runValue = false, returnValue = false) => (callback, dependencies) => {
    if (!dependencies ||
        !lastDeps[hookIndex] ||
        !lastDeps[hookIndex].every((dep, depIndex) => dep === dependencies[depIndex])) {
        callbacks[hookIndex] = {
            handler: runValue ? callback() : callback,
            dependencies,
            isEffect: runValue && !returnValue,
            mounted: runValue
        };
        lastDeps[hookIndex] = dependencies;
    }
    const _callback = callbacks[hookIndex].handler;
    hookIndex += 1;
    if (returnValue) {
        return _callback;
    }
};
const unregister = () => {
    callbacks.forEach((callback) => {
        if (callback.isEffect &&
            callback.mounted &&
            typeof callback.handler === 'function') {
            callback.handler();
            callback.mounted = false;
        }
    });
    hookIndex = 0;
};

const codesBetween = Array.from({ length: 500 })
    .fill(0)
    .map((_, index) => 100 + index);
const httpCodes = codesBetween.reduce((codes, code) => {
    const codeString = http.STATUS_CODES[code];
    if (codeString) {
        codes[code] = `${code} ${codeString}`;
    }
    return codes;
}, {});

[
    'get',
    'post',
    'put',
    'patch',
    'del',
    'any',
    'head',
    'options',
    'trace'
].map((m) => m.toUpperCase());

function invalid(message) {
    throw new Error(message);
}

var iterateBlocks = (blocks) => {
    return [...new Set(blocks.map((block) => block.mode))];
};

const mimes = {
    '3gp': 'video/3gpp',
    a: 'application/octet-stream',
    ai: 'application/postscript',
    aif: 'audio/x-aiff',
    aiff: 'audio/x-aiff',
    asc: 'application/pgp-signature',
    asf: 'video/x-ms-asf',
    asm: 'text/x-asm',
    asx: 'video/x-ms-asf',
    atom: 'application/atom+xml',
    au: 'audio/basic',
    avi: 'video/x-msvideo',
    bat: 'application/x-msdownload',
    bin: 'application/octet-stream',
    bmp: 'image/bmp',
    bz2: 'application/x-bzip2',
    c: 'text/x-c',
    cab: 'application/vnd.ms-cab-compressed',
    cc: 'text/x-c',
    chm: 'application/vnd.ms-htmlhelp',
    class: 'application/octet-stream',
    com: 'application/x-msdownload',
    conf: 'text/plain',
    cpp: 'text/x-c',
    crt: 'application/x-x509-ca-cert',
    css: 'text/css',
    csv: 'text/csv',
    cxx: 'text/x-c',
    deb: 'application/x-debian-package',
    der: 'application/x-x509-ca-cert',
    diff: 'text/x-diff',
    djv: 'image/vnd.djvu',
    djvu: 'image/vnd.djvu',
    dll: 'application/x-msdownload',
    dmg: 'application/octet-stream',
    doc: 'application/msword',
    dot: 'application/msword',
    dtd: 'application/xml-dtd',
    dvi: 'application/x-dvi',
    ear: 'application/java-archive',
    eml: 'message/rfc822',
    eps: 'application/postscript',
    exe: 'application/x-msdownload',
    f: 'text/x-fortran',
    f77: 'text/x-fortran',
    f90: 'text/x-fortran',
    flv: 'video/x-flv',
    for: 'text/x-fortran',
    gem: 'application/octet-stream',
    gemspec: 'text/x-script.ruby',
    gif: 'image/gif',
    gz: 'application/x-gzip',
    h: 'text/x-c',
    hh: 'text/x-c',
    htm: 'text/html',
    html: 'text/html',
    ico: 'image/vnd.microsoft.icon',
    ics: 'text/calendar',
    ifb: 'text/calendar',
    iso: 'application/octet-stream',
    jar: 'application/java-archive',
    java: 'text/x-java-source',
    jnlp: 'application/x-java-jnlp-file',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'application/javascript',
    json: 'application/json',
    log: 'text/plain',
    m3u: 'audio/x-mpegurl',
    m4v: 'video/mp4',
    man: 'text/troff',
    mathml: 'application/mathml+xml',
    mbox: 'application/mbox',
    mdoc: 'text/troff',
    me: 'text/troff',
    mid: 'audio/midi',
    midi: 'audio/midi',
    mime: 'message/rfc822',
    mjs: 'application/javascript',
    mml: 'application/mathml+xml',
    mng: 'video/x-mng',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    mp4v: 'video/mp4',
    mpeg: 'video/mpeg',
    mpg: 'video/mpeg',
    ms: 'text/troff',
    msi: 'application/x-msdownload',
    odp: 'application/vnd.oasis.opendocument.presentation',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odt: 'application/vnd.oasis.opendocument.text',
    ogg: 'application/ogg',
    p: 'text/x-pascal',
    pas: 'text/x-pascal',
    pbm: 'image/x-portable-bitmap',
    pdf: 'application/pdf',
    pem: 'application/x-x509-ca-cert',
    pgm: 'image/x-portable-graymap',
    pgp: 'application/pgp-encrypted',
    pkg: 'application/octet-stream',
    pl: 'text/x-script.perl',
    pm: 'text/x-script.perl-module',
    png: 'image/png',
    pnm: 'image/x-portable-anymap',
    ppm: 'image/x-portable-pixmap',
    pps: 'application/vnd.ms-powerpoint',
    ppt: 'application/vnd.ms-powerpoint',
    ps: 'application/postscript',
    psd: 'image/vnd.adobe.photoshop',
    py: 'text/x-script.python',
    qt: 'video/quicktime',
    ra: 'audio/x-pn-realaudio',
    rake: 'text/x-script.ruby',
    ram: 'audio/x-pn-realaudio',
    rar: 'application/x-rar-compressed',
    rb: 'text/x-script.ruby',
    rdf: 'application/rdf+xml',
    roff: 'text/troff',
    rpm: 'application/x-redhat-package-manager',
    rss: 'application/rss+xml',
    rtf: 'application/rtf',
    ru: 'text/x-script.ruby',
    s: 'text/x-asm',
    sgm: 'text/sgml',
    sgml: 'text/sgml',
    sh: 'application/x-sh',
    sig: 'application/pgp-signature',
    snd: 'audio/basic',
    so: 'application/octet-stream',
    svg: 'image/svg+xml',
    svgz: 'image/svg+xml',
    swf: 'application/x-shockwave-flash',
    t: 'text/troff',
    tar: 'application/x-tar',
    tbz: 'application/x-bzip-compressed-tar',
    tcl: 'application/x-tcl',
    tex: 'application/x-tex',
    texi: 'application/x-texinfo',
    texinfo: 'application/x-texinfo',
    text: 'text/plain',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    torrent: 'application/x-bittorrent',
    tr: 'text/troff',
    txt: 'text/plain',
    vcf: 'text/x-vcard',
    vcs: 'text/x-vcalendar',
    vrml: 'model/vrml',
    war: 'application/java-archive',
    wav: 'audio/x-wav',
    wma: 'audio/x-ms-wma',
    wmv: 'video/x-ms-wmv',
    wmx: 'video/x-ms-wmx',
    wrl: 'model/vrml',
    wsdl: 'application/wsdl+xml',
    xbm: 'image/x-xbitmap',
    xhtml: 'application/xhtml+xml',
    xls: 'application/vnd.ms-excel',
    xml: 'application/xml',
    xpm: 'image/x-xpixmap',
    xsl: 'application/xml',
    xslt: 'application/xslt+xml',
    yaml: 'text/yaml',
    yml: 'text/yaml',
    zip: 'application/zip',
    default: 'text/html'
};
const getMime = (path) => {
    const i = Number(path.lastIndexOf('.'));
    return mimes[path.substr(i + 1).toLowerCase()];
};

var slashify = (path) => path !== '*' &&
    path.charAt(path.length - 1) !== '/' &&
    path.charAt(path.length - 1) !== '*' &&
    (path.lastIndexOf('.') === -1 || path.lastIndexOf('.') < path.length - 4)
    ? `${path}/`
    : path;

var noop = () => { };

class HttpRequest {
    constructor(options) {
        this.query = null;
        this.id = 0;
        this[reqConfig] = options;
        this.registered = false;
        return this;
    }
    setRequest(req, res) {
        const options = this[reqConfig];
        this[reqRequest] = req;
        this[reqRawResponse] = res;
        const query = req.getQuery();
        const url = req.getUrl();
        this.url = url;
        this.originalUrl = this.url;
        this.path = url;
        this.baseUrl = '';
        this.method = req.getMethod().toUpperCase();
        this.headers = {};
        req.forEach((key, value) => {
            this.headers[key] = value;
        });
        if (url.charAt(url.length - 1) !== '/') {
            this.url += '/';
            this.path += '/';
            this.originalUrl += '/';
        }
        if (options.enableExpressCompatibility && query) {
            this.originalUrl += `?${query}`;
        }
        this.query = queryParse(query);
        if (this.method === 'POST' || this.method === 'PUT') {
            this.stream = new stream.Readable({ read() { } });
            this[reqEvents] = null;
            this.registered = false;
        }
        this.id = Math.round(Math.random() * 1e5);
        return this;
    }
    on(event, listener) {
        const { stream } = this;
        if (stream) {
            stream.on(event, listener);
        }
        return this;
    }
    emit(event, ...args) {
        const { stream } = this;
        if (stream) {
            stream.emit(event, ...args);
        }
        return this;
    }
    getHeader(key) {
        return this.headers[key];
    }
    hasHeader(key) {
        return !!this.headers[key];
    }
    getParameter(index) {
        return this[reqRequest].getParameter(index);
    }
    pipe(destination) {
        const { stream } = this;
        if (stream.readableDidRead || stream.readableEnded) {
            return invalid('Stream already used, cannot use one stream twice');
        }
        if (stream) {
            return stream.pipe(destination);
        }
        return invalid('Stream was not defined, something wrong, please check your code or method is not a POST or PUT');
    }
    async *[Symbol.asyncIterator]() {
        const { stream } = this;
        if (stream) {
            for await (const chunk of stream) {
                yield chunk;
            }
        }
    }
}

class HttpResponse {
    constructor(config) {
        this._headersSet = false;
        this.mode = 'queue';
        this.id = 0;
        this[resConfig] = config;
        this.done = false;
        this.aborted = false;
        this._headersSet = false;
        this.registered = false;
        this.streaming = false;
        this[resEvents] = null;
        this[resAbortHandler] = [];
        this[resAbortHandlerExpose] = false;
        this[request] = null;
        this[response] = null;
        this[resHeaders] = null;
        this.mode = config.responseMode;
        this.statusCode = 200;
    }
    registerEvents() {
        const emitter = this[resEvents];
        if (emitter && !this.registered) {
            this.exposeAborted();
            emitter
                .on('pipe', (stream) => {
                debug('stream.pipe(res)');
                this.streaming = true;
                this.stream(stream);
            })
                .on('data', () => {
                debug('stream.pipe(res):data event');
            })
                .on('unpipe', () => {
                debug('stream.unpipe(res)');
                this.aborted = true;
            })
                .on('error', () => {
                debug('stream.pipe(res) error');
                this.aborted = true;
                this.end();
            });
            this.registered = true;
        }
        return this;
    }
    on(eventName, eventArgument) {
        let emitter = this[resEvents];
        if (!emitter) {
            this[resEvents] = new EventsEmitter.EventEmitter();
        }
        emitter = this[resEvents];
        emitter.on(eventName, eventArgument);
        debug('res.on(%s, handler)', eventName);
        this.registerEvents();
        return this;
    }
    once(eventName, eventArgument) {
        let emitter = this[resEvents];
        if (!emitter) {
            this[resEvents] = new EventsEmitter.EventEmitter();
        }
        emitter = this[resEvents];
        emitter.once(eventName, eventArgument);
        debug('res.once(%s, handler)', eventName);
        this.registerEvents();
        return this;
    }
    off(eventName, eventArgument) {
        let emitter = this[resEvents];
        if (!emitter) {
            return this;
        }
        emitter = this[resEvents];
        emitter.off(eventName, eventArgument);
        debug('res.off(%s, handler)', eventName);
        this.registerEvents();
        return this;
    }
    removeListener(eventName, eventArgument) {
        let emitter = this[resEvents];
        if (!emitter) {
            return this;
        }
        emitter = this[resEvents];
        emitter.removeListener(eventName, eventArgument);
        debug('res.removeListener(%s, handler)', eventName);
        this.registerEvents();
        return this;
    }
    emit(eventName, eventArgument) {
        let emitter = this[resEvents];
        if (!emitter) {
            this[resEvents] = new EventsEmitter.EventEmitter();
        }
        debug('res.emit(%s, argument)', eventName);
        emitter = this[resEvents];
        return emitter.emit(eventName, eventArgument);
    }
    setResponse(res, req) {
        this[request] = req;
        this[response] = res;
        this.done = false;
        this.aborted = res.aborted || false;
        this._headersSet = false;
        this.streaming = false;
        this.registered = false;
        this[resEvents] = null;
        this[resAbortHandlerExpose] = false;
        this[resAbortHandler].length = 0;
        this[resHeaders] = null;
        this.statusCode = 200;
        this.id = Math.round(Math.random() * 1e5);
        return this;
    }
    end(body, closeConnection) {
        const { mode } = this;
        const res = this[response];
        if (res && mode === 'cork') {
            res.cork(() => {
                this._end(body, closeConnection);
            });
            return this;
        }
        return this._end(body, closeConnection);
    }
    sse(body) {
        const { mode } = this;
        const res = this[response];
        this.exposeAborted();
        if (res && mode === 'cork') {
            res.cork(() => {
                this._sse(body);
            });
            return this;
        }
        return this._sse(body);
    }
    _sse(body) {
        const { mode, statusCode, done, streaming, _headersSet, [resHeaders]: _headers } = this;
        const res = this[response];
        if (!done && res && !streaming && !done) {
            debug('res.sse(body) called with status %d and has headers', statusCode, _headersSet);
            res.writeStatus(httpCodes[statusCode]);
            if (mode !== 'immediate') {
                if (_headersSet) {
                    for (const header in _headers) {
                        const value = _headers[header];
                        if (value) {
                            res.writeHeader(header, value);
                        }
                    }
                }
            }
            res.writeHeader('Content-Type', 'text/event-stream; charset=utf-8');
            res.writeHeader('Connection', 'keep-alive');
            res.writeHeader('Cache-Control', 'no-cache, no-store, no-transform');
            body.on('data', (data) => {
                if (!this.aborted) {
                    res.write(data);
                }
            });
            this.streaming = true;
            this[response] = null;
        }
        return this;
    }
    _end(body, closeConnection) {
        const { mode, statusCode, done, streaming, _headersSet, [resHeaders]: _headers } = this;
        const res = this[response];
        if (!done && res && !streaming) {
            debug('res.end(body) called with status %d and has headers', statusCode, _headersSet);
            res.writeStatus(httpCodes[statusCode]);
            if (mode !== 'immediate') {
                if (_headersSet) {
                    for (const header in _headers) {
                        const value = _headers[header];
                        if (value) {
                            res.writeHeader(header, value);
                        }
                    }
                }
            }
            res.end(body, closeConnection);
            this.done = true;
            this[response] = null;
        }
        return this;
    }
    status(code) {
        debug('res.status(%d)', code);
        this.statusCode = code;
        return this;
    }
    writeHead(code, headers) {
        if (typeof code === 'object' && !headers) {
            headers = code;
            code = 200;
        }
        if (code !== undefined && code !== 200) {
            this.statusCode = code;
        }
        if (headers !== undefined) {
            this.setHeaders(headers);
        }
        return this;
    }
    redirect(code, path) {
        if (!path && typeof code === 'string') {
            path = code;
            code = 301;
        }
        if (path && path.indexOf('/') === -1) {
            path = `/${path}`;
        }
        this.statusCode = code;
        this.setHeader('Location', path);
        return this.end();
    }
    sendStatus(code) {
        debug('res.sendStatus(%d)', code);
        this.statusCode = code;
        return this.end();
    }
    send(data, closeConnection) {
        const { done, compiledResponse } = this;
        if (!done && this[response]) {
            if (compiledResponse) {
                return this.end(compiledResponse, closeConnection);
            }
            if (this.serialize) {
                return this.end(this.serialize(data), closeConnection);
            }
            if (typeof data === 'object') {
                this.setHeader('Content-Type', 'application/json; charset=utf-8');
                return this.end(JSON.stringify(data, this[resConfig].json_replacer, this[resConfig].json_spaces), closeConnection);
            }
            return this.end(data, closeConnection);
        }
        return this;
    }
    pipe(stream, size, compressed) {
        debug('res.pipe(stream, %d, %j)', size, compressed);
        return this.stream(stream, size, compressed);
    }
    stream(stream, size, compressed = false) {
        const { mode, [request]: req, [response]: res } = this;
        if (req && (!size || Number.isNaN(size)) && req.headers['content-length']) {
            size = +req.headers['content-length'];
        }
        else if ((!size || Number.isNaN(size)) && stream.path) {
            ({ size } = fs.statSync(stream.path));
        }
        if (res && mode === 'cork') {
            res.cork(() => {
                this._stream(stream, size, compressed);
            });
            return this;
        }
        return this._stream(stream, size, compressed);
    }
    _stream(stream, size, compressed = false) {
        if (!this.done && this[response] && this[response] !== null) {
            const res = this[response];
            const config = this[resConfig];
            const { mode, statusCode, _headersSet, [resHeaders]: _headers } = this;
            this.exposeAborted();
            let calledData = !config.enableExpressCompatibility;
            if (compressed) {
                const compressedStream = this.compressStream(stream);
                if (compressedStream) {
                    stream = compressedStream;
                }
            }
            const onclose = () => {
                if (calledData) {
                    this.done = true;
                    this.streaming = false;
                    this.emit('close');
                }
                else if (stream.path) {
                    stream.close();
                    warn('res.stream(stream) data was not called, but mimicked by [nanoexpress], performance may be dropped and even can be stuck at responses, so please use official middlewares to avoid such errors');
                    this.stream(fs.createReadStream(stream.path), size, compressed);
                }
            };
            const onfinish = () => {
                if (calledData) {
                    if (typeof stream.close === 'function') {
                        stream.close();
                    }
                    else {
                        stream.emit('close');
                    }
                }
                this.emit('finish');
            };
            res.writeStatus(httpCodes[statusCode]);
            if (mode !== 'immediate') {
                if (_headersSet) {
                    for (const header in _headers) {
                        const value = _headers[header];
                        if (value) {
                            res.writeHeader(header, value);
                        }
                    }
                }
            }
            if (compressed || !size || Number.isNaN(size)) {
                debug('res.stream:compressed(stream, %d, %j)', size, compressed);
                stream
                    .on('data', (buffer) => {
                    calledData = true;
                    if (this.aborted || this.done) {
                        return;
                    }
                    res.write(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
                })
                    .on('close', onclose)
                    .on('finish', onfinish);
            }
            else {
                debug('res.stream:uncompressed(stream, %d, %j)', size, compressed);
                stream.on('data', (buffer) => {
                    calledData = true;
                    if (this.done || this.aborted) {
                        return;
                    }
                    buffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
                    const lastOffset = res.getWriteOffset();
                    const [ok, done] = res.tryEnd(buffer, size);
                    if (done) {
                        this.done = true;
                    }
                    else if (!ok) {
                        stream.pause();
                        res.onWritable((offset) => {
                            if (this.done || this.aborted) {
                                return true;
                            }
                            const [writeOk, writeDone] = res.tryEnd(buffer.slice(offset - lastOffset), size);
                            if (writeDone) {
                                this.done = true;
                            }
                            else if (writeOk) {
                                stream.resume();
                            }
                            return writeOk;
                        });
                    }
                });
            }
            stream
                .on('error', (error) => {
                stream.destroy(error);
                this.aborted = true;
                this.emit('error', error);
            })
                .on('close', onclose)
                .on('finish', onfinish);
        }
        return this;
    }
    compressStream(stream, options, priority = ['gzip', 'br', 'deflate']) {
        const req = this[request];
        if (!req) {
            invalid('This method requires active `HttpRequest`. Please load required middleware');
            return null;
        }
        if (!req.headers) {
            invalid('This method requires active `HttpRequest.headers`. Please load required middleware');
            return null;
        }
        const contentEncoding = req.headers['content-encoding'];
        const encoding = priority.find((currentEncoding) => contentEncoding && contentEncoding.indexOf(currentEncoding) !== -1);
        let compression = null;
        if (encoding === 'br') {
            compression = zlib.createBrotliCompress(options);
        }
        else if (encoding === 'gzip') {
            compression = zlib.createGzip(options);
        }
        else if (encoding === 'deflare') {
            compression = zlib.createDeflate(options);
        }
        if (compression && encoding) {
            stream.pipe(compression);
            this.setHeader('content-encoding', encoding);
        }
        return compression;
    }
    sendFile(path, lastModified = true, compressed = false) {
        const req = this[request];
        const headers = req?.headers;
        const stat = fs.statSync(path);
        let { size } = stat;
        if (lastModified) {
            const { mtime } = stat;
            mtime.setMilliseconds(0);
            const mtimeutc = mtime.toUTCString();
            if (headers && headers['if-modified-since']) {
                if (new Date(headers['if-modified-since']) >= mtime) {
                    this.statusCode = 304;
                    return this.end();
                }
            }
            this.setHeader('last-modified', mtimeutc);
        }
        this.setHeader('content-type', getMime(path));
        let start = 0;
        let end = 0;
        if (headers && headers.range) {
            [start, end] = headers.range
                .substr(6)
                .split('-')
                .map((byte) => (byte ? parseInt(byte, 10) : undefined));
            if (end === undefined) {
                end = size - 1;
            }
            if (start !== undefined) {
                this.statusCode = 206;
                this.setHeader('accept-ranges', 'bytes');
                this.setHeader('content-range', `bytes ${start}-${end}/${size}`);
                size = end - start + 1;
            }
        }
        if (end < 0) {
            end = 0;
        }
        const createStreamInstance = end
            ? fs.createReadStream(path, { start, end })
            : fs.createReadStream(path);
        return this.stream(createStreamInstance, size, compressed);
    }
    write(chunk) {
        const res = this[response];
        if (!this.done && res && !this.streaming) {
            debug('res.write(%s)', chunk);
            res.write(chunk);
            return this;
        }
        return this;
    }
    exposeAborted() {
        const res = this[response];
        if (!this[resAbortHandlerExpose] && res) {
            debug('res.onAborted is exposed');
            res.onAborted(() => {
                this.aborted = true;
                warn('res.onAborted is called');
                this[resAbortHandler].forEach((callback) => callback());
            });
            this[resAbortHandlerExpose] = true;
        }
        return this;
    }
    onAborted(handler) {
        this[resAbortHandler].push(handler);
        return this;
    }
    getHeader(key) {
        const headers = this[resHeaders];
        if (headers && headers[key]) {
            debug("res.getHeader('%s')", key);
            return headers[key];
        }
        return null;
    }
    hasHeader(key) {
        debug("res.hasHeader('%s')", key);
        return this.getHeader(key) !== null;
    }
    setHeader(key, value) {
        const { mode, [response]: res } = this;
        debug("res.setHeader('%s', '%s')", key, value);
        if (res && mode === 'immediate') {
            res.writeHeader(key, value);
            return this;
        }
        if (!this[resHeaders]) {
            this[resHeaders] = {};
        }
        this._headersSet = true;
        const headers = this[resHeaders];
        headers[key] = value;
        return this;
    }
    set(key, value) {
        return this.setHeader(key, value);
    }
    setHeaders(headers) {
        const { mode, [response]: res } = this;
        if (res && mode === 'immediate') {
            warn('res.setHeaders(headers) cannot be set due of immediate mode');
            return this;
        }
        debug('res.setHeaders(headers)');
        this._headersSet = true;
        if (this[resHeaders]) {
            Object.assign(this[resHeaders], headers);
        }
        else {
            this[resHeaders] = headers;
        }
        return this;
    }
    removeHeader(key) {
        const { mode, [response]: res } = this;
        if (res && mode === 'immediate') {
            warn("res.removeHeader('%s') cannot be set due of immediate mode", key);
            return this;
        }
        debug("res.removeHeader('%s')", key);
        const headers = this[resHeaders];
        if (headers && headers[key]) {
            headers[key] = null;
        }
        return this;
    }
    type(contentType) {
        debug('res.type(%s)', contentType);
        return this.setHeader('content-type', contentType);
    }
}

var legacyUtil = (middleware) => {
    warn('legacy middlewares is deprecated and in future we will remove express.js middlewares support');
    const httpHandler = function legacyMiddlewarePolyfillHandler(req, res) {
        return new Promise((resolve, reject) => {
            middleware(req, res, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    };
    const displayName = middleware.name;
    httpHandler.raw = middleware;
    httpHandler.displayName = displayName;
    return httpHandler;
};

class RouteEngine {
    constructor(options) {
        this.params = false;
        this.headers = false;
        this.cookies = false;
        this.query = false;
        this.body = false;
        this.property = false;
        this.options = options;
        this.routes = [];
        this.async = false;
        this.await = false;
    }
    parse(incomingRoute) {
        const { options: config } = this;
        const route = {
            ...incomingRoute,
            all: false,
            regex: false,
            fetch_params: false,
            async: false,
            await: false,
            legacy: false,
            analyzeBlocks: []
        };
        if (typeof route.path === 'string') {
            if (config.ignoreTrailingSlash) {
                route.path = slashify(route.path);
                route.originalUrl = slashify(route.originalUrl);
            }
            route.path = fastDecodeURI(route.path);
            if (route.baseUrl === '*') {
                route.all = true;
            }
            else if (route.path.indexOf(':') !== -1) {
                route.fetch_params = true;
                route.param_keys = [];
                route.path = pathToRegexp.pathToRegexp(route.path, route.param_keys);
                route.regex = true;
            }
            else if (route.path.indexOf('/*') !== -1) {
                route.baseUrl = route.path.substr(0, route.path.indexOf('/*') + 1);
                route.path = route.path.substr(route.baseUrl.length);
                route.all = true;
            }
            else if (route.baseUrl.length > 1 &&
                route.baseUrl.indexOf('/*') !== -1) {
                route.baseUrl = route.baseUrl.substring(0, route.baseUrl.indexOf('/*'));
                route.originalUrl = route.originalUrl.substring(0, route.originalUrl.indexOf('/*') + 1);
                route.all = true;
            }
        }
        else if (route.path instanceof RegExp) {
            route.regex = true;
        }
        route.async = route.handler.constructor.name === 'AsyncFunction';
        route.await = route.handler.toString().includes('await');
        route.legacy = route.handler.toString().includes('next(');
        route.analyzeBlocks = analyze(route.handler);
        const usedBlocks = iterateBlocks(route.analyzeBlocks);
        if (route.legacy) {
            if (config.enableExpressCompatibility) {
                route.handler = legacyUtil(route.handler);
                route.async = true;
                route.await = true;
            }
            else {
                invalid('Express.js compatibility mode is disabled, please enable before using *express.js* middlewares, but take care - performance will not be same as disabled');
            }
        }
        if (!this.params && route.fetch_params) {
            this.params = true;
        }
        if (!this.async && route.async) {
            this.async = true;
        }
        if (!this.await && route.await) {
            this.await = true;
        }
        usedBlocks.forEach((blockName) => {
            if (blockName === 'property') ;
            else {
                if (!this[blockName]) {
                    this[blockName] = true;
                }
            }
        });
        debug('route registered [%s] baseurl(%s) path(%s) - originalurl(%s)', route.method, route.baseUrl, route.path, route.originalUrl);
        return route;
    }
    on(method, path, handler, baseUrl, originalUrl) {
        if (Array.isArray(method)) {
            method.forEach((methodId) => {
                this.on(methodId, path, handler, baseUrl, originalUrl);
            });
            return this;
        }
        if (Array.isArray(path)) {
            path.forEach((pathId) => {
                this.on(method, pathId, handler, baseUrl, originalUrl);
            });
            return this;
        }
        if (Array.isArray(handler)) {
            handler.forEach((handlerId) => {
                this.on(method, path, handlerId, baseUrl, originalUrl);
            });
            return this;
        }
        this.routes.push(this.parse({ method, path, baseUrl, originalUrl, handler }));
        _gc();
        return this;
    }
    off(method, path, handler, baseUrl, originalUrl) {
        const parsed = this.parse({ method, path, baseUrl, originalUrl, handler });
        if (!handler) {
            this.routes = this.routes.filter((route) => !(route.method === parsed.method && route.path === parsed.path));
        }
        else {
            this.routes = this.routes.filter((route) => !(route.method === parsed.method &&
                route.path === parsed.path &&
                route.handler === parsed.handler));
        }
        _gc();
        return this;
    }
    async lookup(req, res) {
        const { routes, options } = this;
        let response;
        for (let i = 0, len = routes.length; i < len; i += 1) {
            const route = routes[i];
            if (res.done) {
                debug('routes lookup early exit');
                return res;
            }
            if (route.method === 'ANY' || route.method === req.method) {
                let found = false;
                if (route.all) {
                    found =
                        route.path && route.path !== '*'
                            ? req.path.includes(route.path)
                            : route.originalUrl === '*' ||
                                req.originalUrl.substr(route.originalUrl.length).length > 1;
                }
                else if (route.regex && route.path.test(req.path)) {
                    found = true;
                }
                else if (route.path === req.path && route.baseUrl === req.baseUrl) {
                    found = true;
                }
                else if (route.originalUrl === req.originalUrl) {
                    found = true;
                }
                if (found) {
                    if (route.fetch_params && route.param_keys) {
                        const exec = route.path.exec(req.path);
                        req.params = {};
                        for (let p = 0, lenp = route.param_keys.length; exec && p < lenp; p += 1) {
                            const key = route.param_keys[p].name;
                            const value = exec[p + 1];
                            req.params[key] = value;
                        }
                    }
                    if (options.enableExpressCompatibility &&
                        route.baseUrl !== '' &&
                        route.baseUrl !== '*' &&
                        req.path.indexOf(route.baseUrl) === 0) {
                        req.baseUrl = route.baseUrl;
                        req.path = req.originalUrl.substr(req.baseUrl.length);
                        req.url = req.originalUrl.substr(req.baseUrl.length);
                    }
                    if (route.async || route.legacy) {
                        response = await route.handler(req, res);
                    }
                    else {
                        response = route.handler(req, res);
                    }
                    if (res.streaming || res.done || response === res) {
                        debug('routes lookup was done with HttpResponse');
                        return res;
                    }
                    if (!res.streaming && !res.done && response) {
                        debug('routes lookup was done with async json result');
                        return res.send(response);
                    }
                    debug('routes lookup was done without any match');
                }
                else {
                    debug('routes lookup was not found without any match');
                }
            }
        }
    }
}

class Router {
    constructor() {
        this[routerInstances] = [];
        this[wsInstances] = [];
        this._basePath = '';
        return this;
    }
    on(method, path, handlers, baseUrl, originalUrl) {
        const { _engine } = this;
        if (_engine) {
            _engine.on(method, path, handlers, baseUrl, originalUrl);
        }
        else if (Array.isArray(handlers)) {
            handlers.forEach((handler) => {
                this[routerInstances].push({
                    method,
                    path,
                    baseUrl,
                    handler,
                    originalUrl
                });
            });
        }
        else {
            this[routerInstances].push({
                method,
                path,
                baseUrl,
                handler: handlers,
                originalUrl
            });
        }
        return this;
    }
    use(path, ...middlewares) {
        if (typeof path === 'function' || path instanceof Router) {
            middlewares.unshift(path);
            path = '*';
        }
        if (Array.isArray(path)) {
            if (path.every((routePath) => typeof routePath === 'function' || path instanceof Router)) {
                return this.use('*', ...path);
            }
        }
        middlewares.forEach((handler) => {
            if (handler instanceof Router) {
                const _routers = handler[routerInstances];
                const _ws = handler[wsInstances];
                handler[appInstance] = this;
                handler._basePath = path;
                _routers.forEach(({ method, path: routePath, handler: routeHandler, baseUrl }) => {
                    this.on(method, routePath, routeHandler, path, path + baseUrl + routePath);
                });
                this[wsInstances].push(..._ws);
                _routers.length = 0;
                _ws.length = 0;
            }
            else if (Array.isArray(handler)) {
                this.use(path, ...handler);
            }
            else {
                this.on('ANY', '*', handler, path, this._basePath + path);
            }
        });
        _gc();
        return this;
    }
    get(path, ...handlers) {
        return this.on('GET', path, handlers, this._basePath, '');
    }
    post(path, ...handlers) {
        return this.on('POST', path, handlers, this._basePath, '');
    }
    put(path, ...handlers) {
        return this.on('PUT', path, handlers, this._basePath, '');
    }
    options(path, ...handlers) {
        return this.on('OPTIONS', path, handlers, this._basePath, '');
    }
    del(path, ...handlers) {
        return this.on('DEL', path, handlers, this._basePath, '');
    }
    delete(path, ...handlers) {
        return this.del(path, ...handlers);
    }
    all(path, ...handlers) {
        return this.on('ANY', path, handlers, this._basePath, '');
    }
    ws(path, options) {
        const normalisedPath = this._basePath === '*'
            ? '*'
            : path === '/'
                ? this._basePath
                : `${this._basePath}${path}`;
        this[wsInstances].push({
            path: normalisedPath,
            options
        });
        return this;
    }
    publish(topic, message, isBinary, compress) {
        const app = this[appInstance];
        if (app) {
            return app.publish(topic, message, isBinary, compress);
        }
        invalid('nanoexpress [Router]: Please attach to `Application` before using publish');
        return false;
    }
}

class App extends Router {
    get https() {
        return this._options.https !== undefined;
    }
    get _console() {
        return this._options.console || console;
    }
    get raw() {
        return this._app;
    }
    constructor(options, app) {
        super();
        this._options = options;
        this._app = app;
        this._engine = new RouteEngine(options);
        this.defaultRoute = (_, res) => {
            return res.status(404).send({ status: 'error', code: 404 });
        };
        this.errorRoute = (err, _, res) => {
            return res.status(500).send({
                status: 'error',
                message: err.message
            });
        };
        this._ws = [];
        this._requestPools = [];
        this._responsePools = [];
        this._poolsSize = options.poolSize || 10;
        this.time = process.hrtime();
        this._separateServed = false;
        this._ran = false;
        this._instance = {};
        return this;
    }
    setNotFoundHandler(handler) {
        this.defaultRoute = handler;
        return this;
    }
    setErrorHandler(handler) {
        this.errorRoute = handler;
        return this;
    }
    handleError(error, req, res) {
        if (res && !res.aborted && !res.done && !res.streaming && this.errorRoute) {
            this.errorRoute(error, req, res);
        }
        return this;
    }
    ws(path, options) {
        this._app.ws(path, options);
        return this;
    }
    publish(topic, message, isBinary, compress) {
        return this._app.publish(topic, message, isBinary, compress);
    }
    run() {
        const { _app: app, _options: options, _ws, _requestPools, _responsePools, _poolsSize, _engine, _ran } = this;
        if (!_ran) {
            const handler = async (rawRes, rawReq) => {
                let req;
                let res;
                let response;
                if (_requestPools.length > 0) {
                    req = _requestPools.shift();
                    req.setRequest(rawReq, rawRes);
                }
                else {
                    req = new HttpRequest(options);
                    req.setRequest(rawReq, rawRes);
                }
                if (_responsePools.length > 0) {
                    res = _responsePools.shift();
                    res.setResponse(rawRes, req);
                }
                else {
                    res = new HttpResponse(options);
                    res.setResponse(rawRes, req);
                }
                if (options.ignoreTrailingSlash &&
                    req.path.charAt(req.path.length - 1) !== '/' &&
                    (req.path.lastIndexOf('.') === -1 ||
                        req.path.lastIndexOf('.') < req.path.length - 4)) {
                    if (options.enableExpressCompatibility) {
                        debug('res.redirect called instead of fast quick-fix on route ending without "/" for express.js middlewares compatibility');
                        res.redirect(`http://${req.headers.host}${req.originalUrl}/`);
                        return rawRes;
                    }
                }
                if (req.method === 'POST' || req.method === 'PUT') {
                    res.exposeAborted();
                    rawRes.onData((arrayChunk, isLast) => {
                        req.stream.push(Buffer.from(arrayChunk.slice(0)));
                        if (isLast) {
                            req.stream.push(null);
                        }
                    });
                }
                if (res.aborted || res.done || req.method === 'OPTIONS') {
                    debug('early returned ranning %o', {
                        aborted: res.aborted,
                        done: res.done,
                        method: req.method
                    });
                    return;
                }
                if (_engine.async && _engine.await) {
                    res.exposeAborted();
                    response = await _engine.lookup(req, res).catch((err) => {
                        this.handleError(err, req, res);
                    });
                    if (res[resAbortHandler]) {
                        res.onAborted(unregister);
                    }
                    else {
                        unregister();
                    }
                    if (_requestPools.length < _poolsSize) {
                        _requestPools.push(req);
                    }
                    if (_responsePools.length < _poolsSize) {
                        _responsePools.push(res);
                    }
                    return rawRes;
                }
                await _engine.lookup(req, res).catch((err) => {
                    this.handleError(err, req, res);
                });
                if (res[resAbortHandler]) {
                    res.onAborted(unregister);
                }
                else {
                    unregister();
                }
                if (_requestPools.length < _poolsSize) {
                    _requestPools.push(req);
                }
                if (_responsePools.length < _poolsSize) {
                    _responsePools.push(res);
                }
                if (res &&
                    !res.done &&
                    !res.streaming &&
                    response === undefined &&
                    this.defaultRoute !== null) {
                    debug('routes lookup was not found any route, fallback to not-found');
                    const notFound = await this.defaultRoute(req, res);
                    if (notFound !== res) {
                        res.send(notFound);
                    }
                }
                return rawRes;
            };
            app.any('/*', handler);
            _ws.forEach(({ path, options: wsOptions }) => {
                app.ws(path, wsOptions);
            });
            _ws.length = 0;
            _gc();
            this._ran = true;
        }
        return this;
    }
    listenSocket(port, host = 'localhost', is_ssl = false, handler = noop) {
        const { _options: options } = this;
        if ((port === 80 || port === 443) &&
            this.https &&
            options.https?.separateServer &&
            !this._separateServed) {
            const httpsPort = typeof options.https.separateServer === 'number'
                ? options.https.separateServer
                : 443;
            this._separateServed = true;
            return Promise.all([
                this.listenSocket(port, host, false, handler),
                this.listenSocket(httpsPort, host, true, handler)
            ]);
        }
        return this._appApplyListen(host, port, is_ssl, handler);
    }
    listen(...args) {
        let port = 8000;
        let host = 'localhost';
        let ssl = false;
        let handler = () => { };
        args.forEach((listenArg) => {
            if (typeof +listenArg === 'number' && !Number.isNaN(+listenArg)) {
                port = +listenArg;
            }
            else if (typeof listenArg === 'function') {
                handler = listenArg;
            }
            else if (typeof listenArg === 'string' &&
                (listenArg === 'localhost' || listenArg.includes('.'))) {
                host = listenArg;
            }
            else if (listenArg === true) {
                ssl = true;
            }
        });
        this.run();
        return this.listenSocket(port, host, ssl, handler);
    }
    close(port, host = 'localhost') {
        const id = `${host}:${port}`;
        const token = this._instance[id];
        this._separateServed = false;
        this.time[0] = 0;
        this.time[1] = 0;
        return this._close(token, id);
    }
    _appApplyListen(host, port, is_ssl = false, handler = noop) {
        const { _console, _options: options, _app: app } = this;
        const sslString = is_ssl ? 'HTTPS ' : is_ssl === false ? 'HTTP ' : '';
        return new Promise((resolve, reject) => {
            if (port === undefined) {
                const _errorContext = 'error' in _console ? _console : console;
                _errorContext.error('[Server]: PORT is required');
                return undefined;
            }
            const id = `${host}:${port}`;
            const onListenHandler = (token) => {
                if (token) {
                    const _debugContext = 'debug' in _console ? _console : console;
                    const end = process.hrtime(this.time);
                    this._instance[id] = token;
                    _debugContext.debug(`[${sslString}Server]: started successfully at [${id}] in [${((Number(end[0]) * 1000 + Number(end[1])) /
                        1000000).toFixed(2)}ms] on PID[${process.pid}]`);
                    _gc();
                    handler();
                    return resolve(token);
                }
                const _errorContext = 'error' in _console ? _console : console;
                const err = new Error(this.https &&
                    (!options.https ||
                        !options.https.cert_file_name ||
                        !options.https.key_file_name)
                    ? `[${sslString}Server]: SSL certificate was not defined or loaded`
                    : `[${sslString}Server]: failed to host at [${id}]`);
                _errorContext.error(err.message);
                _gc();
                return reject(err);
            };
            if (host && host !== 'localhost') {
                app.listen(host, port, onListenHandler);
            }
            else {
                app.listen(port, onListenHandler);
            }
        });
    }
    _close(token, id) {
        const { _console } = this;
        if (token) {
            const _debugContext = 'debug' in _console ? _console : console;
            uWS.us_listen_socket_close(token);
            this._instance[id] = null;
            _debugContext.debug('[Server]: stopped successfully');
            _gc();
            return true;
        }
        const _errorContext = 'error' in _console ? _console : console;
        _errorContext.error('[Server]: Error, failed while stopping');
        _gc();
        return false;
    }
    disable(tag) {
        warn(`[Server]: The tag [${tag}] cannot be disabled as not set, not supported and not available`);
        return this;
    }
    set(key, value) {
        this._options[key] = value;
        return this;
    }
}

function exposeWebsocket(handler, options = {}) {
    if (typeof options.open === 'function') {
        return options;
    }
    return {
        ...options,
        open(ws) {
            ws.emit('connection', ws);
        },
        async upgrade(res, req, context) {
            const secWsKey = req.getHeader('sec-websocket-key');
            const secWsProtocol = req.getHeader('sec-websocket-protocol');
            const secWsExtensions = req.getHeader('sec-websocket-extensions');
            const events = new EventsEmitter();
            res.on = events.on.bind(events);
            res.once = events.once.bind(events);
            res.off = events.off.bind(events);
            res.emit = events.emit.bind(events);
            let aborted = false;
            res.onAborted(() => {
                aborted = true;
                events.emit('error', { aborted });
            });
            res.emit('upgrade', req, res);
            try {
                await handler(req, res);
            }
            catch (error) {
                aborted = true;
                events.emit('error', error);
            }
            if (!aborted) {
                events.emit('willUpgrade', req);
                res.upgrade({ req, ...res }, secWsKey, secWsProtocol, secWsExtensions, context);
                events.emit('upgraded', req);
            }
        },
        message: (ws, message, isBinary) => {
            ws.emit('message', message, isBinary);
        },
        drain: (ws) => {
            ws.emit('drain', ws.getBufferedAmount());
        },
        close: (ws, code, message) => {
            ws.emit('close', code, message);
        }
    };
}

const useCallback = register(false, true);
const useEffect = register(true);
const useMemo = register(true, true);
const useState = (initialValue) => {
    let value = useMemo(() => initialValue, []);
    const setValue = (newValue) => {
        value = newValue;
    };
    return [value, setValue];
};
const useRef = (ref, dependencies) => useMemo(() => ({ current: ref ?? null }), dependencies);

const nanoexpress = (options = {
    ignoreTrailingSlash: true,
    enableExpressCompatibility: false,
    responseMode: 'cork'
}) => {
    let app;
    if (options.https) {
        app = uWS.SSLApp(options.https);
    }
    else if (options.http) {
        app = uWS.App(options.http);
    }
    else {
        app = uWS.App();
    }
    return new App(options, app);
};
nanoexpress.Router = Router;
nanoexpress.App = App;
nanoexpress.exposeWebsocket = exposeWebsocket;

exports.default = nanoexpress;
exports.useCallback = useCallback;
exports.useEffect = useEffect;
exports.useMemo = useMemo;
exports.useRef = useRef;
exports.useState = useState;
//# sourceMappingURL=nanoexpress.cjs.map
