(function() {
var app = angular.module('app', ['ng', 'ngRoute', 'ngResource',
  'trollsGoalsFilters', 'trollsGoalsDirectives', 'areas', 'domains', 'records',
  'recordsTable', 'crudTooltip', 'ui.select']);

app.config(function($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      redirectTo: '/day'
    })
    .when('/day/:day?', {
      templateUrl: 'tmpl/day.html',
      controller: 'DayCtrl'
    })
    .when('/week/:last_day?', {
      templateUrl: 'tmpl/week.html',
      controller: 'WeekCtrl'
    })
    /*.when('/domains/:name?', {
      templateUrl: 'tmpl/domain.html',
      controller: 'DomainCtrl'
    })
    .when('/manage_areas', {
      templateUrl: 'tmpl/manage_areas.html',
      controller: 'ManageAreasCtrl'
    })
    .when('/manage_domains', {
      templateUrl: 'tmpl/manage_domains.html',
      controller: 'ManageDomainsCtrl'
    })*/
    .otherwise({ redirectTo: '/' });

  // intercept 401 Unauthorized requests and redirect,
  // as shown at http://bneijt.nl/blog/post/angularjs-intercept-api-error-responses/
  $httpProvider.interceptors.push(function ($q) {
    return {
      response: function(response) {
        // HTTP Response code <= 300
        return response;
      },
      responseError: function(rejection) {
        if (rejection.status === 401) {
          location.reload();
        }
        return $q.reject(rejection);
      }
    };
  });
});

app.run(function($rootScope, $location, DomainFactory, AreaFactory) {
  DomainFactory.list();
  AreaFactory.list();
  var now = new Date();
  now = now.getTime() - now.getTimezoneOffset() * 60000;
  $rootScope.today = Math.floor(now / 86400000) + 1;
});
})();