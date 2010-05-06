
    var yql = {

        'latency' : function () {
            var domNode = document.getElementById('refresh_time');
            return (domNode && domNode.value && !isNaN(parseInt(domNode.value)) || 60000);
        },

        'do_query' : function (cb) {

            if ('jsonp' in yql) {
                yql.jsonp.parentNode.removeChild(yql.jsonp);
                delete yql.jsonp;
            }

            yql.jsonp = document.createElement('script');
            yql.jsonp.setAttribute('src',yql.url());

            document.getElementsByTagName('body')[0].appendChild(yql.jsonp);

            (cb || function(){})();
        },

        'repeating' : true,

        'reset' : function (cb) {
            yql.timeout = null;
            yql.do_query();
            (cb || function(){})();
        },

        'stop' : function (cb) {
            window.clearTimeout(yql.timeout);
            yql.timeout = null;
            yql.repeating = false;
            (cb || function(){})();
        },

        'store' : function (res) {

            var i, cur,

                to_add = [],
                to_del = [],
                still_here = [],

                sel_header = 'a[href="',
                sel_trailer = ']"',

                len = res.query.count,
                results = res.query.results.a;

            for (i = 0; i < len; ++i) {
                cur = results[i];
                (cur.href in yql.stored ? still_here : to_add).push(cur);
            }

            console.log(to_add);

            for (cur in yql.stored) {
                if (!(yql.stored[cur] in still_here)) {
                    to_del.push(yql.stored.cur);
                    delete yql.stored[cur];
                }
            }

            console.log(to_del);

            to_del = $(sel_header + to_del.join(sel_trailer + ',' + sel_header) + sel_trailer);
            to_del.slideUp(500, function(){ to_del.remove(); });

            for (i = 0, len = to_add.length; i < len; ++i) {
                links.push('<a href="' + to_add[i].href + '">'+''+'</a>');
            }

            if (!!yql.repeating && null === yql.timeout) {
                yql.timeout = window.setTimeout(yql.reset, yql.latency());
            }
        },

        'stored' : {},

        'timeout' : null,

        'url' : function () {
            var textAreas = document.getElementsByTagName('textarea');
            return ('http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(textAreas[0] && textAreas[0].value || '') + '&format=json&diagnostics=true&callback=yql.store');
        }
    };
