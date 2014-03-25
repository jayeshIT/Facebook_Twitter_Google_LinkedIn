$.backbutton.addEventListener('click', function(e) {
	$.TwitterMyFollowers.close();
});
var Followers = [];

var BH = new BirdHouse({
	consumer_key : "ve08I0NlF2WzzTiOL5b3g",
	consumer_secret : "t01y1Xl4VoUfhg1YewgOXjOLHTVZnFNIRly8Vl8Q",
	callback_url : "http://www.appcelerator.com"
});

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
$.tableFollowers.search = search;

var viewMessage = Titanium.UI.createView({
	top : 0,
	left : 0,
	backgroundColor : 'gray',
	visible : false,
	height : Titanium.Platform.displayCaps.platformHeight,
	width : Titanium.Platform.displayCaps.platformWidth
});
var title_messaage = Titanium.UI.createLabel({
	top : 10,
	left : 10,
	font : {
		fontSize : 16,
		fontWeight : 'bold'
	},
	color : 'black'
});
var textArea_Mesage = Titanium.UI.createTextArea({
	top : 70,
	left : 10,
	right : 10,
	height : 200,
	color : 'black',
	backgroundColor : 'white',
	zIndex : 0
});
if (OS_IOS) {

	var send_button = Titanium.UI.createButton({
		top : 290,
		left : 10,
		height : 40,
		width : 80,
		title : 'Send'
	});
	var cancel_button = Titanium.UI.createButton({
		top : 290,
		left : 100,
		height : 40,
		width : 80,
		title : 'Cancel'
	});
} else {

	var send_button = Titanium.UI.createButton({
		top : 290,
		left : 10,
		width : 130,
		title : 'Send'
	});
	var cancel_button = Titanium.UI.createButton({
		top : 290,
		left : 150,
		width : 150,
		title : 'Cancel'
	});
}

cancel_button.addEventListener('click', function(e) {
	textArea_Mesage.blur();
	viewMessage.zIndex = 0;
	viewMessage.visible = false;
});
send_button.addEventListener('click', function(e) {
	textArea_Mesage.blur();
	if (textArea_Mesage.value.trim().length == 0) {
		alert('Please Enter Message.');
		return;
	}
	Titanium.API.info('---Send to :' + Alloy.Globals.send_id);
	//viewMessage.zIndex = 0;
	//viewMessage.visible = false;
	BH.send_message('text=' + textArea_Mesage.value + '&user_id=' + Alloy.Globals.send_id, function(resp) {
		Titanium.API.info('---xhr response in End function :' + resp);
		if (resp != null && resp != "" && resp != false && resp != undefined && resp != 0) {
			Ti.App.hideIndicator();
			textArea_Mesage.value = '';
			viewMessage.zIndex = 0;
			viewMessage.visible = false;
			alert('Message send Successfully.');
		} else {
			Ti.App.hideIndicator();
			alert("Sending Failed.");
		}
	});

});
viewMessage.add(title_messaage);
viewMessage.add(textArea_Mesage);
viewMessage.add(send_button);
viewMessage.add(cancel_button);
$.TwitterMyFollowers.add(viewMessage);

