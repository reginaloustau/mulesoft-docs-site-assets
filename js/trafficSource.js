function trafficSourceHelper () {

    this.createCookies = function() {
        var queryString = this.parseQueryString();
        var organics = [".google.", ".bing.", ".yahoo.", ".baidu.",
            ".yandex.",
            ".ask.",
            ".babylon.",
            ".so.",
            ".msn.",
            ".aol.",
            ".lycos.",
            ".ask.",
            ".netscape.",
            ".cnn.",
            ".about.",
            ".duam.",
            ".eniro.",
            ".search.",
            ".terra."];

        if(Object.keys(queryString).length === 1) {
            if(getCookieForMarketo('utm_medium') === null) {
                if (document.referrer == "") {
                    this.setCookie('utm_medium', 'direct');
                    return 'direct';
                }
                else {
                    organics.forEach((function(item, index) {
                        if(document.referrer.indexOf(item) != -1) {
                            this.setCookie('utm_medium', 'organic');
                            return 'organic';
                        }
                    }).bind(this));
                    if(getCookieForMarketo('utm_medium') === null) {
                        this.setCookie('utm_medium', 'referral');
                        return 'referral';
                    }
                }
            }
        }
        else {
            this.delete_cookie('utm_medium');
        }
    }

    this.setCookie = function(c_name, c_value) {
        console.log('cookie ' + c_value);
        document.cookie = c_name + "=" + c_value;
    }

    this.parseQueryString = function() {
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    }

    this.delete_cookie = function(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}
getCookieForMarketo = function (name) {
    if (arguments.length === 0 && typeof opts !== 'string') {
        return;
    }

    var match = document.cookie.match('(?:^|; )' + name + '=([^;]+)');

    if (match) {
        return match[1];
    } else {
        return null;
    }
}