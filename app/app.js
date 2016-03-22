// Deps
const chalk   = require('chalk');
const cors    = require('koa-cors');
const koa     = require('koa');
const logger  = require('koa-logger');
const Router  = require('koa-router');
const bouncer = require('koa-bouncer');
const unless  = require('koa-unless');

// Instantiate app
const app = module.exports = koa();
const appPort = process.argv[2] || 3000;
app.poweredBy = false;

// Because I can't be bothered to proxy from start
app.use(cors({
  origin: '*'
}));

// Configure router
const router = new Router({
  prefix: '/api/v1'
});

// Configure DBs
app.context.db = require('./db.js');

// Configure Router
app
  .use(router.routes())
  .use(router.allowedMethods());

// Logging
app.use(logger());
router.use(logger());

// Other middleware
router.use(bouncer.middleware());

// Error handling
router.use(function* (next) {
  try {
    yield* next;
  } catch (err) {
    this.response.status = this.status || 500;
    this.response.body = err;
    console.error(chalk.red.bold('--- ' + err));
  }
})

// Generic message for initial Curl
app.use(function* (next) {
  this.body = {
    message: 'Welcome to the Application.'
  }
});

// Turn on the server
if (!module.parent) app.listen(appPort);
console.log(chalk.green.bold('--- Listening at port', appPort));
