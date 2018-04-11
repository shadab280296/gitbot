const Promise = require('bluebird');
const request = require('superagent');

module.exports.categories = () => new Promise((resolve, reject) => {
  request
    .get('http://ai.dev.taskhuman.com/categories')
    .set('Content-Type', 'application/json')
    .end((apiErr, apiRes) => {
      if (apiErr) return reject(apiErr);
      return resolve(apiRes);
    });
});

module.exports.prediction = term => new Promise((resolve, reject) => {
  request
    .post('http://ai.dev.taskhuman.com/predict')
    .send({
      query: term
    })
    .set('Content-Type', 'application/json')
    .end((apiErr, apiRes) => {
      if (apiErr) return reject(apiErr);
      return resolve(apiRes);
    });
});

module.exports.suggestions = term => new Promise((resolve, reject) => {
  request
    .post('http://ai.dev.taskhuman.com/neighbours')
    .send({
      query: term
    })
    .set('Content-Type', 'application/json')
    .end((apiErr, apiRes) => {
      if (apiErr) return reject(apiErr);
      return resolve(apiRes);
    });
});
