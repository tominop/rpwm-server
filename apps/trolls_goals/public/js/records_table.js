(function() {
var recordsTableModule = angular.module('records_table', []);
recordsTableModule.directive('recordsTable', function($rootScope, RecordFactory) {
  $rootScope.records = $rootScope.records || {};
  return {
    restrict: 'E',
    scope: { domainAreas: '@', firstDay: '@', lastDay: '@', records: '=',
             showHeader: '@', clickToAddRecordToFirstDay: '@', domain: '=' },
    templateUrl: 'tmpl/records_table.html',

    link: function(scope, element, attrs) {
      attrs.$observe('domainAreas', function(domain_areas) {
        if (_.isEmpty(domain_areas)) { return; }
        scope.domain_areas = JSON.parse(domain_areas);
        scope.area_ids = _.pluck(scope.domain_areas, '_id');
        // set scope.min_day to scope.firstDay or earliest area.start_day, whichever is >
        var min_start_day = _.min(scope.domain_areas, 'start_day').start_day;
        scope.min_day = scope.firstDay > min_start_day ? scope.firstDay : min_start_day;

        RecordFactory.query({ area_ids: scope.area_ids,
                              day_range: [0, $rootScope.today] },
                            function(records) {
          console.log('successfully fetched records!', records);
          var records_by_area_id = _.groupBy(records, 'area')
            , area_records;
          _.each(scope.area_ids, function(area_id) {
            area_records = records_by_area_id[area_id];
            if (_.isObject(area_records)) {
              $rootScope.records[area_id] = _.groupBy(area_records, 'day');
            }
            else {
             $rootScope.records[area_id] = {};
            }
          });
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      });

      scope.createRecord = function(area_id, day) {
        var record = { area: area_id, day: day };
        RecordFactory.save(record, function(r) {
          console.log('successfully added record!', r);
          r.just_created = true;
          var records = $rootScope.records[record.area][day] || [];
          records.push(r);
          $rootScope.records[record.area][day] = records;
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      };

      scope.saveRecord = function(record) {
        RecordFactory.update({ id: record._id }, record, function(r) {
          console.log('successfully edited record!', r);
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      };

      scope.deleteRecord = function(record) {
        record.$delete({ id: record._id }, function(success) {
          console.log('successfully deleted record!', record);
          $rootScope.records[record.area][record.day] = _.reject($rootScope.records[record.area][record.day], function(_record) {
            return _record._id === record._id;
          });
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      };

      scope.revertRecord = function(record) {
        RecordFactory.get({ id: record._id }, function(r) {
          _.each(r, function(val, key) {
            record[key] = val;
          });
          console.log('successfully reverted record!', record);
        }, function(response) {
          console.error(response.data.error);
          scope.domain_error = response.data.error;
        });
      };

      scope.getNumRecords = function(domain_areas, day) {
        var area_ids = _.pluck(domain_areas, '_id')
          , num_records = 0
          , area_records;
        _.each(scope.records, function(records_by_day, area_id) {
          if (! _.contains(area_ids, area_id)) { return; }
          area_records = records_by_day[day];
          if (_.isArray(area_records)) {
            num_records += area_records.length;
          }
        });
        return num_records;
      };

      scope.record_methods = {
        saveRecord: scope.saveRecord
      , deleteRecord: scope.deleteRecord
      , revertRecord: scope.revertRecord
      };
    }
  }
});

recordsTableModule.directive('triggerClickOnLoad', function($timeout) {
  return function link(scope, element, attrs) {
    if (scope.record.just_created && scope.area.prompt_for_details) {
      $timeout(function() {
        element.triggerHandler('click');
      });
    }
  };
});

recordsTableModule.directive('focusOnLoad', function($timeout) {
  return function link(scope, element, attrs) {
    $timeout(function() {
      element[0].focus();
    });
  };
});

recordsTableModule.directive('ngCtrlEnter', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13 && event.ctrlKey) {
        scope.$apply(function () {
            scope.$eval(attrs.ngCtrlEnter);
        });

        event.preventDefault();
      }
    });
  };
});

recordsTableModule.directive('ngCtrlDelete', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 46 && event.ctrlKey) {
        scope.$apply(function () {
            scope.$eval(attrs.ngCtrlDelete);
        });

        event.preventDefault();
      }
    });
  };
});

recordsTableModule.directive('ngEscape', function () {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 27) {
        scope.$apply(function () {
            scope.$eval(attrs.ngEscape);
        });

        event.preventDefault();
      }
    });
  };
});

})();