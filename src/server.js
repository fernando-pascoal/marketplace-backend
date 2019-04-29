require('dotenv').config()

const routes = require("./routes");
const express = require("express");
const mongoose = require("mongoose");
const validate = require('express-validation')
const Youch = require('youch')
const Sentry = require('@sentry/node')

const databaseConfig = require("./config/database");
const sentryConfig = require("./config/sentry")

class App {
  constructor() {
    this.express = express();
    this.idDev = process.env.NODE_ENV !== "production";

    this.sentry();
    this.middlewares();
    this.database();
    this.routes();
    this.exception();
  }
  sentry(){
    Sentry.init({ dsn: sentryConfig.dsn })
  }

  database() {
    mongoose.connect(databaseConfig.uri, {
      useCreateIndex: true,
      useNewUrlParser: true
    });
  }

  middlewares() {
    this.express.use(Sentry.Handlers.requestHandler());
    this.express.use(express.json());
  }
  routes() {
    this.express.use(routes);
  }

  exception(){
    if(process.env.NODE_ENV === 'production'){
      this.express.use(Sentry.Handlers.errorHandler())
    }

    this.express.use(async (err, req, res, next) => {
      if(err instanceof validate.ValidationError){
        return res.status(err.status).json(err)
      }

      if(process.env.NODE_ENV != 'production'){
        const youch = new Youch(err, req)
        return res.send(await youch.toJSON())
      }

      return res.status(err.status || 500).json({error: 'Internal server error'})
    })
  }
}

module.exports = new App().express;
