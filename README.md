# Subject ID Generator

## Requirements

* Node.JS 16 or nvm
* MongoDB 4.4
* Yarn 1.22.0

## Getting started (manual)

### Clone the repo

First, clone the project locally and move into the directory:

```bash
git clone https://github.com/PREDICT-DPACC/subject-id-gen.git
cd subject-id-gen
```

### Install dependencies

This project uses Yarn and the version of Node specified in `.nvmrc`. Use the following command to install dependencies:

```bash
yarn install
```

### Run MongoDB

A self- or remote-hosted MongoDB instance, accessible from a connection URI, is required to continue. Please create that instance, and a user that can access an empty database there, and note that database name (it will be used in the next step for `MONGODB_DB`).

### Set environment variables

This project uses environment variables stored in `.env.local` at the proejct root. This file will not be committed to version control. Please run the following command:

```bash
cp .env.local.sample .env.local
```

And then open `.env.local` and edit the values according to your setup, using the provided comments.

### Seed the database

In order to seed the database with site IDs and names, run the following command:

```bash
yarn seed
```

In your environment variables, `MONGODB_DB` must be set to the name of the empty database you created, and `MONGODB_URI` must be the connetion URI for your MongoDB instance.

The initial sites will be pulled from `sites.json` in the project root. You may add sites using the web interface once the application is launched in the following steps.

## Available scripts

To serve the app in development mode (hot-reloading) on port 4040, use the following command:

```bash
yarn dev
```

To build a production bundle of the app, use the following command:

```bash
yarn build
```

To serve the built bundle on port 4041, use the following command (`yarn build` must be run first):

```bash
yarn start
```
