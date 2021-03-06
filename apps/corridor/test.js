//test boilerplate
var tu = require('../../modules/test_utils')
//modules being tested
  , app = require('./app')(tu.starter_app_generator);

describe('corridor', function() {

describe('routes', function() {
  var app_tester = new tu.AppTester(app);
  app_tester.testGet('/', {
    navbar: true
  , banner: false
  });

  app_tester.testGet('/asdf', {
    type: 'text'
  , redirect: '/404.html'
  });
});

});