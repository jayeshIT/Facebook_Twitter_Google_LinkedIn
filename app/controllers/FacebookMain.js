$.backbutton.addEventListener('click', function(e) {
	$.FacebookMain.close();
});
var inputData = [{
	title : 'My Friends',
	hasChild : true,
	selectedBackgroundColor : "transparent",
	selectionStyle : (Ti.Platform.osname != "android") ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : "",
	backgroundColor : 'white',
	color : 'black',
	font : (Ti.Platform.osname == "android") ? {
		fontSize : 20,
		fontWeight : "bold"
	} : {
		fontSize : 18,
		fontWeight : "bold"
	},
	height : (Ti.Platform.osname == "android") ? 60 : 50
}, {
	title : 'Invite Friends',
	hasChild : true,
	selectedBackgroundColor : "transparent",
	selectionStyle : (Ti.Platform.osname != "android") ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : "",
	backgroundColor : 'white',
	color : 'black',
	font : (Ti.Platform.osname == "android") ? {
		fontSize : 20,
		fontWeight : "bold"
	} : {
		fontSize : 18,
		fontWeight : "bold"
	},
	height : (Ti.Platform.osname == "android") ? 60 : 50
}, {
	title : ' Add Post',
	hasChild : true,
	selectedBackgroundColor : "transparent",
	selectionStyle : (Ti.Platform.osname != "android") ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : "",
	backgroundColor : 'white',
	color : 'black',
	font : (Ti.Platform.osname == "android") ? {
		fontSize : 20,
		fontWeight : "bold"
	} : {
		fontSize : 18,
		fontWeight : "bold"
	},
	height : (Ti.Platform.osname == "android") ? 60 : 50
}, {
	title : 'No Things',
	hasChild : true,
	selectedBackgroundColor : "transparent",
	selectionStyle : (Ti.Platform.osname != "android") ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : "",
	backgroundColor : 'white',
	color : 'black',
	font : (Ti.Platform.osname == "android") ? {
		fontSize : 20,
		fontWeight : "bold"
	} : {
		fontSize : 18,
		fontWeight : "bold"
	},
	height : (Ti.Platform.osname == "android") ? 60 : 50
}];
$.tablebview.data = inputData;

$.tablebview.addEventListener('click', function(e) {
	if (e.index == 0) {
		if (Titanium.Network.online) {
			var FacebookFriendsWin = Alloy.createController('FacebookFriends').getView();
			FacebookFriendsWin.open();
		} else {
			alert("Please turn on your internet connection.");
		}

	} else if (e.index == 1) {
		if (Titanium.Network.online) {
			var FacebookInviteFriendsWin = Alloy.createController('FacebookInviteFriends').getView();
			FacebookInviteFriendsWin.open();
		} else {
			alert("Please turn on your internet connection.");

		}
	} else if (e.index == 2) {
		var FacebookPostWin = Alloy.createController('FacebookPost').getView();
		FacebookPostWin.open();
	} else if (e.index == 3) {
		

	}
});
