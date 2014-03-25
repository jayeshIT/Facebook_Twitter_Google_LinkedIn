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

	var BH = new BirdHouse({
		consumer_key : "ve08I0NlF2WzzTiOL5b3g",
		consumer_secret : "t01y1Xl4VoUfhg1YewgOXjOLHTVZnFNIRly8Vl8Q",
		callback_url : "http://www.appcelerator.com"
	});
	// text Field to enter share Text
	var chars = ( typeof ($.textshare) != 'undefined' && $.textshare != null) ? $.textshare.length : 0;
	$.textshare.addEventListener('change', function(e) {
		var chars = (140 - $.textshare.value.length);
		if ($.textshare.value.length > 140) {
			alert('More than 140 not allowd');
		}
		$.textlengthlabel.text = parseInt(chars);
	});
	// Twitter part Start Here
	$.poststatustt.addEventListener('click', function(e) {
		$.textshare.blur();
		if ($.textshare.value.trim().length == 0) {
			alert('Please enter text');
			return;
		}
		//	BH.send_tweet("status=" + $.textshare.value);
		if (Ti.Network.online) {
			if (BH.authorized() == true) {
				if ($.textshare.value.length < 140) {
					Ti.App.showIndicator();
					BH.send_tweet('status=' + $.textshare.value, function(resp) {
						Titanium.API.info('---xhr response in End function :' + resp);
						if (resp != null && resp != "" && resp != false && resp != undefined && resp != 0) {
							Ti.App.hideIndicator();
							alert('Stuatus updated successfully.');
							$.textshare.value = '';
							$.textlengthlabel.text = '';
						} else {
							Ti.App.hideIndicator();
							alert("Error while post \nPlease try again.");
						}
					});
					//  Share with Hash Tag...
					/*BH.send_tweet('status=' + 'Loved #apple and IPhone and Android' + '&' + 'entities=hashtags[{"text": "apple","indices" : [0,6],}]', function(resp) {
					 if (resp === true) {
					 $.textshare.value = '';
					 $.textlengthlabel.text = '';
					 } else {
					 }
					 });*/
				} else {
					alert('Please  enter text lessW than 140');
					return;
				}
			} else {
				alert('Please login to twitter.');
			}
		}
	});
	//Devang_aksar@yahoo.co.in
	$.postphotott.addEventListener('click', function(e) {
		$.textshare.blur();
		if (BH.authorized() == true) {
			var dialog2 = Titanium.UI.createOptionDialog({
				options : ['Choose From Library', 'Take New Photo', 'Cancel'],
				cancel : 2,
			});
			dialog2.show();
			dialog2.addEventListener('click', function(e) {
				if (e.index == 0) {
					Titanium.Media.openPhotoGallery({
						success : function(event) {
							var pic = null;
							pic = event.media;
							var imageView = Titanium.UI.createImageView({
								image : pic,
								width : 200,
								height : 200
							});
							if (OS_IOS) {
								pic = imageView.toBlob();
							}

							Ti.App.showIndicator();

							BH.sendTwitterImage({
								'status' : 'This is my Photo',
								'media' : pic
							}, function(resp) {
								Ti.App.hideIndicator();
								if (resp == true) {
									alert('Successfully Shared On Twitter');
								}

							}, function(resp) {
								Ti.App.hideIndicator();
								if (resp == false) {
									alert('Erro Occurs whilesharing...\n Please Try Again.');
								}

							});

						},
						cancel : function() {
							Ti.App.hideIndicator();
							alert('You Canceled');
						},
						error : function(error) {
							Ti.App.hideIndicator();
							alert('Erroe occurs');
						},
						mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO]
					});
					pic = null;
				} else if (e.index == 1) {
					Titanium.Media.showCamera({
						success : function(event) {
							var pic = null;

							pic = event.media;
							var imageView = Titanium.UI.createImageView({
								image : pic,
								width : 200,
								height : 200
							});
							if (OS_IOS) {
								pic = imageView.toBlob();
							}
							Ti.App.showIndicator();
							BH.sendTwitterImage({
								'status' : 'This is my Photo',
								'media' : pic
							}, function(resp) {
								Ti.App.showIndicator();
								if (resp == true) {
									alert('Successfully Shared On Twitter');
								}
							}, function(resp) {
								Ti.App.showIndicator();
								if (resp == false) {
									alert('Erro Occurs whilesharing...\n Please Try Again.');
								}
							});
						},
						cancel : function() {
							Ti.App.hideIndicator();
							alert('You Canceled');
						},
						error : function(error) {
							Ti.App.hideIndicator();
							// create alert
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
				pic = null;
			});

		} else {
			alert('Please Login to Twitter.');
		}
	});

} catch(excption) {
	Titanium.API.info('Excepction on post:-' + excption);
}

$.backbutton.addEventListener('click', function(e) {
	$.TwitterPost.close();
});
