import * as express from 'express';

const app: express.Application = express();
const port: number = 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
