# Docker

> This patches can be applied for Linux itself

If you using `alpine` or `slim` version of `node` images, some errors may happen and you can fix with this minimal guide

## Requires

- git

### For `git` missing error

```Dockerfile
# FROM ...
RUN apk update && apk add --no-cache git
# your scripts
```

### For `Alpine` incompatible error

```Dockerfile
# your scripts
RUN ln -s /lib/libc.musl-x86_64.so.1 /lib/ld-linux-x86-64.so.2

# your commands
# CMD ["node", "server.js"]
```

### For CentOS 7 `glibc 2.18` not found error

See original answer from [here](https://serverfault.com/a/980302)

```Dockerfile
# your scripts
RUN patchelf --set-interpreter /opt/glibc-2.18/lib/ld-linux-x86-64.so.2 --set-rpath /opt/glibc-2.18/lib:/usr/lib64 pydio-agent

# your commands
# CMD ["node", "server.js"]
```

## Multi-thread / Cluster

Note: _In Docker with Linux images this feature available out-of-the-box! Enjoy!_

[&laquo; TypeScript](./typescript.md)

[Benchmark &raquo;](./benchmark.md)
