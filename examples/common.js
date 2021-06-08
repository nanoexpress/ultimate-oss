import { nanoexpress, Route } from '..';

const route = new Route();

route.get('/foo', (req) => ({ m: req.method }));

const app = nanoexpress();

app.get('/foo', (req) => ({ method: req.method }));
