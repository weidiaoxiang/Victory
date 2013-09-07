// Generated by CoffeeScript 1.6.3
(function() {
  var s,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  s = angular.module('victory.service', []);

  s.factory('$victory', function($http, $rootScope) {
    var common, document, pageSize, setting, stupidBrowser, user_agent;
    if (sessionStorage.selectedApplication) {
      $rootScope.selectedApplication = JSON.parse(sessionStorage.selectedApplication);
    }
    user_agent = navigator.userAgent.toLowerCase();
    stupidBrowser = user_agent.indexOf('msie') !== -1;
    pageSize = 20;
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
        if (args.hideLoadingAfterDone == null) {
          args.hideLoadingAfterDone = true;
        }
        this.loading.on('Loading...');
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
          if (args.hideLoadingAfterDone) {
            _this.loading.off();
          }
          _this.message.error(status);
          return args.error(data, status, headers, config);
        });
        return h.success(function(data, status, headers, config) {
          if (args.hideLoadingAfterDone) {
            _this.loading.off();
          }
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

        on: function(message) {
          /*
          loading
          */

          var loading, loading_height;
          $('body, a, .table-pointer tbody tr').css({
            cursor: 'wait'
          });
          if (this.stupidBrowser) {
            return;
          }
          if ($('#loading').length > 0) {
            $('#loading .message').html(message);
            return;
          }
          loading = $("<div id='loading'><div class='spin'></div><div class='message'>" + message + "</div><div class='cs_clear'></div></div>");
          $('body').append(loading);
          loading_height = $('#loading').height();
          $('#loading').css({
            bottom: -loading_height
          });
          $('#loading').animate({
            bottom: '+=' + (loading_height + 10)
          }, 400, 'easeOutExpo');
          return Spinner({
            color: '#444',
            width: 2,
            length: 4,
            radius: 4
          }).spin($('#loading .spin')[0]);
        },
        off: function() {
          var loading_height;
          $('body').css({
            cursor: 'default'
          });
          $('a, .table-pointer tbody tr').css({
            cursor: 'pointer'
          });
          if (this.stupidBrowser) {
            return;
          }
          $('#loading').dequeue();
          loading_height = $('#loading').height() + 10;
          return $('#loading').animate({
            bottom: '-=' + loading_height
          }, 400, 'easeInExpo', function() {
            return $(this).remove();
          });
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
    document = {
      getGroupedDocumentsAndApplications: function(documentMode, applicationId, keyword, index) {
        var ajaxApplications, result,
          _this = this;
        if (keyword == null) {
          keyword = '';
        }
        if (index == null) {
          index = 0;
        }
        /*
        Get grouped documents and applications for GroupedDocumentsCtrl.
        :return: {applications, groupedDocuments, page}
        */

        applicationId = parseInt(applicationId);
        result = {
          applications: null,
          groupedDocuments: null,
          page: {
            index: 0
          }
        };
        ajaxApplications = common.ajax({
          url: '/applications',
          hideLoadingAfterDone: false
        });
        return ajaxApplications.then(function(data) {
          var ajaxDocuments, x, _ref;
          result.applications = data.data.items;
          if (result.applications.length > 0) {
            if (__indexOf.call((function() {
              var _i, _len, _ref, _results;
              _ref = result.applications;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                x = _ref[_i];
                _results.push(x.id);
              }
              return _results;
            })(), applicationId) >= 0) {
              $rootScope.selectedApplication = ((function() {
                var _i, _len, _ref, _results;
                _ref = result.applications;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  x = _ref[_i];
                  if (x.id === applicationId) {
                    _results.push(x);
                  }
                }
                return _results;
              })())[0];
              sessionStorage.selectedApplication = JSON.stringify($rootScope.selectedApplication);
            } else if (!$rootScope.selectedApplication || (_ref = $rootScope.selectedApplication.id, __indexOf.call((function() {
              var _i, _len, _ref1, _results;
              _ref1 = result.applications;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                x = _ref1[_i];
                _results.push(x.id);
              }
              return _results;
            })(), _ref) < 0)) {
              $rootScope.selectedApplication = result.applications[0];
              sessionStorage.selectedApplication = JSON.stringify($rootScope.selectedApplication);
            }
            ajaxDocuments = _this.getGroupedDocuments({
              applicationId: $rootScope.selectedApplication.id,
              documentMode: documentMode,
              keyword: keyword,
              index: index
            });
            return ajaxDocuments.then(function(data) {
              result.groupedDocuments = data.data.items;
              result.page = {
                total: data.data.total,
                index: index,
                max: (data.data.total - 1) / pageSize,
                hasPrevious: index > 0,
                hasNext: (index + 1) * pageSize < data.data.total
              };
              return result;
            });
          } else {
            common.loading.off();
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
      }
    };
    return {
      stupidBrowser: stupidBrowser,
      pageSize: pageSize,
      common: common,
      setting: setting,
      document: document
    };
  });

}).call(this);
