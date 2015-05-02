// Path : ./config/migrations.js
var mongodb_uri_heroku = 'mongodb://heroku_app36407401:cl49hr334r57gub9drlavrvl72@ds031792.mongolab.com:31792/heroku_app36407401';
var mongodb_uri_local = 'mongodb://localhost/momdb_mig1';

module.exports = {
  development: {
    schema: { 'migration': {} },
    modelName: 'Migration',
    db: mongodb_uri_local //process.env.MONGOHQ_URL || 'mongodb://localhost/app_development'
  },
  test: { ... },
  production: { ... }
}