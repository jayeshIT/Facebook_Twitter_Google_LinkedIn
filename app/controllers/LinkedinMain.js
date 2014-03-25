try {
	Ti.include('/lib/constants.js');
	Ti.include('/lib/linkedin_module-min.js');
	linkedInModule.init('VdokpSBTWJxtFq2G', 'rqqdcsikdga6');

	$.backbutton.addEventListener('click', function(e) {
		$.LinkedinMain.close();
	});

	var inputData = [{
		title : 'My Email Address',
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
		title : 'My Connections',
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
		title : 'Add Post',
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
		title : 'My Shares',
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
			linkedInModule.getUser(function(_d) {
				Ti.API.info('THE EMAIL USER: :' + _d);
				linkedInModule.getEmail(function(_d) {

					try {
						Ti.API.info('THE EMAIL :' + _d);
						var jsObject = JSON.parse(_d);
						alert(jsObject);
					} catch(ex) {
						Ti.API.info('------------------------------------After Excepton------------' + ex);
					}
				});

			});
		} else if (e.index == 1) {
			var LinkedinFriendsWin = Alloy.createController('LinkedinFriends').getView();
			Ti.App.showIndicator();
			LinkedinFriendsWin.open();
		} else if (e.index == 2) {
			linkedInModule.getUser(function(_d) {
				Titanium.API.info('-----The D Data For Post Message: ' + _d);
				linkedInModule.postMessage(function(_d) {
					Ti.API.info("The message :" + _d);
				});
			});
		} else if (e.index == 3) {

			linkedInModule.getUser(function(_d) {
				linkedInModule.getShares(function(_d) {
					Ti.API.info('THE getShares of user: ' + _d);
					var mysh = JSON.parse(_d);
					alert(mysh);
					Titanium.API.info(mysh);
				});
			});
		}
	});

} catch(exception) {
	Titanium.API.info('exception Linkedin Main' + exception);
}
