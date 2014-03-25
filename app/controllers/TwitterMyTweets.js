$.backbutton.addEventListener('click', function(e) {
    $.TwitterMyTweets.close();
});
var Tweets = [];
var BH = new BirdHouse({
    consumer_key : "ve08I0NlF2WzzTiOL5b3g",
    consumer_secret : "t01y1Xl4VoUfhg1YewgOXjOLHTVZnFNIRly8Vl8Q",
    callback_url : "http://www.appcelerator.com"
});
$.tablebviewTweets.headerTitle = Titanium.App.Properties.getString('ttname') + '\'s Tweets';
var Get_MyTweets = function() {
    Ti.App.showIndicator();
    BH.get_Mytweets('screen_name=' + Ti.App.Properties.getString('ttname') + '&count=' + 5000, function(resp) {
        //BH.get_Mytweets('screen_name=' + Ti.App.Properties.getString('ttname'), function(resp) {
        if (resp != null && resp != "" && resp != 0 && resp != false && resp != undefined) {
            Titanium.API.info("Tweets:" + resp);
            try {
                var JSobj = JSON.parse(resp);
                Tweets = [];
                for (var i = 0; i < JSobj.length; i++) {
                    var rowTweets = Titanium.UI.createTableViewRow({
                        height : Ti.UI.SIZE,
                        width : 307,
                        backgroundSelectedColor : "transparent",
                        selectionStyle : (Ti.Platform.osname != "android") ? Titanium.UI.iPhone.TableViewCellSelectionStyle.NONE : "",
                        layout : 'vertical',
                        id : JSobj[i].id_str
                    });
                    var view = Titanium.UI.createView({
                        left : 10,
                        right : 10,
                        height : Ti.UI.SIZE,
                        layout : 'vertical'
                    });
                    var text_lbl = Titanium.UI.createLabel({
                        height : Ti.UI.SIZE,
                        left : 10,
                        right : 5,
                        font : {
                            fontSize : 12
                        },
                        color : 'black',
                        textAlign : 'left'
                    });
                    var TweetImageView = Titanium.UI.createImageView({
                        top : 10,
                        height : Ti.UI.SIZE,
                        width : Ti.UI.SIZE,
                    });
                    if (JSobj[i].hasOwnProperty('text')) {
                        Titanium.API.info('- Has own property Text-----' + JSobj[i].text);
                        text_lbl.text = JSobj[i].text;
                        view.add(text_lbl);
                    }
                    if (JSobj[i].entities.hasOwnProperty('media')) {
                        Titanium.API.info('- Has own Media---' + JSobj[i].entities.media[0].media_url_https);
                        TweetImageView.image = JSobj[i].entities.media[0].media_url_https;
                        view.add(TweetImageView);
                    }
                    var time_arr = [];
                    time_arr = JSobj[i].created_at.split('+');
                    var time_lbl = Titanium.UI.createLabel({
                        top : 10,
                        left : 10,
                        height : Ti.UI.SIZE,
                        right : 5,
                        font : {
                            fontSize : 12
                        },
                        color : 'gray',
                        text : time_arr[0],
                        textAlign : 'left'
                    });

                    view.add(time_lbl);
                    rowTweets.add(view);
                    var view_space = Titanium.UI.createView({
                        left : 10,
                        right : 10,
                        height : 10,
                    });
                    rowTweets.add(view_space);
                    Tweets.push(rowTweets);
                }
                $.tablebviewTweets.setData(Tweets);
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
    }, function(e) {
        Ti.App.hideIndicator();
        alert("Error in download data..Please try again.");
    });
};
Get_MyTweets();
$.tablebviewTweets.addEventListener('delete', function(e) {
    var index_delete = e.index;
    var tw_id = e.row.id;
    Ti.API.info('--------index_delete----:' + index_delete);
    Ti.API.info('--------tw_id----:' + tw_id);
    BH.delete_my_tweets(tw_id, function(resp) {
        if (resp != null && resp != "" && resp != 0 && resp != false && resp != undefined) {
            $.tablebviewTweets.deleteRow(index_delete, {
                animationStyle : (OS_IOS) ? Titanium.UI.iPhone.RowAnimationStyle.NONE : ""
            });
            alert('delted successfull');
            $.TwitterMyTweets.close();
        }
    });
});
