# Benchmarks

Note: _Multi-threading/Clustering is available in Linux-only env_

Note #2: Docker may be a good place to get started with Clustering. But remember, on real Linux results always higher than server Docker container by 5-10%

Note #3: In this benchmark all framework/libraries was used as basic example without any middleware, when you use any middlewares or you already have complex logic, try optimize them to improve performance as this can slow down RPS. We cannot guarantee any performance improvements on complex backend applications.

**Benchmark command**: `wrk -t2 -d2` or `wrk TEST_URL`

You can see live benchmark results at [here](https://github.com/the-benchmarker/web-frameworks#results)

## Machines

### MBP Mid-2012

- OS: macOS Catalina
- CPU: i5-3210M
- Memory: 8GB DDR3 1600Mhz
- Env: macOS itself
- Clustering: unavailable

| Library              | Req/sec | Memory |
| -------------------- | ------- | ------ |
| uWebSockets.js       | ~70K    | ~4Mb   |
| nanoexpress Pro Slim | ~70K    | ~8Mb   |
| nanoexpress Pro      | ~60K    | ~18Mb  |
| nanoexpress          | ~55K    | ~12Mb  |
| Raw HTTP             | ~35K    | ~29Mb  |
| express              | ~25K    | ~43Mb  |

### Dev Machine

- OS: ElementaryOS 5.1
- CPU: i9-9900K 5Ghz
- Memory: 64GB DDR4 3000Mhz
- Env: Linux
- Clustering: available (on 16 threads)

Note: more than 4-cores doesn't used at unknown reason, but should improve perf even not marginally

| Library              | Req/sec | Memory |
| -------------------- | ------- | ------ |
| uWebSockets.js       | ~400K   | ~14Mb  |
| nanoexpress Pro Slim | ~400K   | ~19Mb  |
| nanoexpress Pro      | ~350K   | ~26Mb  |
| nanoexpress          | ~300K   | ~22Mb  |
| Raw HTTP             | ~250K   | ~40Mb  |
| express              | ~200K   | ~70Mb  |

## Why

and when use this framework for my backend application?

1. When your want reduce server cost for WebSocket and/or WebRTC real-time comminucation and file-exchange (maybe stream, video, photo, etc) servers.
2. When your server has low RAM memory
3. Your logic is easy and simple
4. Startups which looks for faster startup
5. You want try out how it works?!
6. You don't want spend a lot for servers

Example for HTTP

> 5\$ DigitalOcean plan can handle 1000 HTTP Requests per hour easily and without any slowdowns

or for WebSocket

> 5\$ DigitalOcean plan can handle ~20K Downloads per month in torrent server easily. Source [here](https://hackernoon.com/µws-as-your-next-websocket-library-d34209686357)

[&laquo; Docker](./docker.md)

[Testing &raquo;](./testing.md)
