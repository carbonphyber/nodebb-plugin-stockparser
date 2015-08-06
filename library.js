(function(module) {
    "use strict";

    // domain used to attempt to isolate errors to just the plugin
    var domain = require('domain'),
        d = domain.create();

    d.on('error', function(err) {
        console.error('nodebb-plugin-stockparser error: ' + err);
    });

    d.run(function () {
        var url = module.parent.require('url'), // https://nodejs.org/api/url.html
            Entities = module.parent.require('html-entities').Html5Entities, // https://www.npmjs.com/package/html-entities
            entities = new Entities(),
            StockParser = {},
            urlPattern = 'http://stocktwits.com/symbol/{TICKER}';

        module.exports = StockParser;

        // common replacement code
        StockParser.replaceTickers = function(fromText) {
            var ticker_rewrite = function (match, p1, offset, search_string) {
                    var matched_group = p1.substr(1),
                        match1_len = matched_group.length,
                        matched_group_match_offset = match.indexOf(matched_group);

                    // glue the new html entitized URL inside match
                    return match.substring(0, matched_group_match_offset - 1) + '<a href="' + entities.encode(urlPattern.replace('{TICKER}', matched_group)) + '" class="stock-ticker" rel="nofollow">' + entities.encode(matched_group) + '</a>' + match.substring(matched_group_match_offset + match1_len);
                };

            return fromText.replace(/(\$[A-Z]{1,4})\b/g, ticker_rewrite);
        };

        // hook receiver for posts and signatures
        StockParser.parse = function(data, callback) {
            if (data.hasOwnProperty('postData')) {
                data.postData.content = StockParser.replaceTickers(data.postData.content);
            } else if (data.hasOwnProperty('userData') && data.userData.hasOwnProperty('signature')) {
                data.userData.signature = StockParser.replaceTickers(data.userData.signature);
            }

            callback(null, data);
        };
    });

}(module));
