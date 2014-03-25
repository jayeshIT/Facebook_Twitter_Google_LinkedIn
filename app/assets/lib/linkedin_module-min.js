// i.setRequestHeader("x-li-format", 'json'), i.setRequestHeader("Content-Type", "text/xml;charset=UTF-8")
var linkedInModule = {};
(function() {
	try {
		function f(b, c) {
			try {
				a.loadAccessToken("linkedin");
				if (a.isAuthorized() == !1) {
					try {
						var d = function(c) {
							c.linkedInReturnStatus == !0 && (Ti.API.info("----in recieve pin-----"), a.getAccessToken("https://api.linkedin.com/uas/oauth/accessToken", function(e) {
								a.saveAccessToken("linkedin");
								b != null && b(c)
							}, function(e) {
							}));
						};
						a.getRequestToken("https://api.linkedin.com/uas/oauth/requestToken", function(response) {
							a.showAuthorizeUI("https://api.linkedin.com/uas/oauth/authorize?" + response, d);
						}, function(err) {
							Ti.App.hideIndicator();
						});
					} catch(ex) {
						Ti.App.hideIndicator();
					}
				} else
					b && b(c);
			} catch(ex) {
				Ti.App.hideIndicator();
			}
		}

		function g(a, b) {
			var c = Ti.Network.createHTTPClient();
			c.open("GET", a.signed_url), (OS_IOS) ? c.setRequestHeader("Content-Type", "text/xml;charset=UTF-8") : c.setRequestHeader("x-li-format", 'json'), c.onload = function(a) {
				//c.open("GET", a.signed_url), c.setRequestHeader("Content-Type", "text/xml;charset=UTF-8"), c.onload = function(a) {
				b && b(c.responseText);
			}, c.onerror = function(a) {
				Ti.App.hideIndicator();
				alert('Error occurs please try again.');
				Ti.API.error(JSON.stringify(a)), b && b(c.responseText);
			}, c.send();
		}

		function getUserEmail(a, b) {
			var c = Ti.Network.createHTTPClient();
			c.open("GET", a.signed_url), c.setRequestHeader("x-li-format", 'json'), c.onload = function(a) {
				b && b(c.responseText);
			}, c.onerror = function(a) {
				Ti.App.hideIndicator();
				alert('Error occurs please try again.');
				Ti.API.error(JSON.stringify(a)), b && b(c.responseText);
			}, c.send();
		}

		function getUserShares(a, b) {
			var c = Ti.Network.createHTTPClient();
			c.open("GET", a.signed_url), c.setRequestHeader("x-li-format", 'json'), c.onload = function(a) {

				b && b(c.responseText);
			}, c.onerror = function(a) {
				Ti.App.hideIndicator();
				alert('Error occurs please try again.');
				Ti.API.error(JSON.stringify(a)), b && b(c.responseText);
			}, c.send();
		}

		function getUserConnections(a, b) {
			var c = Ti.Network.createHTTPClient();
			c.open("GET", a.signed_url), c.setRequestHeader("x-li-format", 'json'), c.onload = function(a) {
				b && b(c.responseText);
			}, c.onerror = function(a) {
				Ti.App.hideIndicator();
				alert('Error occurs please try again.');
				Ti.API.error(JSON.stringify(a)), b && b(c.responseText);
			}, c.send();
		}

		function h(d, f, h) {
			var i = a.loadAccessToken("linkedin"), j = OAuthSimple().sign({
				path : e + d,
				action : "GET",
				parameters : f,
				signatures : {
					consumer_key : c,
					shared_secret : b,
					access_token : i.accessToken,
					access_secret : i.accessTokenSecret
				}
			});
			g(j, h);
		};
		function i(d) {
			try {
				var e = a.loadAccessToken("linkedin"), f = OAuthSimple().sign({
					path : "https://api.linkedin.com/v1/people/~",
					action : "GET",
					signatures : {
						consumer_key : c,
						shared_secret : b,
						access_token : e.accessToken,
						access_secret : e.accessTokenSecret
					}
				});
				g(f, d);
			} catch(ex) {
				Titanium.API.info("==============The Second Excepption===============:" + ex);
			}
		};
		function j(d) {
			var e = a.loadAccessToken("linkedin"), f = OAuthSimple().sign({
				path : "https://api.linkedin.com/v1/people/~:(current-share)",
				action : "GET",
				signatures : {
					consumer_key : c,
					shared_secret : b,
					access_token : e.accessToken,
					access_secret : e.accessTokenSecret
				}
			});
			g(f, d);
		};
		function k(d, e) {
			var f = a.loadAccessToken("linkedin"), h = OAuthSimple().sign({
				path : "https://api.linkedin.com/v1/people/~/network",
				action : "GET",
				parameters : d,
				signatures : {
					consumer_key : c,
					shared_secret : b,
					access_token : f.accessToken,
					access_secret : f.accessTokenSecret
				}
			});
			g(h, e);
		};
		function l(d) {
			var e = a.loadAccessToken("linkedin"), f = OAuthSimple().sign({
				//path : "https://api.linkedin.com/v1/people/~/connections",
				path : "https://api.linkedin.com/v1/people/~/connections",
				action : "GET",
				signatures : {
					consumer_key : c,
					shared_secret : b,
					access_token : e.accessToken,
					access_secret : e.accessTokenSecret
				}
			});
			getUserConnections(f, d);
		};
		function ap(d) {
			var e = a.loadAccessToken("linkedin"), f = OAuthSimple().sign({
				path : "https://api.linkedin.com/v1/people/~/email-address",
				action : "GET",
				signatures : {
					consumer_key : c,
					shared_secret : b,
					access_token : e.accessToken,
					access_secret : e.accessTokenSecret
				}
			});
			//g(f, d);
			getUserEmail(f, d);
		};

		function myshares(d) {
			var e = a.loadAccessToken("linkedin"), f = OAuthSimple().sign({
				path : "https://api.linkedin.com/v1/people/~/network/updates",
				action : "GET",
				signatures : {
					consumer_key : c,
					shared_secret : b,
					access_token : e.accessToken,
					access_secret : e.accessTokenSecret
				}
			});
			getUserShares(f, d);
		}

		function m(d, e) {
			Titanium.API.info("-----------try m function--------");
			var f = '<?xml version="1.0" encoding="UTF-8"?><share>';
			f += String.format("<comment>%s</comment><content><title>%s</title>", "Posting from the API using JSON", "A title for your share"), f += String.format("<submitted-url>%s</submitted-url><submitted-image-url>%s</submitted-image-url>", "http://www.appcelerator.com", "https://static.appcelerator.com/images/header/appc_logo.png"), f += String.format("<description>%s</description></content>", "everage the Share API to maximize engagement on user-generated content on LinkedIn"), f += String.format("<visibility><code>%s</code></visibility></share>", "anyone");
			var g = a.loadAccessToken("linkedin"), h = OAuthSimple().sign({
				path : "https://api.linkedin.com/v1/people/~/shares",
				action : "POST",
				parameters : {
					body : f
				},
				signatures : {
					consumer_key : c,
					shared_secret : b,
					access_token : g.accessToken,
					access_secret : g.accessTokenSecret
				}
			}), i = Ti.Network.createHTTPClient();
			i.open("POST", h.signed_url), i.setRequestHeader("Authorization", h.header), i.setRequestHeader("Content-Type", "text/xml;charset=UTF-8"), i.onload = function(a) {
				i.status < 400 && e(), i = null;
				alert('Post added Successfully.');
			};
			i.onerror = function(a) {
				if (a != null) {
					Titanium.API.info("onerror " + JSON.stringify(a)), Titanium.API.info("onerror " + JSON.stringify(a));
					alert('Error while posting.');
				} else {
					return !0;
				}
			};
			Titanium.API.info('------f -------:' + f);
			i.send(f);
		}

		/*
		 function m(d, e) {
		 try {
		 Titanium.API.info("-----------try m function--------");
		 //var f = '<?xml version="1.0" encoding="UTF-8"?><share>';
		 //f += String.format("<comment>%s</comment><content><title>%s</title>", d.comment, d.content.title), f += String.format("<submitted-url>%s</submitted-url><submitted-image-url>%s</submitted-image-url>", d.content.submitted_url, d.content.submitted_image_url), f += String.format("<description>%s</description></content>", d.content.description), f += String.format("<visibility><code>%s</code></visibility></share>", d.visibility.code);
		 var f = {
		 //"share" : {
		 "comment" : "Posting from the API using JSON",
		 "content" : {
		 "title" : "A title for your share",

		 "submitted-url" : "http://www.appcelerator.com",
		 "submitted-image-url" : "https://static.appcelerator.com/images/header/appc_logo.png",
		 "description" : "Leverage the Share API to maximize engagement on user-generated content on LinkedIn",
		 },
		 "visibility" : {
		 "code" : "anyone"
		 }
		 //}
		 };

		 var g = a.loadAccessToken("linkedin"), h = OAuthSimple().sign({
		 path : "http://api.linkedin.com/v1/people/~/shares",
		 action : "POST",
		 parameters : {
		 body : f
		 },
		 signatures : {
		 consumer_key : c,
		 shared_secret : b,
		 access_token : g.accessToken,
		 access_secret : g.accessTokenSecret
		 }

		 //parameters : f,
		 }), i = Ti.Network.createHTTPClient();
		 Titanium.API.info('----The H Data :  ' + JSON.stringify(h));
		 Titanium.API.info('----The H Data2 :  ' + JSON.stringify(h.signed_url));
		 i.open("POST", h.signed_url);
		 //i.setRequestHeader("x-li-format", 'json'),
		 i.setRequestHeader('Content-Type', 'application/json');
		 i.onload = function(a) {
		 Titanium.API.info('--------  in XHR onload shares:----------');
		 i.status < 400 && e(), i = null;
		 if (a != null) {
		 Titanium.API.info('--------  in XHR onload but error shares:-------------');
		 Ti.API.error("onerror " + JSON.stringify(a)), alert("onerror " + JSON.stringify(a));
		 } else {
		 return !0;
		 }
		 };
		 i.onerror = function(e) {
		 Titanium.API.info('-----The XHR error:----------' + JSON.stringify(e));
		 };
		 Titanium.API.info('-------- Share JSON:' + JSON.stringify(f));
		 //i.send()
		 i.send(f);
		 } catch(exr) {
		 Titanium.API.info("Erro in shares:" + exr);
		 }
		 };
		 */
		var a, b, c, d = {}, e = "http://api.linkedin.com/v1/";
		Ti.include("/lib/Oauth_adapter.js"), Ti.include("/lib/OauthSimple.js"), d.init = function(d, e) {
			a = new OAuthAdapter(d, e, "HMAC-SHA1"), b = d, c = e;
		}, d.authorize = function(a) {
			f(a);
		}, d.getUser = function(a) {
			d.authorize(function() {
				i(a);
			});
		}, d.getConnections = function(a) {
			d.authorize(function() {
				l(a);
			});
		}, d.getEmail = function(a) {
			ap(a);

		}, d.getShares = function(a) {
			myshares(a);

		}, /* d.getShare = function(a) {
		 d.authorize(function() {
		 j(a);
		 });
		 },
		 d.getNetworkShares = function(a) {
		 d.authorize(function() {
		 k({
		 type : "SHAR"
		 }, a);
		 });
		 }, d.getMyShares = function(a) {
		 d.authorize(function() {
		 k({
		 type : "SHAR",
		 scope : "self"
		 }, a);
		 });
		 },*/
		d.API = function(a, b, c) {
			d.authorize(function() {
				h(a, b, c);
			});
		}, d.postMessage = function(a, b) {
			Titanium.API.info("-----------post Message function--------");

			m(a, function(a) {

			});

		}, linkedInModule = d;
	} catch(er) {
		Titanium.API.info("EXP:" + er);
	}
})();
