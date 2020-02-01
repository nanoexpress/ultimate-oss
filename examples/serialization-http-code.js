import nanoexpress from '../src/nanoexpress.js';
import fastJson from 'fast-json-stringify';

const app = nanoexpress();

const serialization = (responseSchema) => {
  let prepare;

  if (responseSchema.type) {
    prepare = fastJson(responseSchema);
  } else {
    const codes = {};
    for (const code in responseSchema) {
      codes[code] = fastJson(responseSchema[code]);
    }

    prepare = function(result) {
      if (this.rawStatusCode) {
        return codes[this.rawStatusCode](result);
      }
      return result;
    };
  }
  return async (req, res) => {
    res.serialize = prepare;
  };
};
const headers = (keys) => {
  return async (req) => {
    if (keys) {
      if (keys.length > 0) {
        req.headers = {};
        for (let i = 0, len = keys.length; i < len; i++) {
          req.headers[keys[i]] = req.getHeader(keys[i]);
        }
      }
    } else {
      req.forEach((key, value) => {
        if (!req.headers) {
          req.headers = {};
        }
        req.headers[key] = value;
      });
    }
  };
};

app.get('/', headers(['authorization']), async (req, res) => {
  if (req.headers && req.headers.authorization) {
    return 'hello world';
  }

  res.status(403);
  return 'Unauthorized';
});

app.listen(4000, '0.0.0.0');
