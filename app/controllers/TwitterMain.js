$.backbutton.addEventListener('click', function(e) {
    $.TwitterMain.close();
});
var BH = new BirdHouse({
    consumer_key : "ve08I0NlF2WzzTiOL5b3g",
    consumer_secret : "t01y1Xl4VoUfhg1YewgOXjOLHTVZnFNIRly8Vl8Q",
    callback_url : "http://www.appcelerator.com"
});

var inputData = [{
    title : 'My Followers',
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
    title : 'My Following',
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
    title : 'My Tweets',
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
    title : 'Upload video',
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
            var TwitterMyFollowersWin = Alloy.createController('TwitterMyFollowers').getView();
            TwitterMyFollowersWin.open();
        } else {
            alert("Please turn on your internet connection.");
        }
    } else if (e.index == 1) {
        if (Titanium.Network.online) {
            var TwitterMyFollowingWin = Alloy.createController('TwitterMyFollowing').getView();
            TwitterMyFollowingWin.open();
        } else {
            alert("Please turn on your internet connection.");
        }
    } else if (e.index == 2) {
        var TwitterPostWin = Alloy.createController('TwitterPost').getView();
        TwitterPostWin.open();
    } else if (e.index == 3) {
        if (Titanium.Network.online) {
            var TwitterMyTweetsWin = Alloy.createController('TwitterMyTweets').getView();
            TwitterMyTweetsWin.open();
        } else {
            alert("Please turn on your internet connection.");
        }
    } else if (e.index == 4) {

        var pic = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "/images/1.mp4").read();
        Ti.API.info('picpath' + pic.nativePath);
        Ti.API.info('data' + pic);

        /*BH.UPLOADVIDEO(pic,'This is my video', function(resp) {
         if (resp == true) {
         alert('Successfully Shared On Twitter');
         }
         }, function(resp) {
         if (resp == false) {
         alert('Erro Occurs whilesharing...\n Please Try Again.');
         }
         });*/

        /* var js = {
         key : 'fe98e40a9ba7f24ec1427166430567fe',
         message : 'this is message',
         media : pic
         };

         BH.UPLOADVIDEO_API2(js, function(resp) {
         if (resp == true) {
         alert('Successfully Shared On Twitter');
         }
         }, function(resp) {
         if (resp == false) {
         alert('Erro Occurs whilesharing...\n Please Try Again.');
         }
         });
         */
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
    }
});
