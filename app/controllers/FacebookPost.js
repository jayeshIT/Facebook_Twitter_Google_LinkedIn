try {
	Ti.include('/lib/birdhouse.js');
	Ti.include('/lib/constants.js');
	function trimAll(sString) {
		while (sString.substring(0, 1) == ' ') {
			sString = sString.substring(1, sString.length);
		}
		while (sString.substring(sString.length - 1, sString.length) == ' ') {
			sString = sString.substring(0, sString.length - 1);
		}
		return sString;
	}

	var fb = require('facebook');
	fb.appid = 230793207000101;
	fb.permissions = ['publish_stream', 'read_stream', 'email', 'user_location', 'user_videos', 'user_birthday', 'user_actions.video', 'user_photos', 'export_stream', 'photo_upload', 'read_friendlists', 'status_update', 'xmpp_login', 'video_upload', 'user_actions.video'];
	fb.forceDialogAuth = true;
	// text Field to enter share Text
	var chars = ( typeof ($.textshare) != 'undefined' && $.textshare != null) ? $.textshare.length : 0;
	$.textshare.addEventListener('change', function(e) {
		var chars = (140 - $.textshare.value.length);
		if ($.textshare.value.length > 140) {
			alert('More than 140 not allowd');
			return;
		}
		$.textlengthlabel.text = parseInt(chars);
	});
	$.poststatus.addEventListener('click', function(e) {
		$.textshare.blur();
		if (Titanium.Network.online) {
			if ($.textshare.value.trim().length == 0) {
				alert('Please enter text');
				return;
			}
			if (fb.loggedIn) {
				Ti.App.showIndicator();
				fb.requestWithGraphPath('me/feed', {
					message : $.textshare.value
				}, "POST", function(e) {
					if (e.success) {
						alert("SuccessFully Posted on facebook.");
						Ti.App.hideIndicator();
						$.textshare.value = '';
						$.textlengthlabel.text = '0';
					} else {
						if (e.error) {
							alert('Error while Post' + e.error);
							Ti.App.hideIndicator();
						} else {
							alert("Unkown result");
							Ti.App.hideIndicator();
						}
					}
				});
			} else {
				alert('Please login to facebook.');
			}
		} else {
			alert("Please turn on your internet connection.");
		}
	});

	$.postphoto.addEventListener('click', function(e) {
		if (Titanium.Network.online) {
			if (fb.loggedIn) {
				var dialog = Titanium.UI.createOptionDialog({
					options : ['Choose From Library', 'Take New Photo', 'Cancel'],
					cancel : 2,
				});
				dialog.show();
				dialog.addEventListener('click', function(e) {
					if (e.index == 0) {
						Titanium.Media.openPhotoGallery({
							success : function(event) {
								pic = event.media;
								var imageView = Titanium.UI.createImageView({
									image : pic,
									width : 200,
									height : 200
								});
								pic = imageView.toBlob();
								var data = {
									picture : pic
								};
								Ti.App.showIndicator();
								fb.requestWithGraphPath('me/photos', data, "POST", showRequestResult);
								Ti.App.hideIndicator();
							},
							cancel : function() {
								Ti.App.hideIndicator();
								alert('You Canceled.');

							},
							error : function(error) {
								Ti.App.hideIndicator();
								alert('Erroe occurs while posting.');
							},
							mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
						});
					} else if (e.index == 1) {
						Titanium.Media.showCamera({
							success : function(event) {
								pic = event.media;
								var imageView = Titanium.UI.createImageView({
									image : pic,
									width : 200,
									height : 200
								});
								pic = imageView.toBlob();
								var data = {
									picture : pic
								};
								Ti.App.showIndicator();
								fb.requestWithGraphPath('me/photos', data, "POST", showRequestResult);
								Ti.App.hideIndicator();
							},
							cancel : function() {
								Ti.App.hideIndicator();
								alert('You Canceled');

							},
							error : function(error) {
								var a = Titanium.UI.createAlertDialog({
									title : 'Camera'
								});
								if (error.code == Titanium.Media.NO_CAMERA) {
									a.setMessage('No Camera detcted.');
								} else {
									a.setMessage('Unexpected error: ' + error.code);
								}
								a.show();
							},
							mediaTypes : Ti.Media.MEDIA_TYPE_PHOTO,
							showControls : true
						});
					}
				});
			} else {
				alert('Please login to facebook.');
			}
		} else {
			alert("Please turn on your internet connection.");
		}
	});
	var iter = 0;
	$.postdiaglog.addEventListener('click', function(e) {
		if (Titanium.Network.online) {
			if (fb.loggedIn) {
				iter++;
				var data = {
					link : "https://titanium.rpxnow.com/",
					name : "My demo of Titanium (iteration " + iter + ")",
					message : "Awesome SDKs for building desktop and mobile apps",
					caption : "My demo of Titanium (iteration " + iter + ")",
					picture : "http://developer.appcelerator.com/assets/img/DEV_titmobile_image.png",
					description : "You've got the ideas, now you've got the power. Titanium translates your hard won web skills..."
				};
				fb.dialog("feed", data, showRequestResult);
				Ti.App.hideIndicator();
			} else {
				alert('Please login to Facebook');
			}
		} else {
			alert("Please turn on your internet connection.");
		}
	});

	function showRequestResult(e) {
		var s = '';
		if (e.success) {
			s = "SuccessFully posted on Facebook";
			if (e.result) {
				//s += "; " + e.result;
			}
			if (e.data) {
				//s += "; " + e.data;
			}
			if (!e.result && !e.data) {
				s = '"success", but no data from FB.  I am guessing you cancelled the dialog.';
			}
		} else if (e.cancelled) {
			s = "You Cancelled.";
		} else {
			s = "FAilde To paost \nPlease try Again.";
			if (e.error) {
				s += "; " + e.error;
			}
		}
		Ti.App.hideIndicator();
		alert(s);
	}

} catch(excption) {
	Titanium.API.info('------Execption-----:' + excption);
}
$.backbutton.addEventListener('click', function(e) {
	$.FacebookPost.close();
});
