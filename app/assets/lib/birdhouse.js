// --------------------------------------------------------
// birdhouse.js
//
// BirdHouse is a Titanium Developer plugin for
// authenticating and sending API calls to Twitter.
//
// Copyright 2011 (c) iEntry, Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Author: Joseph D. Purcell, iEntry Inc
// Version: 0.9
// Modified: May 2011
// --------------------------------------------------------
// INCLUDES
// iphone requires complete path
Ti.include('/lib/oauth.js');
Ti.include('/lib/sha1.js');
// THE CLASS
function BirdHouse(params) {
    // --------------------------------------------------------
    // ==================== PRIVATE ===========================
    // --------------------------------------------------------
    // VARIABLES
    var cfg = {
        // user config
        oauth_consumer_key : "",
        consumer_secret : "",
        show_login_toolbar : false,
        // system config
        oauth_version : "1.0",
        oauth_token : "",
        oauth_signature_method : "HMAC-SHA1",
        request_token : "",
        request_token_secret : "",
        request_verifier : "",
        access_token : "",
        access_token_secret : "",
        callback_url : ""
    };
    var accessor = {
        consumerSecret : cfg.consumer_secret,
        tokenSecret : cfg.access_token_secret
    };
    var authorized = false;
    // --------------------------------------------------------
    // set_message
    //
    // Creates a message to send to the Twitter service with
    // the given parameters, and adds the consumer key,
    // signature method, timestamp, and nonce.
    //
    // In Parameters:
    //	url (String) - the url to send the message to
    //	method (String) - 'POST' or 'GET'
    //	params (String) - parameters to add to the
    //	  message in URL form, i.e. var1=2&var2=3
    //
    // Returns:
    //	message (Array) - the message parameters to send
    //	  to Twitter
    // --------------------------------------------------------
    function set_message(url, method, params) {
        var message = {
            action : url,
            method : (method == 'GET') ? method : 'POST',
            parameters : (params != null) ? OAuth.decodeForm(params) : []
        };
        message.parameters.push(['oauth_consumer_key', cfg.oauth_consumer_key]);
        message.parameters.push(['oauth_signature_method', cfg.oauth_signature_method]);
        message.parameters.push(["oauth_timestamp", OAuth.timestamp().toFixed(0)]);
        message.parameters.push(["oauth_nonce", OAuth.nonce(42)]);
        message.parameters.push(["oauth_version", "1.0"]);
        return message;
    }

    // --------------------------------------------------------
    // get_request_token
    //
    // Sets the request token and token secret.
    //
    // In Parameters:
    //	callback (Function) - a function to call after
    //	  the user has been authorized; note that it won't
    //	  be executed until get_access_token()
    // --------------------------------------------------------
    function get_request_token(callback) {
        Ti.API.info('========================== + get reqquest Tokewn + ==========================');
        var url = 'https://api.twitter.com/oauth/request_token';
        var params = (cfg.callback_url != "") ? 'oauth_callback=' + escape(cfg.callback_url) : '';
        api(url, 'POST', params, function(resp) {
            if (resp != false) {
                Ti.API.info('========================== + get reqquest Tokewn SUCCESS+ ==========================');
                var responseParams = OAuth.getParameterMap(resp);
                cfg.request_token = responseParams['oauth_token'];
                cfg.request_token_secret = responseParams['oauth_token_secret'];
                get_request_verifier(callback);
            } else {
                Ti.API.info('========================== + get reqquest Tokewn FALSE+ ==========================');
            }
        }, false, true, false);
    }

    // --------------------------------------------------------
    // get_request_verifier
    //
    // Sets the request verifier. There is no reason to call
    // this unless you have the request token and token secret.
    // In fact, it should only be called from get_request_token()
    // for that very reason.
    //
    // In Parameters:
    //	callback (Function) - a function to call after
    //	  the user has been authorized; note that it won't
    //	  be executed until get_access_token()
    // --------------------------------------------------------
    function get_request_verifier(callback) {
        try {
            var url_1 = "https://api.twitter.com/oauth/authorize?oauth_token=" + cfg.request_token;
            Ti.API.info('========================== + get reqquest Verifier + ==========================' + url_1);

            if (OS_IOS) {
                var win = Ti.UI.createWindow({
                    top : 0,
                    modal : true,
                });
                var leftnavBtn = Ti.UI.createButton({
                    left : 10,
                    height : 29,
                    width : 62,
                    title : 'Cancel'
                });
                leftnavBtn.addEventListener('click', function(e) {
                    Ti.App.hideIndicator();
                    win.close();
                });
                var view = Titanium.UI.createView({
                    top : 0,
                    left : 0,
                    right : 0,
                    height : 45,
                    backgroundColor : 'white'
                });
                view.add(leftnavBtn);
                win.add(view);

                var webView = Ti.UI.createWebView({
                    top : 45,
                    left : 0,
                    url : url_1,
                    scalesPageToFit : true,
                    touchEnabled : true
                });
            } else {
                var win = Ti.UI.createWindow({
                    statusBarHidden : true,
                    navBarHidden : true,
                    exitOnClose : false,
                    orientationModes : [Ti.UI.PORTRAIT]
                });
                var leftnavBtn = Ti.UI.createButton({
                    title : 'Cancel',
                    backgroundColor : 'gray',
                    top : 10,
                    left : 10,
                    height : 40,
                    width : 100
                });
                leftnavBtn.addEventListener('click', function(e) {
                    Ti.App.hideIndicator();
                    win.close();
                });
                var view = Titanium.UI.createView({
                    top : 0,
                    left : 0,
                    right : 0,
                    height : 70,
                    backgroundColor : 'white'
                });
                view.add(leftnavBtn);
                win.add(view);

                var webView = Ti.UI.createWebView({
                    top : 70,
                    left : 0,
                    url : url_1,
                    scalesPageToFit : true,
                    touchEnabled : true
                });
            }
            var request_token = "";
            var url_base = "";
            var params = "";
            var loading = false;
            // since the 'loading' property on webView is broke, use this
            var loads = 0;
            // number of times webView has loaded a URl
            var doinOurThing = false;
            // whether or not we are checking for oauth tokens
            // add the webview to the window and open the window
            win.add(webView);
            win.open();
            Titanium.API.info('---00-----');
            // since there is no difference between the 'success' or 'denied' page apart from content,
            // we need to wait and see if Twitter redirects to the callback to determine success
            function checkStatus() {
                Titanium.API.info('---123-----');
                if (!doinOurThing) {
                    // access denied or something else was clicked
                    if (!loading) {
                        webView.stopLoading();
                        win.remove(webView);
                        win.close();
                        if ( typeof (callback) == 'function') {
                            callback(false);
                        }
                        return false;
                    }
                } else {
                }
            }


            Titanium.API.info('--456-----');
            webView.addEventListener('beforeload', function() {
                Titanium.API.info('---789-----' + webView.url);
                loading = true;
            });
            webView.addEventListener('load', function(e) {
                loads++;
                Titanium.API.info('---10-----' + loads);
                Titanium.API.info('---10 and URL-----:' + webView.url);
                // the first time load, ignore, because it is the initial 'allow' page
                // set timeout to check for something other than 'allow', if 'allow' was clicked
                // then loads==3 will cancel this
                if (loads == 2) {
                    // something else was clicked
                    Titanium.API.info('---11-----');
                    if (e.url != 'https://api.twitter.com/oauth/authorize') {
                        Titanium.API.info('---12-----');
                        webView.stopLoading();
                        win.remove(webView);
                        win.close();
                        if ( typeof (callback) == 'function') {
                            callback(false);
                        }
                        return false;
                    }
                    // wait a bit to see if Twitter will redirect
                    else {
                        setTimeout(checkStatus, 1000);
                    }
                }
                // Twitter has redirected the page to our callback URL (most likely)
                else if (loads == 3) {
                    try {
                        Titanium.API.info('---13------------' + e.url);
                        doinOurThing = true;
                        // kill the timeout b/c we are doin our thing
                        // success!
                        params = "";
                        Titanium.API.info('---14------------' + e.url);

                        var parts = (e.url).replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                            params = params + m;
                            Titanium.API.info('======== PARAM:=========' + params);
                            if (key == 'oauth_verifier') {
                                cfg.request_verifier = value;
                            }
                        });
                        Titanium.API.info('---15:------------' + cfg.request_verifie);
                        if (cfg.request_verifier != "") {
                            Titanium.API.info('========GET TOKEN qirh WEbVIEW=========');
                            // my attempt at making sure the stupid webview dies
                            webView.stopLoading();
                            win.remove(webView);
                            win.close();
                            get_access_token(callback);
                            return true;
                            // we are done here
                        }
                        Titanium.API.info('---16------------' + e.url);
                    } catch(ex) {
                        alert('ex' + ex)
                    }
                }
                // we are done loading the page
                loading = false;
            });
        } catch(ex) {
            alert('excep' + ex);
            Ti.API.info('=============================== ex exe=========' + ex);
        }
    }

    // --------------------------------------------------------
    // get_access_token
    //
    // Trades the request token, token secret, and verifier
    // for a user's access token.
    //
    // In Parameters:
    //	callback (Function) - a function to call after
    //	  the user has been authorized; this is where
    //	  it will get executed after being authorized
    // --------------------------------------------------------
    function get_access_token(callback) {
        Ti.API.info('========================== + get_access_token + ==========================');
        var url = 'https://api.twitter.com/oauth/access_token';
        api(url, 'POST', 'oauth_token=' + cfg.request_token + '&oauth_verifier=' + cfg.request_verifier, function(resp) {
            if (resp != false) {
                var responseParams = OAuth.getParameterMap(resp);
                cfg.access_token = responseParams['oauth_token'];
                cfg.access_token_secret = responseParams['oauth_token_secret'];
                cfg.user_id = responseParams['user_id'];
                cfg.screen_name = responseParams['screen_name'];
                accessor.tokenSecret = cfg.access_token_secret;
                save_access_token();
                authorized = load_access_token();
                // execute the callback function
                if ( typeof (callback) == 'function') {
                    callback(true);
                }
            } else {
                // execute the callback function
                if ( typeof (callback) == 'function') {
                    callback(false);
                }
            }
        }, false, true, false);
    }

    // --------------------------------------------------------
    // load_access_token
    //
    // Loads the access token and token secret from
    // 'twitter.config' to the class configuration.
    // --------------------------------------------------------
    function load_access_token() {
        Ti.API.info('============================load ACCESS TOEKN=======================');
        // try to find file
        var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'twitter.config');
        if (!file.exists()) {
            return false;
        }
        // try to read file
        var contents = file.read();
        if (contents == null) {
            return false;
        }
        // try to parse file into json
        try {
            var config = JSON.parse(contents.text);
        } catch(e) {
            return false;
        }
        // set config
        if (config.access_token) {
            cfg.access_token = config.access_token;
        }
        if (config.access_token_secret) {
            cfg.access_token_secret = config.access_token_secret;
            accessor.tokenSecret = cfg.access_token_secret;
        }
        return true;
    }

    // --------------------------------------------------------
    // save_access_token
    //
    // Writes the access token and token secret to
    // 'twitter.config'. Saving the config in a file instead
    // of using Ti.App.Property jazz allows the config to
    // stay around even if the app has been recompiled.
    // --------------------------------------------------------
    function save_access_token() {
        Ti.API.info('============================SAVE TOEKN=======================');
        // get file if it exists
        var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'twitter.config');
        // create file if it doesn't exist
        if (file == null) {
            file = Ti.Filesystem.createFile(Ti.Filesystem.applicationDataDirectory, 'twitter.config');
        }
        Ti.App.Properties.setString('ttname', cfg.screen_name);
        Ti.App.Properties.setString('ttid', cfg.user_id);
        Ti.App.Properties.setString('ttimg', 'https://api.twitter.com/1/users/profile_image/' + cfg.screen_name);
        // 296732259
        //JAESH_IDAR
        Ti.API.info(cfg.user_id);
        Ti.API.info(cfg.screen_name);
        //Ti.App.info('https://api.twitter.com/1/users/profile_image/' + cfg.screen_name);
        // write config
        var config = {
            access_token : cfg.access_token,
            access_token_secret : cfg.access_token_secret,
            user_id : cfg.user_id,
            screen_name : cfg.screen_name
        };
        file.write(JSON.stringify(config));
    }

    // --------------------------------------------------------
    // api
    //
    // Makes a Twitter API call to the given URL by the
    // specified method with the given parameters.
    //
    // In Parameters:
    //	url (String) - the url to send the XHR to
    //	method (String) - POST or GET
    //	params (String) - the parameters to send in URL
    //	  form
    //	callback (Function) - after execution, call
    //	  this function and send the XHR data to it
    //	auth (Bool) - whether or not to force auth
    //	setUrlParams (Bool) - set the params in the URL
    //	setHeader (Bool) - set "Authorization" HTML header
    //
    // Notes:
    //	- the setUrlParams and setHeader should only need
    //	  to be set whenever getting request tokens; values
    //	  should be 'true' and 'false' respectively
    //	- take advantage of the callback function, if you
    //	  want to tweet a message and then display an alert:
    //	      BH.tweet("some text",function(){
    //	          alertDialog = Ti.UI.createAlertDialog({
    //	              message:'Tweet posted!'
    //	          });
    //	          alertDialog.show();
    //	      });
    //
    // Returns: false on failure and the responseText on
    //   success.
    // --------------------------------------------------------
    function api(url, method, params, callback, auth, setUrlParams, setHeader) {
        try {
            var finalUrl = '';
            // authorize user if not authorized, and call this in the callback
            if (!authorized && ( typeof (auth) == 'undefined' || auth === true)) {
                authorize(function(retval) {
                    if (!retval) {
                        // execute the callback function
                        if ( typeof (callback) == 'function') {
                            callback(false);
                        }
                        return false;
                    } else {
                        api(url, method, params, callback, auth);
                    }
                });
            }
            // user is authorized so execute API
            else {
                // VALIDATE INPUT
                if (method != "POST" && method != "GET") {
                    return false;
                }
                if (params == null || typeof (params) == "undefined") {
                    params = "";
                }
                // VARIABLES
                var initparams = params;
                if (params != null) {
                    params = params + "&";
                }
                if (cfg.access_token != '') {
                    params = params + "oauth_token=" + cfg.access_token;
                }

                var message = set_message(url, method, params);

                OAuth.SignatureMethod.sign(message, accessor);

                // if we are getting request tokens, all params have to be set in URL
                if ( typeof (setUrlParams) != 'undefined' && setUrlParams == true) {

                    finalUrl = OAuth.addToURL(message.action, message.parameters);

                }
                // for all other requests only custom params need set in the URL
                else {

                    finalUrl = OAuth.addToURL(message.action, initparams);

                }
                var XHR = Ti.Network.createHTTPClient();
                // on success, grab the request token
                XHR.onload = function() {
                    // execute the callback function
                    if ( typeof (callback) == 'function') {
                        callback(XHR.responseText);
                    }
                    return XHR.responseText;
                };
                // o error, show message
                XHR.onerror = function(e) {
                    //alert('Can not open Twiitter dialog....try again');
                    // execute the callback function
                    Titanium.API.info('-XHR ERROR--' + JSON.stringify(e));
                    if ( typeof (callback) == 'function') {
                        callback(false);
                    }
                    return false;
                };
                Ti.API.info('---the URL------' + finalUrl);
                XHR.open(method, finalUrl, false);

                // if we are getting request tokens do not set the HTML header
                if ( typeof (setHeader) == 'undefined' || setHeader == true) {
                    var init = true;
                    var header = "OAuth ";
                    for (var i = 0; i < message.parameters.length; i++) {
                        if (init) {
                            init = false;
                        } else {
                            header = header + ",";
                        }
                        header = header + message.parameters[i][0] + '="' + escape(message.parameters[i][1]) + '"';
                    }
                    XHR.setRequestHeader("Authorization", header);
                }
                Titanium.API.info('------' + JSON.stringify(message));
                XHR.send();
            }
        } catch(ex) {
            Titanium.API.info('-----Exception in API ' + ex);
        }
    }

    // --------------------------------------------------------
    //
    //
    //
    //
    //               API 3 start
    //
    //              This will take arguments from function and Return the response
    //
    // --------------------------------------------------------

    var api3 = function(url, method, params, callback) {
        try {
            var finalUrl = '';
            if ( typeof (params) == 'function' && typeof (callback) == 'undefined') {
                callback = params;
                params = '';
            }
            var initparams = params;
            if (params != null) {
                params = params + "&";
            }
            var message = set_message(url, method, params);
            message.parameters.push(['oauth_token', cfg.access_token]);
            OAuth.SignatureMethod.sign(message, accessor);
            finalUrl = OAuth.addToURL(message.action, initparams);
            Ti.API.info("My Final URL-:" + finalUrl);
            var XHR = Ti.Network.createHTTPClient();
            Ti.API.info('-------this is meaage ---------:' + JSON.stringify(message));
            Ti.API.info("-------------My Final URL-------:" + finalUrl);
            XHR.open(method, finalUrl, false);
            XHR.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            XHR.setTimeout(1000);
            XHR.onload = function() {
                Ti.API.info("My twitts-:" + XHR.responseText);
                if (callback) {
                    callback(XHR.responseText);
                }
            };
            XHR.onerror = function(e) {
                Ti.API.info("XHR.onerror get twitts : " + JSON.stringify(e));
                if (callback) {
                    callback(false);
                }
            };
            var init = true;
            var header = "OAuth ";
            for (var i = 0; i < message.parameters.length; i++) {
                if (init) {
                    init = false;
                } else {
                    header = header + ",";
                }
                header = header + message.parameters[i][0] + '="' + escape(message.parameters[i][1]) + '"';
            }
            header = OAuth.getAuthorizationHeader("", message.parameters);
            XHR.setRequestHeader("Authorization", header);
            if (method == "POST") {
                Titanium.API.info('---------------XHR: params-----:' + params);
                XHR.send(params);
            } else {
                XHR.send();
            }

        } catch(ex) {
            Titanium.API.info('----Exception in API 3-------' + ex);
        }
    };

    function get_Myfollowers(params, callback) {
        try {
            api3('https://api.twitter.com/1.1/followers/list.json', "GET", params, function(resp) {
                Titanium.API.info('-------------GET Tweets Response:' + resp);
                if (resp != "" && resp != 0 && resp != undefined && resp != false) {
                    Ti.API.info("fn-get_Myfollowers: response was " + resp + '--------------');
                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                } else {

                    Ti.API.info("Failed to send tweet." + '------------------' + JSON.stringify(resp));

                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                }
            });
        } catch(ex) {
            Ti.API.info('---------exception in get_Myfollowers-------' + ex);
        }
    }

    function get_Myfollowing(params, callback) {
        try {
            api3('https://api.twitter.com/1.1/friends/list.json', "GET", params, function(resp) {
                Titanium.API.info('-------------GET Tweets Response:' + resp);
                if (resp != "" && resp != 0 && resp != undefined && resp != false) {
                    Ti.API.info("fn-get_Myfollowing: response was " + resp + '--------------');
                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                } else {

                    Ti.API.info("Failed to send tweet." + '------------------' + JSON.stringify(resp));

                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                }
            });
        } catch(ex) {

            Titanium.API.info('----Exception in get_Myfollowing-------' + ex);
        }

    }

    function get_Mytweets(params, callback) {
        try {
            api3('https://api.twitter.com/1.1/statuses/user_timeline.json', "GET", params, function(resp) {
                Titanium.API.info('-------------GET Tweets Response:' + resp);
                if (resp != "" && resp != 0 && resp != undefined && resp != false) {
                    Ti.API.info("fn-Get_tweet: response was " + resp + '--------------');
                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                } else {

                    Ti.API.info("Failed to send tweet." + '------------------' + JSON.stringify(resp));

                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                }
            });
        } catch(ex) {
            Ti.API.info('-------exception in get_Mytweets------' + ex);
        }
    }

    // --------------------------------------------------------
    //
    //
    //
    //
    //               API 3 Ends
    //
    //
    //
    // --------------------------------------------------------

    /*
    // --------------------------------------------------------
    //
    //
    //
    //
    //              it self function for My Tweets and My folowers
    //
    //
    //
    // --------------------------------------------------------

    function get_Myfollowers(params, callback) {
    var finalUrl = '';
    if ( typeof (params) == 'function' && typeof (callback) == 'undefined') {
    callback = params;
    params = '';
    }
    var url = 'https://api.twitter.com/1.1/followers/list.json';
    var initparams = params;
    if (params != null) {
    params = params + "&";
    }
    var message = set_message(url, "GET", params);
    message.parameters.push(['oauth_token', cfg.access_token]);
    OAuth.SignatureMethod.sign(message, accessor);
    finalUrl = OAuth.addToURL(message.action, initparams);
    Ti.API.info("My Final URL-:" + finalUrl);
    var XHR = Ti.Network.createHTTPClient();
    XHR.open("GET", finalUrl);
    XHR.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    XHR.onload = function() {
    Ti.API.info("My twitts-:" + XHR.responseText);
    if (callback) {
    callback(XHR.responseText);
    }
    };

    XHR.onerror = function(e) {

    Ti.API.info("XHR.onerror get twitts : " + JSON.stringify(e));
    alert('Erro Occurs Please Try Again....');
    if (callback) {
    callback(e);
    }
    };
    if ( typeof (setHeader) == 'undefined' || setHeader == true) {
    var init = true;
    var header = "OAuth ";
    for (var i = 0; i < message.parameters.length; i++) {
    if (init) {
    init = false;
    } else {
    header = header + ",";
    }
    header = header + message.parameters[i][0] + '="' + escape(message.parameters[i][1]) + '"';
    }
    header = OAuth.getAuthorizationHeader("", message.parameters);
    Titanium.API.info('op');
    Titanium.API.info(header);
    XHR.setRequestHeader("Authorization", header);
    Titanium.API.info('op1');
    }
    XHR.send();
    };

    // --------------------------------------------------------
    // get_tweets
    //

    function get_Mytweets(params, callback) {
    var finalUrl = '';
    if ( typeof (params) == 'function' && typeof (callback) == 'undefined') {
    callback = params;
    params = '';
    }

    var url = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
    var initparams = params;
    if (params != null) {
    params = params + "&";
    }
    var message = set_message(url, "GET", params);
    message.parameters.push(['oauth_token', cfg.access_token]);
    OAuth.SignatureMethod.sign(message, accessor);
    finalUrl = OAuth.addToURL(message.action, initparams);
    Ti.API.info("My Final URL-:" + finalUrl);
    var XHR = Ti.Network.createHTTPClient();
    XHR.open("GET", finalUrl, false);
    XHR.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    XHR.setTimeout(1000);
    XHR.onload = function() {
    Ti.API.info("My twitts-:" + XHR.responseText);
    if (callback) {
    callback(XHR.responseText);
    }
    };

    XHR.onerror = function(e) {
    Ti.API.info("XHR.onerror get twitts : " + JSON.stringify(e));
    alert('Erro Occurs Please Try Again....');
    if (callback) {
    callback(e);
    }
    };
    if ( typeof (setHeader) == 'undefined' || setHeader == true) {
    var init = true;
    var header = "OAuth ";
    for (var i = 0; i < message.parameters.length; i++) {
    if (init) {
    init = false;
    } else {
    header = header + ",";
    }
    header = header + message.parameters[i][0] + '="' + escape(message.parameters[i][1]) + '"';
    }
    header = OAuth.getAuthorizationHeader("", message.parameters);
    Titanium.API.info('op');
    Titanium.API.info(header);
    XHR.setRequestHeader("Authorization", header);
    Titanium.API.info('op1');
    }
    XHR.send();
    };

    // --------------------------------------------------------
    //
    //
    //
    //
    //             Ends  it self functiosns for My Tweets and My folowers
    //
    //
    //
    // --------------------------------------------------------
    */
    // --------------------------------------------------------
    // send_tweet
    //
    // Makes an API call to Twitter to post a tweet.
    //
    // In Parameters:
    //	params (String) - the string of optional and
    //	  required parameters in url form
    //	callback (Function) - function to call on completion

    // --------------------------------------------------------

    var UPLOADVIDEO_API1 = function(image_video, message, callback) {
        try {
            var XHR = Ti.Network.createHTTPClient();
            XHR.onload = function() {
                Ti.API.info("My twitts-:" + XHR.responseText);
            };
            XHR.onerror = function(e) {
                Ti.API.info("XHR.onerror get twitts : " + JSON.stringify(e));
            };
            XHR.open('POST', 'http://api.twitpic.com/1/upload.json');
            XHR.setTimeout(10000);
            if (OS_IOS) {
                XHR.setRequestHeader('Content-Type', 'multipart/form-data');
            } else {
                XHR.setRequestHeader('enctype', 'multipart/form-data');
            }
            Ti.API.info(" cfg.access_tokes : " + cfg.access_token);
            Ti.API.info(" cfg.access_token_secret : " + cfg.access_token_secret);
            XHR.setTimeout(1000);
            var json = {
                key : 'fe98e40a9ba7f24ec1427166430567fe',
                consumer_token : 've08I0NlF2WzzTiOL5b3g',
                consumer_secret : 't01y1Xl4VoUfhg1YewgOXjOLHTVZnFNIRly8Vl8Q',
                oauth_token : cfg.access_token,
                oauth_secret : cfg.access_token_secret,
                message : message,
                media : image_video,
            };
            XHR.send(json);
        } catch(ex) {
            Titanium.API.info('----Exception in API 3-------' + ex);

        }
    };

    var UPLOADVIDEO_API2 = function(postParams, pSuccessCallback) {

        var finalUrl = '';

        if (!authorized && ( typeof (auth) == 'undefined' || auth === true)) {

            authorize(function(retval) {

                if (!retval) {
                    if ( typeof (callback) == 'function') {
                        callback(false);
                    }
                    return false;
                } else {

                    sendTwitterImage(postParams, pSuccessCallback);
                }
            });

        } else {

            var url = 'http://api.twitpic.com/2/upload.json';

            var message = set_message(url, "POST");

            message.parameters.push(['oauth_token', cfg.access_token]);

            OAuth.SignatureMethod.sign(message, accessor);

            var XHR = Ti.Network.createHTTPClient();

            XHR.open("POST", url);

            XHR.setTimeout(1000);

            XHR.onload = function() {

                Ti.API.info("XHR.success video share---- " + XHR.responseText);

            };
            if (OS_IOS) {

                XHR.setRequestHeader('Content-Type', 'multipart/form-data');

            } else {

                XHR.setRequestHeader('enctype', 'multipart/form-data');
            }

            XHR.onerror = function(e) {

                Ti.API.info("XHR.onerror  video share : " + JSON.stringify(e));

            };

            if ( typeof (setHeader) == 'undefined' || setHeader == true) {

                var init = true;

                var header = "OAuth ";
                Ti.API.info('--------- this is message  before------' + JSON.stringify(message));
                for (var i = 0; i < message.parameters.length; i++) {

                    if (init) {

                        init = false;
                    } else {
                        header = header + ",";
                    }

                    header = header + message.parameters[i][0] + '="' + escape(message.parameters[i][1]) + '"';
                }

                header = OAuth.getAuthorizationHeader("https://api.twitter.com", message.parameters);

                XHR.setRequestHeader("Authorization", header);

            }

            Ti.API.info('--------- this is message ------' + JSON.stringify(message));
            Ti.API.info('--------- this is header ------' + JSON.stringify(header));

            XHR.send(postParams);
        }
    };

    function send_tweet(params, callback) {
        try {
            api3('https://api.twitter.com/1.1/statuses/update.json', "POST", params, function(resp) {
                if (resp != false) {
                    Ti.API.debug("fn-send_tweet: response was " + resp + '--------------');
                    if ( typeof (callback) == 'function') {
                        callback(true);
                    }
                    return true;
                } else {
                    Ti.API.info("Failed to send tweet." + '------------------');
                    if ( typeof (callback) == 'function') {
                        callback(false);
                    }
                    return false;
                }
            });
        } catch(ex) {
            Titanium.API.info('------exception in send_tweet-----' + ex);
        }
    }

    function send_message(params, callback) {
        try {
            api3('https://api.twitter.com/1.1/direct_messages/new.json', "POST", params, function(resp) {
                Titanium.API.info('-------------GET Tweets Response:' + resp);
                if (resp != "" && resp != 0 && resp != undefined && resp != false) {
                    Ti.API.info("fn-send_message: response was " + resp + '--------------');
                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                } else {

                    Ti.API.info("Failed to send tweet." + '------------------' + JSON.stringify(resp));

                    if ( typeof (callback) == 'function') {
                        callback(false);
                    }
                    return false;
                }
            });
        } catch(ex) {
            Ti.API.info('-------exception in get_Mytweets------' + ex);
        }
    }

    var sendTwitterImage = function(postParams, pSuccessCallback, pErrorCallback) {
        var finalUrl = '';
        if (!authorized && ( typeof (auth) == 'undefined' || auth === true)) {
            authorize(function(retval) {
                if (!retval) {
                    if ( typeof (callback) == 'function') {
                        callback(false);
                    }
                    return false;
                } else {
                    sendTwitterImage(postParams, pSuccessCallback, pErrorCallback);
                }
            });
        } else {
            var url = 'https://api.twitter.com/1.1/statuses/update_with_media.json';
            var initparams = params;
            if (params != null) {
                params = params + "&";
            }
            var message = set_message(url, "POST");
            message.parameters.push(['oauth_token', cfg.access_token]);
            OAuth.SignatureMethod.sign(message, accessor);
            var XHR = Ti.Network.createHTTPClient();
            XHR.open("POST", url);
            XHR.setTimeout(1000);
            XHR.onload = function() {
                Ti.API.info("--------Successfully imafge share---- " + XHR.responseText);
                if (pSuccessCallback) {
                    pSuccessCallback(true);
                }
            };
            if (OS_IOS) {
                XHR.setRequestHeader('Content-Type', 'multipart/form-data');
            } else {
                XHR.setRequestHeader('enctype', 'multipart/form-data');
            }
            XHR.onerror = function(e) {
                Ti.App.hideIndicator();
                Ti.API.info("XHR.onerror Twitter Image share : " + JSON.stringify(e));
                if (pErrorCallback) {
                    pErrorCallback(false);
                }
            };
            if ( typeof (setHeader) == 'undefined' || setHeader == true) {
                var init = true;
                var header = "OAuth ";
                for (var i = 0; i < message.parameters.length; i++) {
                    if (init) {
                        init = false;
                    } else {
                        header = header + ",";
                    }
                    header = header + message.parameters[i][0] + '="' + escape(message.parameters[i][1]) + '"';
                }
                header = OAuth.getAuthorizationHeader("", message.parameters);
                XHR.setRequestHeader("Authorization", header);
            }
            XHR.send(postParams);
        }
    };
    // --------------------------------------------------------
    // delete function
    //
    // Shortens a URL using twe.ly.
    //
    // In Parameters:
    //  id (number) - the id of tweet to delete
    //
    // Returns:
    //   id (number) -
    //  callback (Function) - function to call on completion
    // --------------------------------------------------------
    function delete_my_tweets(id, callback) {
        try {
            api3('https://api.twitter.com/1.1/statuses/destroy/' + id + '.json', "POST", '', function(resp) {
                Titanium.API.info('-------------GET Tweets Response:' + resp);
                if (resp != "" && resp != 0 && resp != undefined && resp != false) {
                    Ti.API.info("fn-Get_tweet: response was " + resp + '--------------');
                    Ti.API.info(resp);
                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                } else {
                    Ti.API.info("Failed to DELTE tweet." + '------------------' + JSON.stringify(resp));
                    Ti.API.info(JSON.stringify(resp));
                    if ( typeof (callback) == 'function') {
                        callback(resp);
                    }
                    return resp;
                }
            });
        } catch(ex) {
            Ti.API.info('-------exception in DELTE:------' + ex);
        }
    }

    // --------------------------------------------------------
    // shorten_url
    //
    // Shortens a URL using twe.ly.
    //
    // In Parameters:
    //	url (String) - the url to shorten
    //
    // Returns:
    //	shorturl (String) - the shortened URL, else false
    //	callback (Function) - function to call on completion
    // --------------------------------------------------------
    function shorten_url(url, callback) {
        var XHR = Titanium.Network.createHTTPClient();
        XHR.open("GET", "https://www.twe.ly/short.php?url=" + url + "&json=1");
        XHR.onload = function() {
            try {
                shorturl = JSON.parse(XHR.responseText);
            } catch(e) {
                shorturl = false;
            }
            if (shorturl != false && shorturl.substr(0, 5) == 'Sorry') {
                shorturl = false;
            }
            if ( typeof (callback) == 'function') {
                callback(shorturl, url);
            }
            return shorturl;
        };
        XHR.onerror = function(e) {

            if ( typeof (callback) == 'function') {
                callback(false);
            }
            return false;
        };
        XHR.send();
    }

    // authorize
    //
    // The whole authorization sequence begins with
    // get_request_token(), which calls get_request_verifier()
    // which finally calls get_access_token() which then
    // saves the token in a file.
    //
    // In Parameters:
    //	callback (Function) - a function to call after
    //	  the user has been authorized; note that it won't
    //	  be executed until get_access_token(), unless we
    //	  are already authorized.
    //
    // Returns: true if the user is authorized
    // --------------------------------------------------------
    function authorize(callback) {
        if (!authorized) {
            get_request_token(callback);
            // get_request_token or a function it calls will call callback
        } else {
            // execute the callback function
            if ( typeof (callback) == 'function') {
                callback(authorized);
            }
        }
        return authorized;
    }

    // --------------------------------------------------------
    // deauthorize
    //
    // Delete the stored access token file, delete the tokens
    // from the config and accessor, and set authorized to
    // load_access_token() which should return false since
    // we deleted the file, thus resulting in a deauthroized
    // state.
    //
    // In Parameters:
    //	callback (Function) - function to call after
    //	  user is deauthorized
    //
    // Returns: true if the user is deauthorized
    // --------------------------------------------------------
    function deauthorize(callback) {
        if (authorized) {
            var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'twitter.config');
            file.deleteFile();
            authorized = load_access_token();
            accessor.tokenSecret = "";
            cfg.access_token = "";
            cfg.access_token_secret = "";
            cfg.request_verifier = "";
            // execute the callback function
            if ( typeof (callback) == 'function') {
                callback(!authorized);
            }
            var client = Titanium.Network.createHTTPClient();
            client.clearCookies('https://twitter.com/login/');
        } else {
            // execute the callback function
            if ( typeof (callback) == 'function') {
                callback(!authorized);
            }
        }
        return !authorized;
    }


    this.get_Myfollowers = get_Myfollowers;
    this.sendTwitterImage = sendTwitterImage;
    this.get_Myfollowing = get_Myfollowing;
    this.send_message = send_message;
    this.get_Mytweets = get_Mytweets;
    this.authorize = authorize;
    this.deauthorize = deauthorize;
    this.api = api;
    this.screen_name = cfg.screen_name;
    this.user_id = cfg.user_id;
    this.send_tweet = send_tweet;
    this.UPLOADVIDEO_API1 = UPLOADVIDEO_API1;
    this.UPLOADVIDEO_API2 = UPLOADVIDEO_API2;
    this.delete_my_tweets = delete_my_tweets;
    this.authorized = function() {
        return authorized;
    };

    // --------------------------------------------------------
    // =================== INITIALIZE =========================
    // --------------------------------------------------------
    if ( typeof params == 'object') {
        if (params.consumer_key != undefined) {
            cfg.oauth_consumer_key = params.consumer_key;
        }
        if (params.consumer_secret != undefined) {
            cfg.consumer_secret = params.consumer_secret;
            accessor.consumerSecret = cfg.consumer_secret;
        }
        if (params.callback_url != undefined) {
            cfg.callback_url = params.callback_url;
        }
        if (params.show_login_toolbar != undefined) {
            cfg.show_login_toolbar = params.show_login_toolbar;
        }
    }
    authorized = load_access_token();
    // load the token on startup to see if authorized
};

