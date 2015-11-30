angular.module('controllers', ['services', 'ngCordova'])

  .controller('LoginCtrl', function ($window, $rootScope, $scope, $http, $q, CallLogService, $ionicPlatform, $cordovaDevice, $ionicPopup, $cordovaCalendar, AuthenticationService) {
    $scope.showLogin = true;
    $scope.user = {name: ""};
    $scope.authenticationResult = "Success";
    $scope.authenticationMessage = "You have been successfully authenticated";
    $scope.appList = [];
    $scope.contacts = [];
    $scope.questions = [];
    $scope.calendars = [];
    $scope.attempts = 3;
    $scope.questionsAnswered = false;

    $scope.regSecQ = {
      questionId: null,
      answer: null,
      nextQuestionId: null,
      nextAnswer: null,
      questions: [
        {id: 1, name: 'What is the last name of the teacher who gave you your first failing grade?'},
        {id: 2, name: 'What is the name of the place your wedding reception was held?'},
        {id: 3, name: 'What was your childhood nickname?'},
        {id: 4, name: 'In what town was your first job?'},
        {id: 5, name: 'What was the last name of your third grade teacher?'}
      ],
    };

    $scope.dbQuestions = [
      {
        id: 1,
        question: 'What is the contact name of the last incoming call?',
        answer: null,
        type: "CONTACT_HISTORY"
      },
      {
        id: 2,
        question: 'Name 5 top apps you use that is not Facebook, Chrome, Gmail?',
        answer: null,
        type: "APP_HISTORY"
      },
      {
        id: 3,
        question: 'What percentage is your battery level?',
        answer: null,
        type: "BATTERY_INFO"
      },
      {
        id: 4,
        question: 'Name three individuals in your contact list?',
        answer: null,
        type: "CONTACT_LIST"
      },
      {
        id: 5,
        question: 'Name the title of one of your calendars.',
        answer: null,
        type: "CALENDAR"
      }];

    $scope.showAlert = function () {
      var alertPopup = $ionicPopup.alert({
        title: $scope.authenticationResult,
        template: $scope.authenticationMessage
      });
      alertPopup.then(function (res) {
        if (res) {
          if($scope.authenticationResult === 'Success') {
            for (var q = 0; q < $scope.dbQuestions.length; q++) {
              $scope.dbQuestions[q]['answer'] = null;
            }
            $scope.questions = [];
            $scope.showLogin = true;
            $scope.user = {name: ''};
            $scope.attempts = 3;
          } else {
            if(!$scope.questionsAnswered) {
              if($scope.attempts == 0) {
                for (var q = 0; q < $scope.dbQuestions.length; q++) {
                  $scope.dbQuestions[q]['answer'] = null;
                }
                $scope.questions = [];
                $scope.showLogin = true;
                $scope.user = {name: ''};
                $scope.attempts = 3;
              } else {
                $scope.attempts -= 1;
              }
            } else {
              for (var q = 0; q < $scope.dbQuestions.length; q++) {
                $scope.dbQuestions[q]['answer'] = null;
              }
              $scope.questions = [];
              $scope.showLogin = true;
              $scope.user = {name: ''};
              $scope.attempts = 3;
              $scope.questionsAnswered = false;
              $scope.regSecQ.questionId = null;
              $scope.regSecQ.answer = null;
              $scope.regSecQ.nextQuestionId = null;
              $scope.regSecQ.nextAnswer = null;
            }

          }

        }
      });
    };

    $scope.getAccountInformation = function () {
      if(!$rootScope.key) {
        AuthenticationService.getKey($scope.user.name, $scope.deviceId).then(function (key) {

          $scope.showLogin = false;
          $rootScope.key = key.data['result'];
        });
      } else {
        $scope.showLogin = false;
      }
      //will return me secret key and random questions
      //call to Shreya's backend


      var indexes = [0, 1, 2, 3, 4];
      var randomNum = Math.floor(Math.random() * indexes.length);
      $scope.questions.push($scope.dbQuestions[indexes[randomNum]]);
      indexes.splice(randomNum, 1);

      var randomNum2 = Math.floor(Math.random() * indexes.length);
      $scope.questions.push($scope.dbQuestions[indexes[randomNum2]]);
      indexes.splice(randomNum2, 1);
    };

    $scope.authenticateContext = function () {
      var isValid = true;
      var missingQuestions = false;
      for (var i = 0; i < $scope.questions.length; i++) {
        if(!angular.isDefined($scope.questions[i]['answer']) || $scope.questions[i]['answer'] == null) {
          missingQuestions = true;
          break;
        }
        switch ($scope.questions[i]['type']) {
          case 'CONTACT_HISTORY':
            if (angular.isDefined($scope.callHistory) && $scope.callHistory !== null) {
              for (var j = 0; j < $scope.callHistory.length; j++) {
                if ($scope.callTypeDisplay($scope.callHistory[j]['type']) === 'Incoming') {
                  if ($scope.questions[i]['answer'].toUpperCase().trim() !== $scope.callHistory[j]['cachedName'].toUpperCase()) {
                    isValid = false;
                    break;
                  } else {
                    break;
                  }
                }
              }
            }
            break;
          case 'APP_HISTORY':
            var apps = $scope.questions[i]['answer'].split(',');
            for (var k = 0; k < apps.length; k++) {
              if ($scope.appList.indexOf(apps[k].trim()) < 0) {
                isValid = false;
                break;
              }
            }
            break;
          case 'CONTACT_LIST':
            var contacts = $scope.questions[i]['answer'].split(',');
            for (var l = 0; l < contacts.length; l++) {
              if ($scope.contacts.indexOf(contacts[l].trim()) < 0) {
                isValid = false;
                break;
              }
              /*$scope.findContactsBySearchTerm(contacts[i].trim()).then(function(contact) {
               if(contact.displayName.toUpperCase() !== $scope.questions[i]['answer'].toUpperCase())
               isValid = false;
               });*/
            }

            break;
          case 'BATTERY_INFO':
            //strip percents and strings
            var level = parseInt($scope.batteryInfo.level);
            var answer = parseInt($scope.questions[i]['answer']);
            if (answer > level + 5 || answer < level - 5)
              isValid = false;
            break;
          case 'CALENDAR':
            isValid = false;
            for (var l = 0; l < $scope.calendars.length; l++) {
              if ($scope.questions[i]['answer'].toUpperCase() == $scope.calendars[l]['name'].toUpperCase()) {
                isValid = true;
                break;
              }
            }

            break;
          default:
            break;
        }
        if (!isValid)
          break;
      }
      if(missingQuestions) {
        $ionicPopup.alert({
          title: 'Missing Questions',
          template: 'Please answer all of the security questions'
        });
      } else {
        if (!isValid) {
          if($scope.attempts == 0) {
            $scope.authenticationResult = "Failure";
            $scope.authenticationMessage = "You failed to authenticate!";
          } else {
            $scope.authenticationResult = "Failure";
            $scope.authenticationMessage = "You have " + $scope.attempts + " tries left.";
          }

          $scope.showAlert();

        } else {
          $scope.questionsAnswered = true;
        }

      }
    };

    $scope.authenticateRegular = function() {
      if($scope.questionsAnswered) {
        var id = $window.localStorage.getItem("q_no");
        var answer = $window.localStorage.getItem("answer");
        if($scope.regSecQ.questionId === id && $scope.regSecQ.answer === answer) {
          AuthenticationService.login($scope.user.name, $scope.deviceId, $rootScope.key).then(function(success) {
            if(success.data['msg'] === 'Login Success.') {
              $scope.authenticationResult = "Success";
              $scope.authenticationMessage = "You have been successfully authenticated";
            } else {
              $scope.authenticationResult = "Failure";
              $scope.authenticationMessage = "Key does not match";
            }

            $scope.showAlert();

          }, function(err) {
            $scope.authenticationResult = "Failure";
            $scope.authenticationMessage = "You failed to authenticate!";
            $scope.showAlert();
          });
          $window.localStorage.setItem("q_no", $scope.regSecQ.nextQuestionId);
          $window.localStorage.setItem("answer", $scope.regSecQ.nextAnswer);
          $scope.regSecQ.questionId = null;
          $scope.regSecQ.answer = null;
          $scope.regSecQ.nextQuestionId = null;
          $scope.regSecQ.nextAnswer = null;
          $scope.questionsAnswered = false;
        } else {
            $scope.authenticationResult = "Failure";
            $scope.authenticationMessage = "You failed to authenticate!";

            $scope.showAlert();
        }

      }
    }


    $scope.callTypeDisplay = function (type) {
      switch (type) {
        case 1:
          return 'Incoming';
        case 2:
          return 'Outgoing';
        case 3:
          return 'Missed';
        default:
          return 'Unknown';
      }
    };


    if (window.cordova) {
      $ionicPlatform.ready(function () {
        $scope.findContactsBySearchTerm('');
        /*var today = new Date(Date.now());
         $cordovaCalendar.listEventsInRange(
         new Date(today.getDate() - 5),
         today
         ).then(function (result) {
         console.log(result);
         console.log("No Events");
         }, function (err) {
         console.log(err);
         console.log("error");
         });*/

        $cordovaCalendar.listCalendars().then(function (result) {
          $scope.calendars = result;
        }, function (err) {
          // error
        });


        installedApps.getNames(function (object) {
          for (var i = 0; i < object.length; i++) {
            $scope.appList.push(object[i].name);
          }

        }, function (err) {
          console.log("Error calling Installed Apps Plugin");
        });


        $scope.deviceId = $cordovaDevice.getUUID();

        window.addEventListener("batterystatus", function onBatteryStatus(info) {
          $scope.batteryInfo = {level: info.level, isPlugged: info.isPlugged};
        }, false);

        CallLogService.list(2).then(function (history) {
          $scope.callHistory = history;
          /*[Object, Object, Object]
           * Object
           cachedName: "Mom"
           cachedNumberLabel: 0
           cachedNumberType: 2
           date: 1446498002109
           duration: 142
           new: 1
           number: "9087529619"
           type: 2*/
        })

        setInterval(function () {
          if($scope.user.name) {
            AuthenticationService.getKey($scope.user.name, $scope.deviceId).then(function(key) {
              $rootScope.key = key.data['key'];
            })
          }

        }, 60000);
      });
    }

    $scope.findContactsBySearchTerm = function (searchTerm) {
      //var deferred = $q.defer();
      var fields = ['displayName', 'name', 'phoneNumber'];
      var opts = {                                           //search options
        filter: searchTerm,                                 // 'Bob'
        multiple: true,                                      // Yes, return any contact that matches criteria
        // These are the fields to search for 'bob'.
        desiredFields: ['displayName', 'name', 'phoneNumbers']    //return fields.
      };

      if (navigator && navigator.contacts) {
        navigator.contacts.find(fields, function (contactsFound) {

          for (var i = 0; i < contactsFound.length; i++) {
            $scope.contacts.push((contactsFound[i].displayName));
          }

        }, function (err) {
          console.log(err);

        }, opts);
      }

    };

  });
