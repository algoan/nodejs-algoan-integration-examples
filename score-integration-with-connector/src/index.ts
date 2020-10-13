import { Aden, BanksUser, BanksUserStatus, RequestBuilder } from '@algoan/rest';
import * as delay from 'delay';
import * as express from 'express';
import * as exphbs from 'express-handlebars';
import { StatusCodes } from 'http-status-codes';
import { config } from 'node-config-ts';

const app: express.Application = express();
const port: number = 3000;
const defaultDelay: number = 500;

/**
 * Initiate a Request Builder instance
 * This class handles OAuth2 authentication and is able to refresh tokens
 */
const algoanRequest: RequestBuilder = new RequestBuilder(config.algoan.baseUrl, {
  clientId: config.algoan.clientId,
  clientSecret: config.algoan.clientSecret,
});

let banksUserId: string;
let aden: Aden | undefined;

/**
 * Expose the index.html file
 */
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

/**
 * GET /
 * Renders the index.html page
 */
app.get('/', (req: express.Request, res: express.Response) => {
  res.render('index');
});

/**
 * GET /redirect
 * Start of the aggregation process
 * Redirect the user if the banks user owns a "redirectUrl"
 */
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

  /**
   * Store locally the banks-users id value
   * Will be used to update the BanksUser status and retrieve the score
   */
  banksUserId = response.id;

  /**
   * Try to get the redirect URL
   */
  let redirectUrl: string | undefined;
  const retryCount: number = 10;
  let count: number = 0;

  do {
    await delay(defaultDelay);
    const banksUser: BanksUser = await BanksUser.getBanksUserById(banksUserId, algoanRequest);
    redirectUrl = banksUser.redirectUrl;
    count++;
  } while (redirectUrl === undefined && count < retryCount);

  if (redirectUrl === undefined) {
    res.status(StatusCodes.NOT_FOUND).send({
      message: 'Redirect URL not found',
    });
  }

  res.redirect(redirectUrl);
});

/**
 * Callback URL called by Budget Insight when the aggregation process is finished
 * Update the Banks User status to trigger accounts and transactions retrieval
 */
app.get('/callback', async (req: express.Request, res: express.Response) => {
  const code: string = req.query.code as string;

  /**
   * Update the BanksUser status
   */
  const banksUser: BanksUser = await BanksUser.getBanksUserById(banksUserId, algoanRequest);
  await banksUser.update(
    {
      status: BanksUserStatus.CONNECTION_COMPLETED,
    },
    code,
  );

  res.render('index');
});

/**
 * GET /aden
 * Retrieves ADEN and displays the result if it is defined
 */
app.get('/aden', async (req: express.Request, res: express.Response) => {
  /**
   * Try to get the aden property
   */
  const retryCount: number = 30;
  let count: number = 0;

  do {
    await delay(defaultDelay);
    const banksUser = await BanksUser.getBanksUserById(banksUserId, algoanRequest);
    aden = banksUser.aden;
    count++;
  } while (aden === undefined && count < retryCount);

  if (aden === undefined) {
    res.status(StatusCodes.NOT_FOUND).send({
      message: 'ADEN not found',
    });
  }

  res.render('index', {
    aden: JSON.stringify(aden),
  });
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
