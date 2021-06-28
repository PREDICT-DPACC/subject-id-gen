# Subject ID Generator

   * [Requirements](#requirements)
   * [Getting started](#getting-started)
      * [Clone the repo](#clone-the-repo)
      * [Install dependencies](#install-dependencies)
      * [Run MongoDB](#run-mongodb)
      * [Set environment variables](#set-environment-variables)
      * [Set up next.config.js](#set-up-nextconfigjs)
      * [Seed the database](#seed-the-database)
   * [Available scripts](#available-scripts)
   * [Nginx configuration](#nginx-configuration)


## Requirements

* Node.JS 16 or nvm
* MongoDB 4.4
* Yarn 1.22.0

## Getting started

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

### Set up `next.config.js`

This project also uses some Next.js app-level configurations stored at `next.config.js`, which will not be committed to version control. Please run the following command:

```bash
cp next.config.js.sample next.config.js
```

And then open `next.config.js` and edit the values according to your setup, using the provided comments.

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


## Nginx configuration

So far we have described how to serve this app from a root URL e.g. http://localhost:4040.
To serve this app from a non root URL e.g. http://localhost/idgen, the following `location` block is
necessary in `/etc/nginx.conf`:

```cfg
server {
    listen       80;
    server_name  rc-predict-dev.partners.org;

    location /idgen {
        proxy_pass http://127.0.0.1:4040/idgen;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
}
```

In addition, `.env.local` must have:

```cfg
BASE_URL=http://rc-predict-dev.partners.org/idgen

NEXT_PUBLIC_BASE_PATH=/idgen
```

Upon using this configuration, the admin will get emails with properly generated site access
granting links when users request access to various sites. Those links will look like http://rc-predict-dev.partners.org/idgen/sites/LA.

