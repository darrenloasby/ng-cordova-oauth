angular.module('oauth.nationbuilder', ['oauth.utils'])
  .factory('$ngCordovaNationbuilder', nationbuilder);

function nationbuilder($q, $http, $cordovaOauthUtility) {
  return { signin: oauthNationbuilder };

  /*
   * Sign into the Nationbuilder service
   *
   * @param    string appKey
   * @param    object options
   * @return   promise
   */
  function oauthNationbuilder(appKey, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_uri = "http://localhost/oauth_callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.cordova.InAppBrowser.open("https://gu.nationbuilder.com/oauth/authorize?client_id=" + appKey + "&redirect_uri=" + redirect_uri + "&response_type=token);
        browserRef.addEventListener("loadstart", function(event) {
          if ((event.url).indexOf(redirect_uri) === 0) {
            browserRef.removeEventListener("exit",function(event){});
            browserRef.close();
            var callbackResponse = (event.url).split("#")[1];
            var responseParameters = (callbackResponse).split("&");
            var parameterMap = [];
            for(var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }
            if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
              deferred.resolve({ access_token: parameterMap.access_token, token_type: parameterMap.token_type, uid: parameterMap.uid });
            } else {
              deferred.reject("Problem authenticating");
            }
          }
        });
        browserRef.addEventListener('exit', function(event) {
          deferred.reject("The sign in flow was canceled");
        });
      } else {
        deferred.reject("Could not find InAppBrowser plugin");
      }
    } else {
      deferred.reject("Cannot authenticate via a web browser");
    }
    return deferred.promise;
  }
}

nationbuilder.$inject = ['$q', '$http', '$cordovaOauthUtility'];
