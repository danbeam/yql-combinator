/**
 * @author      Dan Beam <dan@danbeam.org>
 * @internal    A Simple YQL JSONP helper class that allows you to poll a YQL statement and prettily show results
 * @copyright   Copyright (C) 2010
 * Licensed under the MIT and GPL licensed (jQuery license)
 */
var yql = (function () {

        // check whether to repeat on an interval
    var repeat      = true,

        // the default latency of our polls
        latency     = 60000,
   
        // this is a placeholder for our global JSONP script tag
        jsonp       = null,

        // this is an arrangement of stored links we already have
        stored      = {},

        // this is the timeout ID assigned by the window when we start
        timeout     = null,

        // helper for the many times we use callbacks
        call_if_func = function (a) { return ('function' === typeof a ? a() : yql); },

        /* @param       (none)
         * @return      url:String - the URL of the JSONP <script> we're going to insert
         * @internal    Try to find a <textarea> with the YQL, otherwise nothing, insert result into YQL v2 URL
         * @todo        Make this prettier / more graceful
         */
        url = function () {
            var textAreas = document.getElementsByTagName('textarea');
            return ('http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(textAreas[0] && textAreas[0].value || '') + '&format=json&diagnostics=true&callback=yql.store');
        },

        /* @param       new_lat:Integer - optional latency (if wishing to set)
         * @return      latency:Integer - the latency (in milliseconds) that we're checking the YQL at
         * @internal    This is in the typical jQuery fashion where a call to this with arguments sets, otherwise gets
         */
        latency_helper = function (new_lat) {
            if ('number' === typeof new_lat) latency = Math.floor(new_lat);
            return call_if_func(new_lat);
        },

        /* @param       new_rep:Boolean - optional latency (if wishing to set)
         * @return      repeat:Boolean - whether or not we should repeat the JSONP calls
         * @internal    This is in the typical jQuery fashion where a call to this with arguments sets, otherwise gets
         */
        repeat_helper = function (new_rep) {
            if ('boolean' === typeof new_rep) repeat = new_rep;
            return call_if_func(new_rep);
        },

        /* @param       cb:Function - optional callback to be executes
         * @return      (none)
         * @internal    Do a JSONP YQL query (inject a <script> tag, pass data to the global callback)
         */
        remove = function (cb) {
            if (jsonp instanceof Node) jsonp.parentNode.removeChild(jsonp);
            jsonp = null;
            return call_if_func(cb);
        }

        /* @param       cb:Function - optional callback to be executes
         * @return      (none)
         * @internal    Do a JSONP YQL query (inject a <script> tag, pass data to the global callback)
         */
        insert = function (cb) {
            remove();
            jsonp = document.createElement('script');
            jsonp.setAttribute('src', url());
            document.getElementsByTagName('body')[0].appendChild(jsonp);
            return call_if_func(cb);
        }

        /* @param       cb:Function - optional callback to be executes
         * @return      (none)
         * @internal    Do a JSONP YQL query (inject a <script> tag, pass data to the global callback)
         */
        start = function (cb) {
            insert();
            return call_if_func(cb);
        },

        /* @param       cb:Function - optional callback to be executes
         * @return      (none)
         * @internal    Reset the state of our YQL class
         */
        stop = function (cb) {
            if (null !== timeout) clearTimeout(timeout);
            timeout = null;
            return call_if_func(cb);
        },

        /* @param       res:Object - the Object being returned by YQL
         * @return      (none)
         * @internal    This is the global callback we're telling the YQL URL to call when it's done
         */
        store = function (res) {
            // var pyramid, go!
            var i,
                cur,
                len,
                href,
                to_add = [],
                to_del = [],
                to_add_set,
                to_del_set,
                new_items = {},
                to_add_html = [],
                to_del_selector = [],
                links_selector = '#links div',
                results = res.query.results.a;

            // make a href => obj hash
            for (i = 0, len = res.query.count; i < len; ++i) {
                cur = results[i];
                new_items[cur.href] = cur;
            }

            // look for old links that weren't in the latest pull
            for (href in new_items) {
                if (!(href in stored)) {
                    to_add.push(new_items[href]);
                }
            }

            // if there are items to add
            if (to_add.length > 0) {

                // make new HTML
                for (i = 0, len = to_add.length; i < len; ++i) {
                    to_add_html.push('<div class="new"><a target="_blank" href="' + to_add[i].href + '">' + to_add[i].content.replace(/\n/g,'').replace(/\s+/g,' ') + '</a></div>');
                }

                // join and append
                $('#links').append(to_add_html.join("\n"));

                // grab a set from the given selector
                to_add_set = $(links_selector);

                // animatedly add all the new items
                to_add_set.each(function (a) {
                    $(this).animate({'height': $(this).children().outerHeight() + 'px'}, 'slow', function(){ $(this).removeClass('new'); });
                });
            }

            // see which one we want to delete
            for (href in stored) {
                if (!(href in new_items)) {
                    to_del.push(stored[href]);
                }
            }

            // if there are items to delete 
            if (to_del.length > 0) {

                // create a selector
                for (i = 0, len = to_del.length; i < len; ++i) {
                    to_del_selector.push('a[href="' + to_del[i].href + '"]');
                }

                // join the selectors, animate, and remove from DOM
                to_del_set = $(links_selector).has(to_del_selector.join(','));
                to_del_set.addClass('old').slideUp(500, function(){ $(this).remove(); });
            }

            // set the new stored to our current items
            stored = null;
            stored = new_items;

            // don't need the <script> tag anymore
            remove();

            // reset timeout if we're repeating
            if (repeat) timeout = setTimeout(start, latency);
        };

    window.stored = stored;

    // publicly accessible methods
    return({
        'stop'    : stop,
        'start'   : start,
        'store'   : store,
        'restart' : start,
        'latency' : latency_helper,
        'repeat'  : repeat_helper
    });
})();
