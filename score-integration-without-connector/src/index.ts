import { RequestBuilder } from '@algoan/rest';
import * as delay from 'delay';
import * as express from 'express';
import * as exphbs from 'express-handlebars';
import { StatusCodes } from 'http-status-codes';
import { config } from 'node-config-ts';
import { v4 } from 'uuid';

import * as sample from '../samples/perfect.json';

const app: express.Application = express();
const port: number = 3000;
const defaultDelay: number = 2000;

/**
 * Initiate a Request Builder instance
 * This class handles OAuth2 authentication and is able to refresh tokens
 */
const algoanRequest: RequestBuilder = new RequestBuilder(
  config.algoan.baseUrl,
  {
    clientId: config.algoan.clientId,
    clientSecret: config.algoan.clientSecret,
  },
);

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
 * GET /scores
 * Upload accounts and transactions and retrieves scores
 */
app.get('/scores', async (req: express.Request, res: express.Response) => {
  try {
    /**
     * Create a new Customer
     */
    const newCustomer: any = await algoanRequest.request({
      method: 'POST',
      url: '/v2/customers',
      data: {
        customIdentifier: 'ca63b167-11d6-4793-a0c2-f22e218c8969',
        personalDetails: {
          identity: {
            firstName: 'John',
            lastName: 'Doe',
          },
          contact: {
            email: `JohnDoe@${v4()}.com`,
          },
        },
      },
    });
    console.log(`New customer created: ${JSON.stringify(newCustomer)}`);
    const customerId: string = newCustomer.id;

    /**
     * Upload account and transactions
     */
    const newAnalysis: any = await algoanRequest.request({
      method: 'POST',
      url: `/v2/customers/${customerId}/analyses`,
      data: {
        accounts: sample.accounts,
      },
    });

    /**
     * Try to get result
     */
    let isScoreDefined: boolean = false;
    let analysis: any;
    const retryCount: number = 30;
    let count: number = 0;

    do {
      await delay(defaultDelay);
      analysis = await algoanRequest.request({
        method: 'GET',
        url: `/v2/customers/${customerId}/analyses/${newAnalysis.id}`,
      });
      isScoreDefined = analysis.scores !== undefined;
      count++;
    } while (!isScoreDefined && count < retryCount);

    if (!isScoreDefined) {
      res.status(StatusCodes.NOT_FOUND).send({
        message: 'Analysis not found',
      });
    }

    res.render('index', {
      aden: JSON.stringify(analysis, null, 4),
    });
  } catch(err) {
    console.error(err);

    throw err;
  }
});

app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`);
});
