import { BanksUser, RequestBuilder } from '@algoan/rest';
import * as delay from 'delay';
import * as express from 'express';
import * as path from 'path';

const app: express.Application = express();
const port: number = 3000;

const algoanRequest: RequestBuilder = new RequestBuilder('https://api.preprod.algoan.com', {
  clientId: '',
  clientSecret: '',
});

/**
 * Expose the index.html file
 */
app.use(express.static('public'));

app.get('/', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/redirect', async (req: express.Request, res: express.Response) => {
  /**
   * Create a new Banks User
   */
  const response: BanksUser = await algoanRequest.request({
    method: 'POST',
    url: '/v1/banks-users',
    data: {
      callbackUrl: `http://localhost:${port}/callback`,
      adenTriggers: {
        onSynchronizationFinished: true,
        bankreaderLinkRequired: true,
      },
    },
  });

  const banksUserId: string = response.id;

  /**
   * Try to get the redirect URL
   */
  let redirectUrl: string | undefined;
  const retryCount: number = 10;
  let count: number = 0;

  do {
    await delay(500);
    const banksUser: BanksUser = await BanksUser.getBanksUserById(banksUserId, algoanRequest);
    redirectUrl = banksUser.redirectUrl;
    count++;
  } while (redirectUrl === undefined && count < retryCount);

  if (redirectUrl === undefined) {
    res.status(404).send({
      message: 'Redirect URL not found',
    });
  }

  res.redirect(redirectUrl);
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
