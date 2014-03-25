$.backbutton.addEventListener('click', function(e) {
	$.FacebookFriends.close();
});

var fb = require('facebook');
fb.appid = 230793207000101;
fb.permissions = ['publish_stream', 'read_stream', 'email', 'user_location', 'user_videos', 'user_birthday', 'user_actions.video', 'user_photos', 'export_stream', 'photo_upload', 'read_friendlists', 'status_update', 'xmpp_login', 'video_upload', 'user_actions.video'];
var Users_FB = [];
var search = Titanium.UI.createSearchBar({
	showCancel : false,
	hintText : 'Search',
	autocorrect : false
});
search.addEventListener('blur', function() {
	if (Ti.Platform.name === "android") {
		Ti.UI.Android.hideSoftKeyboard();
	}
});
$.table1.search = search;
var getfacebookFriendslist = function() {
	if (Ti.Network.online) {
		Ti.App.showIndicator();
		var xhr = Titanium.Network.createHTTPClient();
		var url = "https://graph.facebook.com/me/friends?access_token=" + Titanium.App.Properties.getString('token');
		Titanium.API.info("URL:" + url);
		xhr.onload = function() {
			if (this.responseText != null && this.responseText != "") {
				Titanium.API.info("FRIENDS:" + this.responseText);
				try {
					var json = JSON.parse(this.responseText);
					Users_FB = [];
					for (var i = 0; i < json.data.length; i++) {
						var rowUsers = Titanium.UI.createTableViewRow({
							height : (Titanium.Platform.osname != "android") ? 70 : 100,
							width : 307,
							backgroundImage : '/LestingStripBackground.png',
							backgroundSelectedColor : "transparent",
							selectionStyle : (Ti.Platform.osname != "android") ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : "",
							fb_id : json.data[i].id,
							fb_name : json.data[i].name,
							title : (Titanium.Platform.osname == "android") ? json.data[i].name : ""
						});
						if (OS_IOS) {
							var view_frame = Titanium.UI.createImageView({
								left : 10,
								top : 6,
								height : 55,
								width : 55,
								image : "/LestingframeBackground.png"
							});
							var img_avatar = Ti.UI.createImageView({
								top : 2,
								left : 2,
								height : 46,
								width : 48
							});
							var name_lbl = Titanium.UI.createLabel({
								top : 20,
								height : 20,
								left : 85,
								font : {
									fontSize : 15
								},
								color : 'black'
							});
							var Message = Titanium.UI.createButton({
								right : 10,
								height : 30,
								title : 'Message',
								cust_id : 'Message'
							});
						} else {
							var view_frame = Titanium.UI.createImageView({
								left : 8,
								height : 75,
								width : 75,
								image : "/LestingframeBackground.png"
							});
							var img_avatar = Ti.UI.createImageView({
								left : 10,
								top : 10,
								height : 75,
								width : 75,
								defaultImage : "/LestingframeBackground.png"
							});
							var name_lbl = Titanium.UI.createLabel({
								top : 30,
								height : 25,
								left : 110,
								font : {
									fontSize : 20
								},
								color : 'black'
							});
							var Message = Ti.UI.createButton({
								right : 10,
								height : 50,
								title : 'Message',
								cust_id : 'Message'
							});
						}
						Titanium.API.info('-----Profile Pic-----' + "https://graph.facebook.com/" + json.data[i].id + "/picture");
						img_avatar.image = "https://graph.facebook.com/" + json.data[i].id + "/picture";
						view_frame.add(img_avatar);
						rowUsers.add((Titanium.Platform.osname != "android") ? view_frame : img_avatar);
						name_lbl.text = json.data[i].name;
						rowUsers.add(name_lbl);
						rowUsers.filter = name_lbl.text;
						//rowUsers.add(Message);
						Users_FB.push(rowUsers);
					}
					Users_FB.sort(compare);
					$.table1.setData(Users_FB);
					Ti.App.hideIndicator();
				} catch(exceptions) {
					Ti.App.hideIndicator();
					Titanium.API.info("EXCEPTION-------:" + exceptions);
					alert("Error in download data..Please try again.");
				}
			} else {
				Ti.App.hideIndicator();
				alert("Error in download data..Please try again.");
			}
		};
		xhr.onerror = function() {
			Ti.App.hideIndicator();
			Titanium.API.info("XHR Erro in Get Friends ------ : " + JSON.stringify(e));
			alert("Error in download data..Please try again.");
		};
		xhr.open("GET", url);
		xhr.send();
	} else {
		alert("Please turn on your internet connection.");
	}
};
function compare(a, b) {
	if ((a.fb_name != null ? a.fb_name : "").charAt(0).toString().toLowerCase() < (b.fb_name != null ? b.fb_name : "").charAt(0).toString().toLowerCase()) {
		return -1;
	} else {
		return 1;
	}
};
$.table1.addEventListener('click', function(e) {
	Titanium.API.info('------- Data:------' + JSON.stringify(e));
	Titanium.API.info('------- E.source:------' + JSON.stringify(e.source));
	//var data_arr = [];
	//data_arr.push(e.row.fb_id);
	if (e.source.cust_id == 'Message') {
		search.blur();
		fb.dialog('send', {
			appId : 230793207000101,
			redirect_uri : 'https://www.facebook.com/pintoojoshi',
			to : e.row.fb_id,
			link : "https://www.facebook.com/pintoojoshi",
			//status : true,
			//access_token : Titanium.App.Properties.getString('token'),
			//frictionlessRequests : true,
		}, function(e) {
			if (e.success && e.result) {
				alert("Message has been sent to the selected friends.");
			} else if (e.error) {
				alert("Error occurred while sending Message. Please try again.");
			} else if (e.cancelled) {
			} else {
			}
		});
	}
});

getfacebookFriendslist();
