# nanoexpress Pro Slim

[![Greenkeeper badge](https://badges.greenkeeper.io/nanoexpress/pro-slim.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/nanoexpress/pro-slim.svg)](http://github.com/nanoexpress/pro-slim)
[![Code Climate](https://codeclimate.com/github/nanoexpress/pro-slim/badges/gpa.svg)](https://codeclimate.com/github/nanoexpress/pro-slim)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/nanoexpress/pro-slim/badges/quality-score.png?b=pro-esm)](https://scrutinizer-ci.com/g/nanoexpress/pro-slim/?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/nanoexpress/pro-slim/badge.svg?branch=pro-esm)](https://coveralls.io/github/nanoexpress/pro-slim?branch=pro-esm)

Nano-framework for Node.js powered by uWebSockets.js

## Documentation available [here](https://github.com/nanoexpress/pro-slim/blob/master/docs/index.md)

## Requires

- Node.js v12 or greater
- developer, already worked with nanoexpress before

## Benchmarks

| Library         | RPS   | Memory |
| --------------- | ----- | ------ |
| uWebSockets.js  | 2M    | 80Mb   |
| nanoexpress Pro | 1.79M | 180Mb  |
| nanoexpress     | 1.65M | 120Mb  |
| Raw HTTP        | 1.03M | 290Mb  |
| express         | 654K  | 430Mb  |

Benchmarked on my macBook Pro 2012 13" (Core i5, 8Gb RAM) performance.

You can see live benchmark results at [here](https://github.com/the-benchmarker/web-frameworks#results)

**Note**: _Real-world app memory/rps may differs from these numbers and these numbers are in my macBook_

_You can install `wrk` via `Homebrew` in `macOS` or `Linux`_

**Benchmark command**: `wrk -t4 -d100 -c10`

## Features

- Async/Await out-of-the-box
- No async mode supported
- Easy to use (for Express users especially)
- Blazing fast performance
- Ultra lightweight size
- Resource (CPU / Memory) effecient
- Familiar API
- Normalised API
- Can define routes Declaratively
- Express-compatible middleware
- In-built middlewares
- In-built Stream (Video stream, yay!) support
- In-built WebSocket support (Express-like API and Events)
- In-built Schema validator via `Ajv`
- Out-of-the-box `fast-json-stringify` support via `{schema}` middleware
- Small working examples
- TypeScript declaration
- Tests and CI checked code

## Examples

All examples are lives [here](https://github.com/nanoexpress/pro-slim/tree/master/examples)

## Credits

- [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js)
- [fast-json-stringify](https://github.com/fastify/fast-json-stringify)
- [ajv](https://ajv.js.org)
- [cookie](https://github.com/jshttp/cookie#readme)

And to other libraries which used to create this library and without these libraries wouldn't be possible to create this library

## License

This project is licensed under GPL-3.0 license and if you want use this on commercial projects with closed sources, you should contact to me via dalisoft@mail.ru for getting license
