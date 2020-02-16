# Getting Started

Thanks for choosing `@nanoexpress/pro-slim` as backend server

## Why PRO

When you don't need a lot of features and you can develop own middleware in seconds to add what you need. Scale you middlewares list as you grow!

## Difference

- **Slim**: Less polyfilled methods, Less functionality, High performance, Low resource usage
- **Pro**: More polyfilled methods, More functionality, Mid-high performance, Mid resource usage

## Warning

- This library does not support HTTP2!
- This branch is paid for commercial products if sources are closed

## Install

### **Requires**: Node.js v12 or greater

### npm

```bash
npm install nanoexpress/pro-slim
```

### yarn

```bash
yarn add nanoexpress/pro-slim
```

## Let's create server

There few types of method defining, let me show you

- `app.get(req, res)`
- `app.post(req, res)`
- `app.put(req, res)`
- `app.patch(req, res)`
- `app.del(req, res)`
- `app.head(req, res)`
- `app.trace(req, res)`

Special route are

- `app.ws(req, ws)`
- `app.any(req, res)`
- `app.options(req, res)`

## Registering server

There are few types of registering sever

- `app.listen(PORT: number, host?: string, is_ssl_server?: boolean)`
- `app.listen(PORT: number[], host?: string, is_ssl_server?: boolean)`
- `app.listen(host: string, PORT: number, is_ssl_server?: boolean)`
- `app.listen(host: string, PORT: number[], is_ssl_server?: boolean)`
- `app.listen(Array<{ port: number, host?: string}>)`

### Options

There has few options which you can configure

- `isSSL: boolean` - Disables SSL enabling when need, useful for local development
- `https: { key_file_name: string, cert_file_name: string, passphrase: string, separateServer: number | boolean = 443 }` - Option to enable SSL (https) mode
- `console: CustomConsole { log, error }` - Your custom console class object for nice-looking logs :)
- `json_spaces` - JSON.stringify 3-rd parameter

```js
import nanoexpress from 'nanoexpress/pro-slim';
const app = nanoexpress();

app.get('/', async () => ({ hello: 'world' }));

app.listen(4000);
```

Caveats: Using `app.listen(PORT, '0.0.0.0')` is recommended for Docker, Heroku and AWS for compatibility.

### `app.use` example

```js
import nanoexpress from 'nanoexpress/pro-slim';
const app = nanoexpress();

app.use(async (req, res) => {
  req.time = Date.now();
});

app.listen(4000);
```

[Middlewares &raquo;](./middlewares.md)