var cursor1 = -1;
function GetFollowers(cursorData) {
	Titanium.API.info('------Cursor:------:' + cursorData);
	Ti.App.showIndicator();
	//BH.get_followers('cursor=' + cursorData + 'screen_name=' + Ti.App.Properties.getString('ttname') + 'skip_status=' + true + 'include_user_entities=' + false, function(resp) {
	BH.get_Myfollowers('cursor=' + cursorData + '&screen_name=' + Ti.App.Properties.getString('ttname') + '&skip_status=' + true + '&include_user_entities=' + false, function(resp) {
		Titanium.API.info('----Resoponse user Followers------' + JSON.parse(resp));
		try {

			if (resp != null && resp != "" && resp != false && resp != undefined && resp != 0) {
				var JSobj = JSON.parse(resp);
				Followers = [];
				Titanium.API.info('------Length------' + JSobj.users.length);
				for (var i = 0; i < JSobj.users.length; i++) {

					var rowFollowers = Titanium.UI.createTableViewRow({
						height : (Titanium.Platform.osname != "android") ? 80 : 100,
						width : 307,
						backgroundImage : '/LestingStripBackground.png',
						backgroundSelectedColor : "transparent",
						selectionStyle : (Ti.Platform.osname != "android") ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : "",
						id : JSobj.users[i].id,
						name : JSobj.users[i].name,
						title : (Titanium.Platform.osname == "android") ? JSobj.users[i].name : ""
					});

					if (OS_IOS) {
						var view_frame = Titanium.UI.createImageView({
							left : 10,
							height : 55,
							width : 55,

						});
						var name_lbl = Titanium.UI.createLabel({
							top : 5,
							height : 20,
							left : 85,
							font : {
								fontSize : 15
							},
							color : 'black'
						});
						var location_lbl = Titanium.UI.createLabel({
							left : 85,
							top : 30,
							font : {
								fontSize : 13
							},
							color : 'gray'
						});
						var time_lbl = Titanium.UI.createLabel({
							left : 85,
							bottom : 5,
							font : {
								fontSize : 12
							},
							color : 'gray'
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
							//image : "/LestingframeBackground.png"
						});

						var name_lbl = Titanium.UI.createLabel({
							top : 5,
							height : 25,
							left : 110,
							font : {
								fontSize : 20
							},
							color : 'black'
						});
						var location_lbl = Titanium.UI.createLabel({
							top : 40,
							left : 110,
							top : 30,
							font : {
								fontSize : 15
							},

							color : 'gray'
						});

						var time_lbl = Titanium.UI.createLabel({
							left : 110,
							bottom : 10,
							font : {
								fontSize : 13
							},
							color : 'gray'
						});
						var Message = Ti.UI.createButton({
							right : 10,
							title : 'Message',
							cust_id : 'Message'
						});
					}
					Titanium.API.info('-----PIC----' + JSobj.users[i].profile_image_url);
					if (JSobj.users[i].profile_image_url) {
						view_frame.image = JSobj.users[i].profile_image_url;
					} else {
						view_frame.image = '/LestingframeBackground.png';
					}
					if (JSobj.users[i].location) {
						location_lbl.text = JSobj.users[i].location;
					}
					var created_arr = [];
					created_arr = JSobj.users[i].created_at.split('+');
					time_lbl.text = created_arr[0];
					name_lbl.text = JSobj.users[i].name;
					rowFollowers.add(view_frame);
					rowFollowers.filter = name_lbl.text;
					rowFollowers.add(name_lbl);
					rowFollowers.add(location_lbl);
					rowFollowers.add(time_lbl);
					rowFollowers.add(Message);
					if (cursor1 == -1) {
						Titanium.API.info('--push data -------');
						Followers.push(rowFollowers);
					} else {
						Titanium.API.info('--Append row data -------');
						$.tableFollowers.appendRow(rowFollowers);
					}
				}
				if (cursor1 == -1) {
					Titanium.API.info('--Set DAta in TableView  -------');
					$.tableFollowers.setData(Followers);
				}
				Titanium.API.info('--First cursor1 :   -------:' + cursor1);
				Titanium.API.info('--Twitter Cursor :   -------:' + JSobj.next_cursor);
				//cursor1 = JSobj.next_cursor;
				cursor1 = JSobj.next_cursor_str;
				Titanium.API.info('-- New cursor1 :   -------' + cursor1);
				Ti.App.hideIndicator();
			} else {
				Ti.App.hideIndicator();
				alert("Error in loading followers..\nPlease try again.");
			}
		} catch(ex) {
			Ti.App.hideIndicator();
			Titanium.API.info('----the Exception----' + ex);
			alert("Error in loading followers..\nPlease try again.");
		}
	}, function(e) {
		Ti.App.hideIndicator();
		alert("Error in loading followers..\nPlease try again.");
	});
}

function compare(a, b) {
	if ((a.name != null ? a.name : "").charAt(0).toString().toLowerCase() < (b.name != null ? b.name : "").charAt(0).toString().toLowerCase()) {
		return -1;
	} else {
		return 1;
	}
};
$.tableFollowers.addEventListener('click', function(e) {
	if (e.source.cust_id == 'Message') {
		title_messaage.text = 'Send Messag to: ' + e.row.name;
		Ti.API.info('-------message code----');
		viewMessage.zIndex = 999;
		viewMessage.visible = true;
		Alloy.Globals.send_id = e.row.id;
	}
});
$.morebutton.addEventListener('click', function(e) {
	GetFollowers(cursor1);
});
GetFollowers(cursor1);
