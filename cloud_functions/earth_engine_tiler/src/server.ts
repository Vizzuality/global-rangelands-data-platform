import {eetApp} from './index';

const port = Number(process.env.PORT ?? 8080);

// Single-segment path. The router's only route is '/:z/:x/:y' (three segments),
// so this cannot be shadowed by it.
eetApp.get('/health', (_req, res) => {
  res.status(200).json({status: 'ok'});
});

eetApp.listen(port, '0.0.0.0', () => {
  console.log(`earth_engine_tiler listening on ${port}`);
});
