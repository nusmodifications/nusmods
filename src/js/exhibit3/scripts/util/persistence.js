/**
 * @fileOverview Support methods surrounding generating a URL for an item
 *               in the database.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace Contains support methods for generating persistent URLs for
 *            items in an Exhibit database.
 */
Exhibit.Persistence = {
    /**
     * Cached URL without query portion.
     */
    "_urlWithoutQuery": null,

    /**
     * Cached URL without query and hash portions.
     */
    "_urlWithoutQueryAndHash": null
};

/**
 * Given a relative or absolute URL, determine the fragment of the
 * corresponding absolute URL up to its last '/' character (relative URLs
 * are resolved relative to the document location).
 * 
 * @param {String} url Starting URL to derive a base URL from.
 * @returns {String} The base URL.
 */
Exhibit.Persistence.getBaseURL = function(url) {
    // HACK: for some unknown reason Safari keeps throwing
    //      TypeError: no default value
    // when this function is called from the RDFa importer. So I put a try catch here.
    var url2, i;
    try {
        if (url.indexOf("://") < 0) {
            url2 = Exhibit.Persistence.getBaseURL(document.location.href);
            if (url.substr(0,1) === "/") {
                url = url2.substr(0, url2.indexOf("/", url2.indexOf("://") + 3)) + url;
            } else {
                url = url2 + url;
            }
        }
        
        i = url.lastIndexOf("/");
        if (i < 0) {
            return "";
        } else {
            return url.substr(0, i+1);
        }
    } catch (e) {
        return url;
    }
};

/**
 * Given a relative or absolute URL, return the absolute URL (resolving
 * relative to the document location). 
 *
 * @param {String} url The orignal URL to resolve.
 * @returns {String} The resolved URL.
 */
Exhibit.Persistence.resolveURL = function(url) {
    var url2;
    if (url.indexOf("://") < 0) {
        url2 = Exhibit.Persistence.getBaseURL(document.location.href);
        if (url.substr(0,1) === "/") {
            url = url2.substr(0, url2.indexOf("/", url2.indexOf("://") + 3)) + url;
        } else {
            url = url2 + url;
        }
    }
    return url;
};

/**
 * Return the current document location without the query and hash portions
 * of the URL.
 *
 * @returns {String} The document's location without query and hash portions.
 */
Exhibit.Persistence.getURLWithoutQueryAndHash = function() {
    var url, hash, question;
    if (Exhibit.Persistence._urlWithoutQueryAndHash !== null) {
        url = Exhibit.Persistence._urlWithoutQueryAndHash;
    } else {
        url = document.location.href;
        
        hash = url.indexOf("#");
        question = url.indexOf("?");
        if (question >= 0) {
            url = url.substr(0, question);
        } else if (hash >= 0) {
            url = url.substr(0, hash);
        }
        
        Exhibit.Persistence._urlWithoutQueryAndHash = url;
    }
    return url;
};

/**
 * Return the current document location without the query portion of the URL.
 * If there is also a hash, it is also ignored.
 *
 * @returns {String} The document's location without a query portion.
 */
Exhibit.Persistence.getURLWithoutQuery = function() {
    var url, question;
    if (Exhibit.Persistence._urlWithoutQuery !== null) {
        url = Exhibit.Persistence._urlWithoutQuery;
    } else {
        url = document.location.href;
        
        question = url.indexOf("?");
        if (question >= 0) {
            url = url.substr(0, question);
        }
        
        Exhibit.Persistence._urlWithoutQuery = url;
    }
    return url;
};

/**
 * Return a URL to one item in this Exhibit, encoding it as a hash relative to
 * the URL without query and hash. 
 *
 * @param {String} itemID The item's database identifier.
 * @returns {String} A URL to Exhibit highlighting the item.
 */
Exhibit.Persistence.getItemLink = function(itemID) {
    return Exhibit.Persistence.getURLWithoutQueryAndHash() + "#" + encodeURIComponent(itemID);
};
