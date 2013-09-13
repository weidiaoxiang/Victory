// Generated by CoffeeScript 1.6.3
(function() {
  var s,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  s = angular.module('victory.service', ['ngProgress']);

  s.service('$victory', function($http, $rootScope, $timeout, ngProgress) {
    var application, common, document, pageSize, setting, stupidBrowser, user_agent;
    if (sessionStorage.selectedApplication) {
      $rootScope.selectedApplication = JSON.parse(sessionStorage.selectedApplication);
    }
    $rootScope.user = victory.user;
    pageSize = 20;
    user_agent = navigator.userAgent.toLowerCase();
    stupidBrowser = user_agent.indexOf('msie') !== -1;
    common = {
      ajax: function(args) {
        var h,
          _this = this;
        if (args == null) {
          args = {};
        }
        /*
        victory ajax function
        :param args: {method, cache, data, error(), success(), beforSend(), hideLoadingAfterDown}
        */

        if (args.method == null) {
          args.method = 'get';
        }
        if (args.cache == null) {
          args.cache = false;
        }
        if (args.data == null) {
          args.data = '';
        }
        if (args.error == null) {
          args.error = function() {};
        }
        if (args.success == null) {
          args.success = function() {};
        }
        if (args.beforeSend) {
          args.beforeSend();
        }
        h = $http({
          url: args.url,
          method: args.method,
          cache: args.ache,
          data: args.data
        });
        h.error(function(data, status, headers, config) {
          _this.message.error(status);
          return args.error(data, status, headers, config);
        });
        return h.success(function(data, status, headers, config) {
          if (data.__status__ === 302 && data.location) {
            location.href = data.location;
            return;
          }
          return args.success(data, status, headers, config);
        });
      },
      message: {
        error: function(status) {
          /*
          pop error message.
          */

          switch (status) {
            case 400:
              return $.av.pop({
                title: 'Input Failed',
                message: 'Please check input values.',
                template: 'error'
              });
            case 403:
              return $.av.pop({
                title: 'Permission denied',
                message: 'Please check your permission.',
                template: 'error'
              });
            default:
              return $.av.pop({
                title: 'Error',
                message: 'Loading failed, please try again later.',
                template: 'error'
              });
          }
        }
      },
      loading: {
        /*
        Show/Hide loading effect.
        */

        on: function() {
          return $timeout(function() {
            ngProgress.reset();
            ngProgress.start();
            return $timeout(function() {
              return ngProgress.complete();
            }, 10000);
          }, 0);
        },
        off: function() {
          return $timeout(function() {
            return ngProgress.complete();
          }, 0);
        }
      }
    };
    setting = {
      getApplications: function(args) {
        var ajax;
        if (args == null) {
          args = {};
        }
        /*
        Get applications of the settings.
        :param args: {success()}
        */

        ajax = common.ajax({
          url: '/settings/applications',
          success: args.success
        });
        return ajax.then(function(data) {
          return data.data.items;
        });
      },
      addApplication: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Add the application.
        :param args: {data:{name, description}, error(), success()}
        */

        return common.ajax({
          method: 'post',
          url: '/settings/applications',
          data: args.data,
          error: args.error,
          success: args.success
        });
      },
      updateApplication: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Update the application.
        :param args: {id, data:{name, description}, error(), success()}
        */

        return common.ajax({
          method: 'put',
          url: "/settings/applications/" + args.id,
          data: args.data,
          error: args.error,
          success: args.success
        });
      },
      deleteApplication: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Delete the application by id.
        :param args: {id, success()}
        */

        return common.ajax({
          method: 'delete',
          url: "/settings/applications/" + args.id,
          success: args.success
        });
      },
      inviteUser: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Invite the user into the application.
        :param args: {applicationId, email, success()}
        */

        return common.ajax({
          method: 'post',
          url: "/settings/applications/" + args.applicationId + "/members",
          data: {
            email: args.email
          },
          success: args.success
        });
      },
      deleteMember: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Delete the member from the application.
        :param args: {applicationId, memberId, success()}
        */

        return common.ajax({
          method: 'delete',
          url: "/settings/applications/" + args.applicationId + "/members/" + args.memberId,
          success: args.success
        });
      },
      getUsers: function(args) {
        var ajax;
        if (args == null) {
          args = {};
        }
        /*
        Get users of the settings.
        :param args: {success()}
        */

        ajax = common.ajax({
          url: '/settings/users',
          success: args.success
        });
        return ajax.then(function(data) {
          return data.data.items;
        });
      },
      addUser: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Add an user.
        :param args: {email, success()}
        */

        return common.ajax({
          method: 'post',
          url: '/settings/users',
          data: {
            email: args.email
          },
          success: args.success
        });
      },
      deleteUser: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Delete the user by id.
        :param args: {id, success()}
        */

        return common.ajax({
          method: 'delete',
          url: "/settings/users/" + args.id,
          success: args.success
        });
      },
      getProfile: function(args) {
        var ajax;
        if (args == null) {
          args = {};
        }
        /*
        Get the profile.
        :param args: {success()}
        */

        ajax = common.ajax({
          url: '/settings/profile',
          success: args.success
        });
        return ajax.then(function(data) {
          return data.data;
        });
      },
      updateProfile: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Update the profile.
        :param args: {name, error(), success()}
        */

        return common.ajax({
          method: 'put',
          url: '/settings/profile',
          data: {
            name: args.name
          },
          error: args.error,
          success: args.success
        });
      }
    };
    application = {
      getApplications: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Get applications.
        :param args: {success()}
        */

        return common.ajax({
          url: "/applications",
          success: args.success
        });
      }
    };
    document = {
      getGroupedDocumentsAndApplications: function(args) {
        var ajaxApplications, result,
          _this = this;
        if (args == null) {
          args = {};
        }
        /*
        Get grouped documents and applications for GroupedDocumentsCtrl.
        :param args: {documentMode, applicationId, keyword, index}
        :return: {applications, groupedDocuments, page}
        */

        args.applicationId = parseInt(args.applicationId);
        if (args.keyword == null) {
          args.keyword = '';
        }
        if (args.index == null) {
          args.index = 0;
        }
        result = {
          applications: null,
          groupedDocuments: null,
          page: {
            index: 0
          }
        };
        ajaxApplications = common.ajax({
          url: '/applications'
        });
        return ajaxApplications.then(function(data) {
          var ajaxDocuments, x, _ref, _ref1;
          result.applications = data.data.items;
          if (result.applications.length > 0) {
            if (_ref = args.applicationId, __indexOf.call((function() {
              var _i, _len, _ref1, _results;
              _ref1 = result.applications;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                x = _ref1[_i];
                _results.push(x.id);
              }
              return _results;
            })(), _ref) >= 0) {
              $rootScope.selectedApplication = ((function() {
                var _i, _len, _ref1, _results;
                _ref1 = result.applications;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  x = _ref1[_i];
                  if (x.id === args.applicationId) {
                    _results.push(x);
                  }
                }
                return _results;
              })())[0];
              sessionStorage.selectedApplication = JSON.stringify($rootScope.selectedApplication);
            } else if (!$rootScope.selectedApplication || (_ref1 = $rootScope.selectedApplication.id, __indexOf.call((function() {
              var _i, _len, _ref2, _results;
              _ref2 = result.applications;
              _results = [];
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                x = _ref2[_i];
                _results.push(x.id);
              }
              return _results;
            })(), _ref1) < 0)) {
              $rootScope.selectedApplication = result.applications[0];
              sessionStorage.selectedApplication = JSON.stringify($rootScope.selectedApplication);
            }
            ajaxDocuments = _this.getGroupedDocuments({
              applicationId: $rootScope.selectedApplication.id,
              documentMode: args.documentMode,
              keyword: args.keyword,
              index: args.index
            });
            return ajaxDocuments.then(function(data) {
              result.groupedDocuments = data.data.items;
              result.page = {
                total: data.data.total,
                index: args.index,
                max: (data.data.total - 1) / pageSize,
                hasPrevious: args.index > 0,
                hasNext: (args.index * 1 + 1) * pageSize < data.data.total
              };
              return result;
            });
          } else {
            return result;
          }
        });
      },
      getGroupedDocuments: function(args) {
        if (args == null) {
          args = {};
        }
        /*
        Get grouped documents
        :param args: {applicationId, documentMode, keyword, index success()}
        */

        if (args.keyword == null) {
          args.keyword = '';
        }
        if (args.index == null) {
          args.index = 0;
        }
        return common.ajax({
          url: "/applications/" + $rootScope.selectedApplication.id + "/" + args.documentMode + "/grouped?q=" + args.keyword + "&index=" + args.index,
          success: args.success
        });
      },
      getDocuments: function(args) {
        var ajax;
        if (args == null) {
          args = {};
        }
        /*
        Get documents by the grouped tag.
        :param args: {applicationId, documentMode, groupTag, success()}
        */

        ajax = common.ajax({
          url: "/applications/" + args.applicationId + "/" + args.documentMode + "/" + args.groupTag,
          success: args.success
        });
        return ajax.then(function(data) {
          return data.data.items;
        });
      },
      getCrashDocument: function(args) {
        var ajax;
        if (args == null) {
          args = {};
        }
        /*
        Get the crash document by the grouped tag.
        :param args: {applicationId, groupTag, success()}
        */

        ajax = common.ajax({
          url: "/applications/" + args.applicationId + "/crashes/" + args.groupTag,
          success: args.success
        });
        return ajax.then(function(data) {
          var crash, thread, x, _i, _j, _len, _len1, _ref, _ref1;
          crash = data.data.crash;
          try {
            _ref = crash.report.crash.threads;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              thread = _ref[_i];
              if (thread.backtrace) {
                _ref1 = thread.backtrace.contents;
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  x = _ref1[_j];
                  x.instruction_addr_hex = '0x' + ('00000000' + x.instruction_addr.toString(16)).slice(-8);
                }
              }
            }
          } catch (_error) {}
          try {
            crash.crashedThreads = (function() {
              var _k, _len2, _ref2, _results;
              _ref2 = crash.report.crash.threads;
              _results = [];
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                x = _ref2[_k];
                if (x.crashed) {
                  _results.push(x);
                }
              }
              return _results;
            })();
          } catch (_error) {}
          try {
            crash.threads = (function() {
              var _k, _len2, _ref2, _results;
              _ref2 = crash.report.crash.threads;
              _results = [];
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                x = _ref2[_k];
                if (!x.crashed) {
                  _results.push(x);
                }
              }
              return _results;
            })();
          } catch (_error) {}
          return crash;
        });
      }
    };
    return {
      stupidBrowser: stupidBrowser,
      common: common,
      setting: setting,
      application: application,
      document: document
    };
  });

}).call(this);
