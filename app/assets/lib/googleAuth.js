var isAndroid = (Ti.Platform.osname == 'android') ? true : false;
var GoogleAuth = function(o) {
	var _version = '0.3.2';
	o = (o) ? o : {};
	var _opt = {
		clientId : (o.clientId) ? o.clientId : null,
		clientSecret : (o.clientSecret) ? o.clientSecret : null,
		propertyName : (o.propertyName) ? o.propertyName : 'googleToken',
		url : 'https://accounts.google.com/o/oauth2/auth',
		scope : (o.scope),
		closeTitle : (o.closeTitle) ? o.closeTitle : 'Close',
		winTitle : (o.winTitle) ? o.winTitle : 'Google Account',
		errorText : (o.errorText) ? o.errorText : 'Can not authorize user!',
		winColor : (o.winColor) ? o.winColor : '#000',
		quiet : ( typeof (o.quiet) === 'undefined') ? true : o.quiet
	};
	var log = function() {
	};
	log.error = function(t) {
		if (!_opt.quiet) {
			Ti.API.error('' + t);
		}
	};
	log.info = function(t) {
		if (!_opt.quiet) {
			Ti.API.info(t);
		}
	};
	log.debug = function(t) {
		if (!_opt.quiet) {
			Ti.API.debug('' + t);
		}
	};
	log.trace = function(t) {
		if (!_opt.quiet) {
			Ti.API.trace('' + t);
		}
	};
	//UTILS
	log.info('-------------------------------------');
	log.info('| Google Account Authentification   |');
	log.info('| Titanium Module (v.:' + _version + ')        |');
	log.info('| by Miroslav Magda                 |');
	log.info('-------------------------------------');
	var win;
	var _prop = {};
	_prop.accessToken = null;
	_prop.refreshToken = null;
	_prop.tokenType = null;
	_prop.expiresIn = 0;
	var prop = {};
	prop = getProps();
	if (prop.expiresIn >= (new Date()).getTime()) {
		log.info('GoogleAuth: Access code valid');
		_prop = prop;
	}/*else {
	 log.info('GoogleAuth: Access code not valid. Refreshing...');
	 _prop = prop;
	 refreshToken();
	 }*/
	function getProps() {
		var p = {};
		p.accessToken = Ti.App.Properties.getString(_opt.propertyName + '.accessToken');
		p.refreshToken = Ti.App.Properties.getString(_opt.propertyName + '.refreshToken');
		p.tokenType = Ti.App.Properties.getString(_opt.propertyName + '.tokenType');
		p.expiresIn = Ti.App.Properties.getString(_opt.propertyName + '.expiresIn');
		return p;
	}

	function authorize(cb) {
		try {
			var navigationBar = null;
			var titleLabel = null;
			var close_btn = null;
			var url = prepareUrl();
			var c = 0;
			var style = null;

			cb = (cb) ? cb : function() {
			};

			var spinner = Ti.UI.createActivityIndicator({
				zIndex : 1,
				height : 50,
				width : 50,
				hide : true,
				//style : style
			});
			if (OS_IOS) {
				win = Ti.UI.createWindow({
					modal : true,
					fullscreen : true
				});
				var btn = Titanium.UI.createButton({
					left : 10,
					height : 29,
					width : 62,
					title : 'Cancel'
				});
				var webview = Titanium.UI.createWebView({
					width : '100%',
					height : '100%',
					top : 45,
					url : url
				});
				var view = Titanium.UI.createView({
					top : 0,
					left : 0,
					right : 0,
					height : 45,
					backgroundColor : 'white'
				});
				btn.addEventListener('click', function() {
					Ti.App.hideIndicator();
					win.close();
				});
				view.add(btn);
				win.add(view);
			} else {
				win = Ti.UI.createWindow({
					statusBarHidden : true,
					navBarHidden : true,
					exitOnClose : false,
					orientationModes : [Ti.UI.PORTRAIT]
				});
				var btn = Titanium.UI.createButton({
					title : 'Cancel',
					backgroundColor : 'gray',
					top : 10,
					left : 10,
					height : 40,
					width : 100
				});
				var view = Titanium.UI.createView({
					top : 0,
					left : 0,
					right : 0,
					height : 70,
					backgroundColor : 'white'
				});
				var webview = Titanium.UI.createWebView({
					width : '100%',
					height : '100%',
					top : 70,
					url : url
				});

				btn.addEventListener('click', function() {
					Ti.App.hideIndicator();
					win.close();
				});
				view.add(btn);
				win.add(view);
			}
			webview.addEventListener('load', function(e) {
				c++;
				var accessDenied = webview.evalJS('document.getElementById("access_denied").value;');
				if (accessDenied != '') {
					log.debug('GoogleAuth: Access denied!');
					Ti.App.Properties.setString(_opt.propertyName + '.accessToken', '');
					Ti.App.Properties.setString(_opt.propertyName + '.refreshToken', '');
					Ti.App.Properties.setString(_opt.propertyName + '.tokenType', '');
					Ti.App.Properties.setString(_opt.propertyName + '.expiresIn', 0);
					_prop.accessToken = null;
					_prop.refreshToken = null;
					_prop.tokenType = null;
					_prop.expiresIn = 0;
					win.close();
				}
				var code = webview.evalJS('document.getElementById("code").value;');
				if (code != '') {
					log.debug('GoogleAuth: Access granted!');
					webview.hide();
					spinner.show();
					//log.info('Code: ' + code);
					getToken(code, cb);
				}
				if (c > 10) {
					//some error (to many requests :) )
					log.debug('GoogleAuth: To many redirects...');
					win.close();
				}
			});

			win.add(webview);
			win.add(spinner);
			win.open();

		} catch(erp) {
			Titanium.API.info("ERP:" + erp);
			win.close();
		}
	}

	function deAuthorize(cb) {

		cb = (cb) ? cb : function() {
		};

		//isAuthorized() = false;
		Titanium.API.info('GoogleAuth: User logging out...' + isAuthorized());
		if (isAuthorized()) {
			Titanium.API.info("=======");
			var logoutWin = Ti.UI.createWindow({
				backgroundColor : 'white',
				barColor : _opt.winColor,
				visible : false,
				title : _opt.winTitle
			});
			var close = Ti.UI.createButton({
				title : _opt.closeTitle
			});
			var spinner = Ti.UI.createActivityIndicator({
				zIndex : 1,
				height : 50,
				width : 50,
				//style : style
			});
			logoutWin.rightNavButton = close;
			close.addEventListener('click', function() {

				logoutWin.close();
			});
			var webview = Titanium.UI.createWebView({
				width : '100%',
				height : '100%',
				//opacity : 0,
				url : 'https://accounts.google.com/Logout'
			});
			logoutWin.add(spinner);
			logoutWin.add(webview);
			webview.addEventListener('load', function(e) {
				var t = setTimeout(function() {
					logoutWin.close();
					cb();
					//w.remove(webview);
				}, 500);
				Ti.App.Properties.setString(_opt.propertyName + '.accessToken', '');
				Ti.App.Properties.setString(_opt.propertyName + '.refreshToken', '');
				Ti.App.Properties.setString(_opt.propertyName + '.tokenType', '');
				Ti.App.Properties.setString(_opt.propertyName + '.expiresIn', 0);
				_prop.accessToken = null;
				_prop.refreshToken = null;
				_prop.tokenType = null;
				_prop.expiresIn = 0;
			});
			logoutWin.open();
		}
	}

	/**
	 * Refresh token
	 */
	function refreshToken(cbSuccess, cbError) {
		log.info('GoogleAuth: Access code not valid. Refreshing...');
		cbSuccess = (cbSuccess) ? cbSuccess : function() {
		};
		cbError = (cbError) ? cbError : function() {
		};
		var xhr = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				//log.info("Received text: " + this.responseText);
				var resp = JSON.parse(this.responseText);
				resp.expires_in = parseFloat(resp.expires_in, 10) * 1000 + (new Date()).getTime();
				Ti.App.Properties.setString(_opt.propertyName + '.accessToken', resp.access_token);
				Ti.App.Properties.setString(_opt.propertyName + '.tokenType', resp.token_type);
				Ti.App.Properties.setString(_opt.propertyName + '.expiresIn', resp.expires_in);
				_prop.accessToken = resp.access_token;
				_prop.tokenType = resp.token_type;
				_prop.expiresIn = resp.expires_in;
				log.debug(_prop);
				//win.close();
				cbSuccess();
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				log.info(e.error);
				log.info(e.responseText);
				cbError();
				//ERROR
				Titanium.UI.createAlertDialog({
					title : 'Error',
					message : _opt.errorText
				});
				cbError();
				//authorize();
			},
			timeout : 5000 /* in milliseconds */
		});
		// Prepare the connection.
		xhr.open("POST", _opt.url);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		var d = {
			client_id : _opt.clientId,
			client_secret : _opt.clientSecret,
			refresh_token : _prop.refreshToken,
			grant_type : 'refresh_token'
		};
		// Send the request.
		xhr.send(d);
	}

	/**
	 * Get TOKEN
	 */
	function getToken(code, cb) {
		cb = (cb) ? cb : function() {
		};

		var xhr = Ti.Network.createHTTPClient({
			// function called when the response data is available
			onload : function(e) {
				//log.info("Received text: " + this.responseText);
				var resp = JSON.parse(this.responseText);

				log.info(resp.expires_in);
				resp.expires_in = parseFloat(resp.expires_in, 10) * 1000 + (new Date()).getTime();
				log.info(resp.expires_in);

				Titanium.API.info('this is ok');

				Ti.App.Properties.setString(_opt.propertyName + '.accessToken', resp.access_token);
				Ti.App.Properties.setString(_opt.propertyName + '.refreshToken', resp.refresh_token);
				Ti.App.Properties.setString(_opt.propertyName + '.tokenType', resp.token_type);
				Ti.App.Properties.setString(_opt.propertyName + '.expiresIn', resp.expires_in);

				Titanium.API.info("=jayesh=resp.access_token" + resp.access_token);
				Titanium.API.info("=jayesh=resp.refresh_token" + resp.refresh_token);
				Titanium.API.info("=jayesh=resp.token_type" + resp.token_type);
				Titanium.API.info("=jayesh=resp.expiresIn" + resp.expiresIn);

				_prop.accessToken = resp.access_token;
				_prop.refreshToken = resp.refresh_token;
				_prop.tokenType = resp.token_type;
				_prop.expiresIn = resp.expires_in;
				log.debug(_prop);
				setTimeout(function(e1) {
					Ti.App.fireEvent("googleUserPrfile");
				}, 200);
				win.close();
				//callback
				cb();
			},
			// function called when an error occurs, including a timeout
			onerror : function(e) {
				//log.info(e.error);
				//log.info(e.responseText);
				//TODO: show some error message
				Titanium.UI.createAlertDialog({
					title : 'Error',
					message : _opt.errorText
				});
				win.close();
			},
			timeout : 5000 /* in milliseconds */
		});
		// Prepare the connection.
		xhr.open("POST", 'https://accounts.google.com/o/oauth2/token');
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		var d = {
			code : code,
			client_id : _opt.clientId,
			client_secret : _opt.clientSecret,
			redirect_uri : 'urn:ietf:wg:oauth:2.0:oob',
			grant_type : 'authorization_code'
		};
		// Send the request.
		xhr.send(d);
	}

	/**
	 * Prepare url from options
	 */
	function prepareUrl() {
		//encodeURIComponent(_opt.scope.join('+'))
		var scope = [];
		for (var i = 0; i < _opt.scope.length; i++) {
			scope[i] = encodeURIComponent(_opt.scope[i]);
		}
		var url = _opt.url + '?' + 'approval_prompt=force&scope=' + scope.join('+') + '&' + 'redirect_uri=urn:ietf:wg:oauth:2.0:oob' + '&' + 'response_type=code' + '&' + 'client_id=' + _opt.clientId + '&' + 'btmpl=mobile' + '';
		log.debug(url);
		return url;
	}

	function isAuthorized(cbSuccess, cbError) {
		cbSuccess = (cbSuccess) ? cbSuccess : function() {
		};
		cbError = (cbError) ? cbError : function() {
		};
		_prop = getProps();
		log.debug('Properties: ' + JSON.stringify(_prop));
		Titanium.API.info("PROPERTRIES:" + JSON.stringify(_prop));
		if (_prop.accessToken != null && _prop.accessToken != '') {
			if (_prop.expiresIn < (new Date()).getTime()) {
				refreshToken(cbSuccess, cbError);
			} else {
				cbSuccess();
			}
			return true;
		} else {
			cbError();
		}
		return false;
	}

	function getAccessToken() {
		return _prop.accessToken;
	}

	return {
		isAuthorized : isAuthorized,
		deAuthorize : deAuthorize,
		getAccessToken : getAccessToken,
		refreshToken : refreshToken,
		authorize : authorize,
		version : _version
	};
};
module.exports = GoogleAuth;
