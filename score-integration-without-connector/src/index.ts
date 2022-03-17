import { RequestBuilder } from '@algoan/rest';
import axios from 'axios';
import * as delay from 'delay';
import * as express from 'express';
import * as exphbs from 'express-handlebars';
import { StatusCodes } from 'http-status-codes';
import { config } from 'node-config-ts';
import { v4 } from 'uuid';

const app: express.Application = express();
const port: number = 3000;
const defaultDelay: number = 2000;
let loadedSample: any;
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
  const startingAt: Date = new Date();

  try {
    /**
     * Create a new Customer
     */
    const newCustomer: any = await algoanRequest.request({
      method: 'POST',
      url: '/v2/customers',
      data: {
        customIdentifier: v4(),
        personalDetails: {
          identity: {
            firstName: 'John',
            lastName: 'Doe',
          },
          contact: {
            email: `john-doe@${v4()}.com`,
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
        accounts: loadedSample.accounts,
      },
    });
    console.log(`New analysis created: ${JSON.stringify(newAnalysis)}`);

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
      console.log(`Get a analysis with count ${count} after ${Date.now() - startingAt.valueOf()} ms: ${JSON.stringify(analysis)}`);
      isScoreDefined = analysis.status === 'COMPLETED' || analysis.status === 'ERROR';
      count++;
    } while (!isScoreDefined && count < retryCount);

    if (!isScoreDefined) {
      res.status(StatusCodes.NOT_FOUND).send({
        message: 'Analysis not found',
      });
    }

    res.render('index', {
      analysis: JSON.stringify(analysis, null, 4),
    });
  } catch(err) {
    console.error(err);

    throw err;
  }
});

app.listen(port, async () => {
  loadedSample = await axios.get(config.sampleUrl);
  loadedSample = loadedSample.data;
  console.log(`App listening on port http://localhost:${port}`);
});
