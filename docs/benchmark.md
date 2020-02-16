# Benchmarks

Note: _Multi-threading/Clustering available in Linux-only env_

Note #2: _Docker may be good place to get started with Clustering. But remember, on real Linux results always higher than server Docker container by 5-10%_

**Benchmark command**: `wrk -t4 -d60 -c8`

You can see live benchmark results at [here](https://github.com/the-benchmarker/web-frameworks#results)

## Machines

Note: _Memory usage range is +-30Mb per million request_

### MBP Mid-2012

- OS: macOS Catalina
- CPU: i5-3210M
- Memory: 8GB DDR3 1600Mhz
- Env: macOS itself
- Clustering: unavailable

| Library              | Req/min | Memory |
| -------------------- | ------- | ------ |
| uWebSockets.js       | ~1.2M   | ~80Mb  |
| nanoexpress Pro Slim | ~1.1M   | ~100Mb |
| nanoexpress Pro      | ~1M     | ~180Mb |
| nanoexpress          | ~950K   | ~120Mb |
| Raw HTTP             | ~850K   | ~290Mb |
| express              | ~260K   | ~430Mb |

### Dev Machine

- OS: ElementaryOS 5.1
- CPU: i9-9900K 5Ghz
- Memory: 64GB DDR4 3000Mhz
- Env: Linux
- Clustering: available (on 16 threads)

| Library              | Req/min | Memory |
| -------------------- | ------- | ------ |
| uWebSockets.js       | 16M+    | ~140Mb |
| nanoexpress Pro Slim | ~15M    | ~160Mb |
| nanoexpress Pro      | ~13M    | ~260Mb |
| nanoexpress          | ~10M    | ~200Mb |
| Raw HTTP             | ~6M     | ~450Mb |
| express              | ~4M     | ~700Mb |

[&laquo; Docker](./docker.md)

[Testing &raquo;](./testing.md)
