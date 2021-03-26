<p align="center">
  <a href="https://www.algoan.com/" target="blank"><img src="./assets/score.png" width="300" alt="Algoan Score Logo" /></a>
</p>

# Algoan Score and Credit Insights Integration without a connector

A simple [express.js](https://expressjs.com) server testing Algoan's Score and Credit Insights integration.

This repository is an example of the integration of a score without a connector. It implements the flow described in the [public documentation](https://algoan.github.io/openapi-v2/#section/Integration).

## Features

- Exposes a simple `index.html` file rendered by [express-handlebars](https://github.com/express-handlebars/express-handlebars)
- Exposes 1 API:
  - `GET /scores`: implements the [sequence diagram](https://algoan.github.io/openapi-v2/#section/Integration/Without-a-connector) describes in our draft documentation.


## Requirements

This application uses [Node.js](https://nodejs.org/en/) underneath. You need to install it if you haven't done it yet.

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

- Click on the "Launch score" to begin with the process
  