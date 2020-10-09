import * as express from 'express';
import * as path from 'path';

const app: express.Application = express();
const port: number = 3000;

/**
 * Expose the index.html file
 */
app.use(express.static('public'));

app.get('/', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
