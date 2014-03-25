Ti.include('/lib/sha1.js');
Ti.include('/lib/oauth.js');
var counter = 0;
// create an OAuthAdapter instance
var OAuthAdapter = function(pConsumerSecret, pConsumerKey, pSignatureMethod) {
	var Myfullfolder = null;
	if (OS_IOS) {
		Myfullfolder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'media');
	} else {
		if (Ti.Filesystem.isExternalStoragePresent() == true) {
			Myfullfolder = Ti.Filesystem.getFile(Titanium.Filesystem.getExternalStorageDirectory(), 'media');
		} else {
			Myfullfolder = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'media');
		}
	}
	if (!Myfullfolder.exists()) {
		Myfullfolder.createDirectory();
	}
	Titanium.API.info('---------The NativePAth: My Folder: ----------' + Myfullfolder.nativePath);
	// will hold the consumer secret and consumer key as provided by the caller
	var consumerSecret = pConsumerSecret;
	var consumerKey = pConsumerKey;
	// will set the signature method as set by the caller
	var signatureMethod = pSignatureMethod;
	// the pin or oauth_verifier returned by the authorization process window
	var pin = null;
	// will hold the request token and access token returned by the service
	var requestToken = null;
	var requestTokenSecret = null;
	var accessToken = null;
	var accessTokenSecret = null;
	Alloy.Globals.deletealls = function(pService) {
		requestToken = null;
		requestTokenSecret = null;
		accessToken = null;
		accessTokenSecret = null;
		var file = null;
		file = Titanium.Filesystem.getFile(Myfullfolder.resolve(), pService + '.config');
		if (file.exists()) {
			file.deleteFile();
		}
	};
	// the accessor is used when communicating with the OAuth libraries to sign the messages
	var accessor = {
		consumerSecret : consumerSecret,
		tokenSecret : ''
	};
	// holds actions to perform
	var actionsQueue = [];
	// will hold UI components
	var window = null;
	var view = null;
	var webView = null;
	var receivePinCallback = null;
	this.loadAccessToken = function(pService) {
		try {
			var file = null;
			file = Titanium.Filesystem.getFile(Myfullfolder.resolve(), pService + '.config');
			if (file.exists() == false)
				return;
			var contents = file.read();
			if (contents == null)
				return;
			var config = JSON.parse(contents.text);
			if (config.accessToken)
				accessToken = config.accessToken;
			if (config.accessTokenSecret)
				accessTokenSecret = config.accessTokenSecret;
			return config;
		} catch(ex) {
			Ti.App.hideIndicator();
			Titanium.API.info('---------Exception in this.loadAccessToken' + ex);
		}
	};
	this.saveAccessToken = function(pService) {
		var file = Titanium.Filesystem.getFile(Myfullfolder.resolve(), pService + '.config');
		if (file == null)
			file = Ti.Filesystem.createFile(Myfullfolder.resolve(), pService + '.config');
		file.write(JSON.stringify({
			accessToken : accessToken,
			accessTokenSecret : accessTokenSecret
		}));
	};
	Titanium.App.closeAll = function(pService) {
		var file = Titanium.Filesystem.getFile(Myfullfolder.resolve(), pService + '.config');
		if (file.exists()) {
			file.deleteFile();
		}
	};
	// will tell if the consumer is authorized
	this.isAuthorized = function() {
		return !(accessToken == null || accessTokenSecret == null);
	};
	// creates a message to send to the service
	var createMessage = function(pUrl) {
		try {
			var message = {
				action : pUrl,
				method : 'POST',
				parameters : []
			};
			message.parameters.push(['oauth_consumer_key', consumerKey]);
			message.parameters.push(['oauth_signature_method', signatureMethod]);
			return message;
		} catch(ex) {
			Ti.App.hideIndicator();
			Titanium.API.info('-----------Exception in yhis.isauthorize.----------------' + ex);
		}
	};
	// returns the pin
	this.getPin = function() {
		return pin;
	};
	// requests a requet token with the given Url
	this.getRequestToken = function(pUrl, successcallback, errocallback) {
		try {
			accessor.tokenSecret = '';
			var message = createMessage(pUrl);
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var client = Titanium.Network.createHTTPClient();
			client.open('POST', pUrl, false);
			client.onload = function() {
				Titanium.API.info('------On Load REAL:---------' + this.responseText);
				var responseParams = OAuth.getParameterMap(client.responseText);
				requestToken = responseParams['oauth_token'];
				requestTokenSecret = responseParams['oauth_token_secret'];
				var responseObject = this.responseText;
				if (successcallback) {
					successcallback(responseObject);
				}
			};
			client.onerror = function(e) {
				if (errocallback) {
					errocallback({
						error : e.error
					});
				}
			};
			client.setTimeout(1000);
			client.send(OAuth.getParameterMap(message.parameters));
		} catch(ex) {
			Ti.App.hideIndicator();
		}
	};
	// unloads the UI used to have the user authorize the application
	var destroyAuthorizeUI = function() {
		Titanium.API.info('destroyAuthorizeUI');
		// if the window doesn't exist, exit
		if (window == null)
			return;
		// remove the UI
		try {
			Titanium.API.info('destroyAuthorizeUI:webView.removeEventListener');
			webView.removeEventListener('load', authorizeUICallback);
			Titanium.API.info('destroyAuthorizeUI:window.close()');
			window.close();
		} catch(ex) {
			Ti.App.hideIndicator();
			Titanium.API.info('exception in  authorize UI.' + ex);
		}
	};
	// looks for the PIN everytime the user clicks on the WebView to authorize the APP
	var authorizeUICallback = function(e) {
		try {
			var matches = null;
			if (e.source.html != null) {
				matches = e.source.html.match(/\<code\>(\d{1,})\<\/code\>/);
			}
			var returnData = {
				linkedInReturnStatus : true
			};
			if (matches && matches[1]) {
				Titanium.API.info("Matches: " + matches[1]);
				pin = matches[1];
				if (receivePinCallback) {
					setTimeout(function() {
						receivePinCallback(returnData);
					}, 100);
					destroyAuthorizeUI();
				}
			}
			if (e.url.indexOf('oauth_verifier') != -1) {
				var token = e.url.split("&")[1];
				pin = token.split('=')[1];
				if (receivePinCallback) {
					destroyAuthorizeUI();
					setTimeout(function() {
						receivePinCallback(returnData);
					}, 100);
				}
			} else if (e.url.indexOf('user_refused') !== -1) {
				destroyAuthorizeUI();
				returnData.linkedInReturnStatus = false;
				setTimeout(function() {
					receivePinCallback(returnData);
				}, 100);
			}
		} catch(ex) {
			Ti.App.hideIndicator();
		}
	};
	// shows the authorization UI
	this.showAuthorizeUI = function(pUrl, pReceivePinCallback) {
		try {
			receivePinCallback = pReceivePinCallback;
			if (OS_IOS) {
				window = Ti.UI.createWindow({
					modal : true,
					fullscreen : true
				});
				var btn = Titanium.UI.createButton({
					title : 'Cancel',
					top : 10,
					left : 10,
					height : 30,
					width : 60
				});
				window.leftNavButton = btn;
				btn.addEventListener('click', function(e) {
					Ti.App.hideIndicator();
					window.close();
				});
				var view = Titanium.UI.createView({
					top : 0,
					left : 0,
					right : 0,
					height : 45,
					backgroundColor : 'white'
				});
				view.add(btn);
				window.add(view);
			} else {
				window = Ti.UI.createWindow({
					statusBarHidden : true,
					navBarHidden : true,
					exitOnClose : false,
					orientationModes : [Ti.UI.PORTRAIT]
				});
				var viewand = Titanium.UI.createView({
					top : 0,
					height : 70,
					left : 0,
					right : 0,
					backgroundColor : 'white'
				});
				var btnandroid = Titanium.UI.createButton({
					title : 'Cancel',
					backgroundColor : 'gray',
					top : 10,
					left : 10,
					height : 40,
					width : 100
				});
				viewand.add(btnandroid);
				window.add(viewand);
				btnandroid.addEventListener('click', function(e) {
					Ti.App.hideIndicator();
					window.close();
				});
			}
			window.open();
			webView = Ti.UI.createWebView({
				url : pUrl,
				//autoDetect : [Ti.UI.AUTODETECT_NONE],
				top : (Titanium.Platform.osname != 'android') ? 45 : 70 ,

			});
			webView.addEventListener('beforeload', function(e) {
				if (e.url.indexOf('http://www.clearlyinnovative.com/') != -1 || e.url.indexOf('https://www.linkedin.com/') != -1) {
					Titanium.API.debug(e);
					authorizeUICallback(e);
					webView.stopLoading = true;
				}
			});
			webView.addEventListener('load', authorizeUICallback);
			window.add(webView);
		} catch(EX) {
			Ti.App.hideIndicator();
		}
	};
	this.getAccessToken = function(pUrl, successcallback, erroecallback) {
		try {
			accessor.tokenSecret = requestTokenSecret;
			var message = createMessage(pUrl);
			message.parameters.push(['oauth_token', requestToken]);
			message.parameters.push(['oauth_verifier', pin]);
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var parameterMap = OAuth.getParameterMap(message.parameters);
			for (var p in parameterMap)
			Titanium.API.info(p + ': ' + parameterMap[p]);
			var client = Ti.Network.createHTTPClient();
			client.open('POST', pUrl, false);
			client.setTimeout(10000);
			client.onload = function() {
				var responseParams = OAuth.getParameterMap(client.responseText);
				accessToken = responseParams['oauth_token'];
				accessTokenSecret = responseParams['oauth_token_secret'];
				processQueue();
				if (successcallback) {
					successcallback(this.responseText);
				}
			};
			client.onerror = function(e) {
				if (erroecallback) {
					erroecallback({
						error : e.error
					});
				}
			};
			client.send(parameterMap);
		} catch(ex) {
			Ti.App.hideIndicator();
			Titanium.API.info('----------exception in get accesstoken-------------' + ex);
		}
	};
	var processQueue = function() {
		try {
			while (( q = actionsQueue.shift()) != null)send(q.url, q.parameters, q.title, q.successMessage, q.errorMessage);
			Titanium.API.info('Processing queue: done.');
		} catch(ex) {
			Ti.App.hideIndicator();
		}
	};
	// TODO: remove this on a separate Twitter library
	var send = function(pUrl, pParameters, pTitle, pSuccessMessage, pErrorMessage) {
		try {
			if (accessToken == null || accessTokenSecret == null) {
				actionsQueue.push({
					url : pUrl,
					parameters : pParameters,
					title : pTitle,
					successMessage : pSuccessMessage,
					errorMessage : pErrorMessage
				});
				return;
			}
			accessor.tokenSecret = accessTokenSecret;
			var message = createMessage(pUrl);
			message.parameters.push(['oauth_token', accessToken]);
			message.parameters.push(['oauth_token_secret', accessTokenSecret]);
			for (p in pParameters)
			message.parameters.push(pParameters[p]);
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var parameterMap = OAuth.getParameterMap(message.parameters);
			for (var p in parameterMap) {
				Titanium.API.info(p + ': ' + parameterMap[p]);
			}
			var client = Ti.Network.createHTTPClient();
			client.open('POST', pUrl, false);
			Titanium.API.info(JSON.stringify(parameterMap));
			Titanium.API.info(OAuth.getAuthorizationHeader("", message.parameters));
			client.setRequestHeader("Authorization", OAuth.getAuthorizationHeader("", message.parameters));
			if (OS_IOS) {
				client.setRequestHeader("Content-Type", "text/xml;charset=UTF-8");
			} else {
				client.setRequestHeader("x-li-format", 'json');
			}

			//client.setRequestHeader("Content-Type", "text/xml;charset=UTF-8");
			client.send(parameterMap);
			if (client.status == 200) {
				Ti.UI.createAlertDialog({
					title : pTitle,
					message : pSuccessMessage
				}).show();
			} else {
				Ti.UI.createAlertDialog({
					title : pTitle,
					message : pErrorMessage
				}).show();
			}
			return client.responseText;
		} catch(ex) {
			Ti.App.hideIndicator();
		}
	};
	this.send = send;
};
