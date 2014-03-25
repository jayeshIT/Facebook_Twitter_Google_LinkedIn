try {
	Ti.include('/lib/birdhouse.js');
	Ti.include('/lib/constants.js');
	var on_click_flag = false;
	var counter_google = null;
	//------------------Facebook start-------------------------//
	var fb = require('facebook');
	fb.appid = 230793207000101;
	fb.permissions = ['publish_stream', 'read_stream', 'email', 'user_location', 'user_videos', 'user_birthday', 'user_actions.video', 'user_photos', 'export_stream', 'photo_upload', 'read_friendlists', 'status_update', 'xmpp_login', 'video_upload', 'user_actions.video'];
	fb.forceDialogAuth = true;
	fb.addEventListener('login', function(e) {
		if (e.success) {
			var xhr = Ti.Network.createHTTPClient();
			Titanium.App.Properties.setString('token', fb.getAccessToken());
			xhr.open("GET", 'https://graph.facebook.com/?ids=' + fb.uid + '&access_token=' + Titanium.App.Properties.getString('token'));
			xhr.setTimeout(1000);
			xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			xhr.onload = function() {
				Titanium.API.info(' autorise success');
				if (this.responseText != null && this.responseText != "") {
					Titanium.API.info("USER DATA:" + this.responseText);
					Titanium.App.Properties.setString('login_user', this.responseText);
					Titanium.App.Properties.setString('image', "https://graph.facebook.com/" + fb.uid + "/picture");
					Titanium.App.Properties.setString('uid', fb.uid);
					var json = JSON.parse(this.responseText);
					var fb_name = json[fb.uid].name;
					alert('Login As \n' + fb_name);
					Alloy.Globals.social = 'facebook';
					$.facebook.enabled = false;
					$.facebook_logout.visible = true;
					//var postWinPostFacebookTwitter = Alloy.createController('PostFacebookTwitter').getView();
					//postWinPostFacebookTwitter.open();
					var FaceBookMainWin = Alloy.createController('FacebookMain').getView();
					FaceBookMainWin.open();

				}

			};
			xhr.onerror = function() {
				alert("Error while login facebook...Please try again");
			};
			xhr.send();
		} else if (e.cancelled) {
		} else if (e.error) {
			alert("Error while login facebook...Please try again");
		} else {
			alert("Please turn on your internet connection.");
		}
	});
	$.facebook.addEventListener('click', function(e) {
		if (Titanium.Network.online) {
			if (!fb.loggedIn) {
				fb.authorize();
			} else {
				//var postWinPostFacebookTwitter = Alloy.createController('PostFacebookTwitter').getView();
				//$.facebook_logout.visible = true;
				//postWinPostFacebookTwitter.open();
				var FaceBookMainWin = Alloy.createController('FacebookMain').getView();
				$.facebook_logout.visible = true;
				FaceBookMainWin.open();
			}
		} else {
			alert("Please turn on your internet connection.");
		}
	});
	//---------Facebook logout---------///
	$.facebook_logout.addEventListener('click', function(e) {
		fblog = true;
		var FB_logout = function(evt) {
			if (fblog == true) {
				fblog = false;
				alert("You successfully logged out from facebook.");
				Titanium.App.Properties.removeProperty('token');
				var client = Titanium.Network.createHTTPClient();
				client.clearCookies('https://login.facebook.com');
				$.facebook.enabled = true;
				$.facebook_logout.visible = false;
			}
		};
		fb.addEventListener('logout', FB_logout);
		fb.logout();
	});
	//-----------------Facebook Ends.-----------------------//

	//---------Twitter Starts--------------------------------//
	var BH = new BirdHouse({
		consumer_key : "ve08I0NlF2WzzTiOL5b3g",
		consumer_secret : "t01y1Xl4VoUfhg1YewgOXjOLHTVZnFNIRly8Vl8Q",
		callback_url : "http://www.appcelerator.com"
	});
	$.twitter.addEventListener('click', function(e) {
		if (Titanium.Network.online) {
			Ti.App.showIndicator();
			BH.authorize(function(e) {
				if (e === true) {
					alert('Login As \n' + Ti.App.Properties.getString('ttname'));
					Alloy.Globals.social = 'twitter';
					$.twitter_logout.visible = true;
					$.twitter.enabled = false;
					Ti.App.hideIndicator();
					var TwitterMainWin = Alloy.createController('TwitterMain').getView();
					TwitterMainWin.open();
				} else {
					Ti.App.hideIndicator();
					alert('Failed to authorize Twitter \n Please try again.');
				}
			});
		} else {
			alert('Please turn on internet connection.');
		}
	});
	//---------Twitter logout---------///
	var twitter_logout = function() {
		logout_flag = true;
		if (logout_flag == true) {
			BH.deauthorize(function(e) {
				if (e === true) {
					Ti.App.Properties.removeProperty('ttname');
					alert("You successfully logged out from twitter.");
					var client = Titanium.Network.createHTTPClient();
					client.clearCookies('https://twitter.com/');
					$.twitter.enabled = true;
					$.twitter_logout.visible = false;
				} else {
					alert('Failed to deauthorize Twiiter \n Please try again.');
				}
			});
			logout_flag = false;
		}
	};
	$.twitter_logout.addEventListener('click', function(e) {
		twitter_logout();
	});
	//--------------------Twitter over---------------------------///
	//-------------------------Google Plus start-------------------------///
	var counter_google = 0;
	function google_profile_response_subroutine() {
		if (Ti.Network.online) {
			Titanium.API.info("AGAIN CALL");
			counter_google++;
			Titanium.API.info("ANZ" + googleAuth);
			if (googleAuth && googleAuth != null) {
				var access_token = googleAuth.getAccessToken();
				Ti.API.info("access_token=" + access_token);
				Ti.API.info("GOOLGE COUNTER +" + counter_google);
				var xhr = Ti.Network.createHTTPClient();
				xhr.onload = function(e) {
					Ti.API.info("Response:" + this.responseText);
					var response_Text = this.responseText;
					var em = JSON.parse(this.responseText).email;
					Ti.App.Properties.setString('gpid', JSON.parse(this.responseText).id);
					Titanium.API.info("MY EMAIL ID:" + em);
					Ti.App.hideIndicator();
					alert('Login As \n' + em);
					//var postWin = Alloy.createController('postWindow').getView();
					//postWin.open();
					$.googleplus.enabled = false;
					$.googleplus_logout.visible = true;
				};
				xhr.onerror = function(e) {
					Titanium.API.info("XHR :ERROR");
					alert(e.error);
				};
				xhr.setTimeout(5000);
				Titanium.API.info("ACT:" + 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + access_token);
				xhr.open("GET", 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + access_token);
				xhr.send(null);
			} else {
				Ti.API.info("null obje" + googleAuth);
			}
		} else {
			alert('Please turn on internet connection.');
		}
	};
	function login_via_google_subroutine() {
		if (Ti.Network.online) {
			//Ti.App.showIndicator();
			if (on_click_flag == false) {
				on_click_flag = true;
				setTimeout(function(e) {
					on_click_flag = false;
				}, 1000);

				var GoogleAuth = require('/lib/googleAuth');
				googleAuth = new GoogleAuth({
					clientId : '392532354152-92cb595he10caa7popsui66de17bq9h6.apps.googleusercontent.com',
					clientSecret : 'miOX8IXD1pEQKKF-vb_fwDDn',
					propertyName : 'googleToken',
					quiet : false,
					scope : ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
				});
				Alloy.Globals.social_provider = "google";
				if (googleAuth.isAuthorized() == false) {
					Ti.API.info(" Alloy.Globals.googleAuth.authorize:" + counter_google);
					googleAuth.authorize();
				} else {
					google_profile_response_subroutine();
				}
			}
		} else {

			alert('Please turn on internet connection.');
		}
	};
	Titanium.App.addEventListener('googleUserPrfile', google_profile_response_subroutine);
	$.googleplus.addEventListener('click', function(e) {
		login_via_google_subroutine();
	});
	//---------- Google+ Logout---------------------//
	$.googleplus_logout.addEventListener('click', function(e) {
		var GoogleAuth = require('/lib/googleAuth');
		googleAuth = new GoogleAuth({
			clientId : '392532354152-25jikcvct380jgufdb5o6g3r6v6ujfu9.apps.googleusercontent.com',
			clientSecret : '7wmglCEYJ-ricy9-ewRgUnri',
			propertyName : 'googleToken',
			quiet : false,
			scope : ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']

		});
		googleAuth.deAuthorize();
		alert("You successfully logged out from Google+.");
		var client = Titanium.Network.createHTTPClient();
		client.clearCookies('https://accounts.google.com');
		$.googleplus.enabled = true;
		$.googleplus_logout.visible = false;
	});
	//-----------------Google Plus Ends--------------------------///
	//--------------------LinkedIn start-------------------------///
	$.linkedin.addEventListener('click', function(e) {
		if (Titanium.Network.online) {
			try {
				Ti.App.showIndicator();
				Ti.include('/lib/linkedin_module-min.js');
				linkedInModule.init('VdokpSBTWJxtFq2G', 'rqqdcsikdga6');
				linkedInModule.getUser(function(_d) {
					Ti.API.info('THE JSON:' + _d);
					Alloy.Globals.social = 'linkedin';
					Alloy.Globals.mainlogin = 'ln';
					$.linkedin.enabled = false;
					$.linkedin_logout.visible = true;
					Ti.App.hideIndicator();
					var linkedInMain = Alloy.createController('linkedInMain').getView();
					linkedInMain.open();
				});
			} catch(ex) {
				Ti.API.info(ex);
			}
		} else {
			alert('Please turn on internet connection.');
		}
		//-------LinkedIn logout----------------
		$.linkedin_logout.addEventListener('click', function(e) {
			alert("You successfully logged out from LinkedIn.");
			var client = Titanium.Network.createHTTPClient();
			client.clearCookies('http://in.linkedin.com/');
			Alloy.Globals.deletealls("linkedin");
			$.linkedin.enabled = true;
			$.linkedin_logout.visible = false;
		});
	});
	//--------------------------LinkedIn Ends----------------------------///
	$.container.open();
} catch(excption) {
	Titanium.API.info("The Exception:" + excption);
}
