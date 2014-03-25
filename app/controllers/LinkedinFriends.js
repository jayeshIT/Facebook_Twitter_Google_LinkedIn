try {
	Ti.include('/lib/linkedin_module-min.js');
	Ti.include('/lib/constants.js');
	linkedInModule.init('VdokpSBTWJxtFq2G', 'rqqdcsikdga6');
	$.backbutton.addEventListener('click', function(e) {
		Ti.App.hideIndicator();
		$.LinkedinFriends.close();
	});
	var data = [];
	Ti.App.showIndicator();
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
	linkedInModule.getUser(function(_d) {
		Ti.App.showIndicator();
		try {
			linkedInModule.getConnections(function(_d) {
				data = [];
				Ti.API.info('THE PERSONS:' + _d);
				var myjson = JSON.parse(_d);
				for (var i = 0; i < myjson.values.length; i++) {
					Ti.API.info('The user +' + i);
					Ti.API.info('The user +' + myjson.values[i].firstName + "  " + myjson.values[i].lastName);
					Ti.API.info('The picture +' + myjson.values[i].pictureUrl);

					var table1row = Titanium.UI.createTableViewRow({
						height : (Titanium.Platform.osname != "android") ? 70 : 100,
						width : 307,
						backgroundImage : '/LestingStripBackground.png',
						selectedBackgroundColor : "transparent",
						selectionStyle : (Ti.Platform.osname != "android") ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : "",
						title : (Titanium.Platform.osname == "android") ? myjson.values[i].firstName : ""
					});
					if (OS_IOS) {
						var view_frame = Titanium.UI.createImageView({
							left : 10,
							top : 6,
							height : 55,
							width : 55,
							defaultImage : "/LestingframeBackground.png"
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
					} else {
						var view_frame = Titanium.UI.createImageView({
							left : 8,
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
					}
					if (myjson.values[i].pictureUrl != undefined && myjson.values[i].pictureUrl != 'undefined') {
						view_frame.image = myjson.values[i].pictureUrl;
					} else {
						view_frame.image = "/LestingframeBackground.png";
					}

					table1row.add(view_frame);
					name_lbl.text = myjson.values[i].firstName + "  " + myjson.values[i].lastName;
					table1row.add(name_lbl);
					table1row.filter = name_lbl.text;
					data.push(table1row);
				}
				data.sort(compare);
				$.table1.setData(data);
				Ti.App.hideIndicator();
			});
		} catch(ex) {
			Titanium.API.info('-----exception in my connection-----' + ex);
		}
	});

	function compare(a, b) {
		if ((a.firstName != null ? a.firstName : "").charAt(0).toString().toLowerCase() < (b.firstName != null ? b.firstName : "").charAt(0).toString().toLowerCase()) {
			return -1;
		} else {
			return 1;
		}
	};

} catch(exc) {
	Titanium.API.info('Linked in Users exception:' + exc);
}
