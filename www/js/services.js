angular.module('services', [])
  .factory('AuthenticationService', function($http) {
    return {
      getKey: function(userId, deviceId) {
        return $http.get('url', {
          params: {
            userId: userId,
            deviceId: deviceId
          }
        });
      },
      initiateLogin: function(userId, deviceId, token) {
        return $http.post('url', {
          params: {
            userId: userId,
            deviceId: deviceId,
            token: token
          }
        });
      },
      authenticateUser: function(userId, deviceId, token) {
      return $http.post('url', {
        params: {
          userId: userId,
          deviceId: deviceId,
          token: token
        }
      });
    }
    }
  })
  .factory('CallLogService', ['$q', function($q) {
    return {

      list : function(days) {
        var q = $q.defer();
        // days is how many days back to go
        window.plugins.calllog.list(days, function (response) {
          q.resolve(response.rows);
        }, function (error) {
          q.reject(error)
        });
        return q.promise;
      },

      contact : function(phoneNumber) {
        var q = $q.defer();
        window.plugins.calllog.contact(phoneNumber, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error)
        });
        return q.promise;
      },

      show : function(phoneNumber) {
        var q = $q.defer();
        window.plugins.calllog.show(phoneNumber, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error)
        });
        return q.promise;
      },

      delete : function(phoneNumber) {
        var q = $q.defer();
        window.plugins.calllog.delete(id, function (response) {
          q.resolve(response);
        }, function (error) {
          q.reject(error)
        });
        return q.promise;
      }
    }
  }]);
