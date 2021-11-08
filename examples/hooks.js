import nanoexpress, { useEffect, useMemo } from '../esm/nanoexpress.js';

const app = nanoexpress();

app.get('/', (req, res) => {
  const rand = useMemo(() => Math.random() * 10000, []) | 0;

  useEffect(() => {
    console.log('we are calling', rand, req);
  }, [rand]);

  res.send({ status: 'success', rand });
});

app.listen(8000);
