<p align="center">
  <a href="https://www.algoan.com/" target="blank"><img src="./assets/score.png" width="300" alt="Algoan Score Logo" /></a>
</p>

# Algoan Score Integration with a Budget Insight connector

A simple [express.js](https://expressjs.com) server testing Algoan's score integration.

This repository is an example of the integration of a score with a connector. It implements the flow described in the [public documentation](https://developers.algoan.com/public/docs/quick_start/score_integration/with_a_connector.html).

## Features

- Exposes a simple `index.html` file rendered by [express-handlebars](https://github.com/express-handlebars/express-handlebars)
- Exposes 3 APIs:
  - `GET /redirect`: implements the [first step of the aggregation process](https://developers.algoan.com/public/docs/quick_start/score_integration/with_a_connector.html#1-redirect-the-user). Creates a Banks Users and triggers the redirection.
  - `GET /callback`: Called at the end of the aggregation process by BI. Updates the Banks User status to trigger accounts and transactions retrieval.
  - `GET /aden`: Gets and displays the score result.

## Requirements

This application uses [Node.js](https://nodejs.org/en/) underneath. You need to install it if you haven't done it yet.

You also need to have a [Budget Insight connector](https://github.com/algoan/nestjs-budget-insight-connector) in order to launch the aggregation process. If you want to use it locally, follow [installation instructions](https://github.com/algoan/nestjs-budget-insight-connector#installation). You will also need a [local tunnel](https://localtunnel.github.io/www/) connection. Therefore, Algoan could call your local connector.

## Installation

Install all dependencies running:

```bash
npm install
```

## Usage

Once your local connector is launched and your REST hooks are created, you can now start the application:

```bash
npm start
```

Then, go to your favorite browser and navigate to [http://localhost:3000]. It will display a web page with two buttons.

- Click on the "Redirect" button to start the aggregation process. If everything works fine, it will redirect you to your Budget Insight sandbox.
- Connect your bank. Once it's done, you will come back to the original web page.
- Click on the second button to get the score result.

## TODO

- Add an in-memory DB in order to save the Banks User ID. If you restart the server between the aggregation process, it is lost and you have to restart to the beginning
