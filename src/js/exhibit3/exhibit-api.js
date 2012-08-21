/**
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @fileOverview Exhibit definition and bootstrapping.
 */

/**
 * @namespace The base namespace for Exhibit.
 */
var Exhibit = {
    /**
     * The version number for Exhibit.
     * @constant
     */
    version: "3.0.0rc1",

    /**
     * The XML namespace for Exhibit.
     * @constant
     */
    namespace: "http://simile.mit.edu/2006/11/exhibit#",

    /***
     * Viable user-agent reported locales.
     */
    locales: [],

    /**
     * Whether Exhibit has been loaded yet.
     */
    loaded: false,

    /**
     * Indicates for listeners whether the event they're listening
     * for has fired already or not.  Not all events are currently
     * recorded here.  This is predominantly for the benefit of
     * extensions.
     */
    signals: {
        "loadExtensions.exhibit": false,
        "exhibitConfigured.exhibit": false
    },

    /**
     * Where Exhibit is served from.
     */
    urlPrefix: "e3/",

    /**
     * Settable parameters within the query string of loading this file.
     */
    params: {
        bundle: true,
        autoCreate: false,
        safe: false,
        babel: undefined,
        backstage: undefined,
        locale: undefined
    },

    /**
     * @namespace Prepare for official Exhibit extensions.
     */
    Extension: {},

    /**
     * One instance of LABjs to coordinate all loading in series
     */
    loader: null,

    /**
     * Scripts Exhibit will load.
     */
    scripts: [],

    "styles": [],

    /**
     * @constant An Exhibit.Registry of static components.
     */
    registry: null
};

/**
 * @static
 * @param {String} url
 * @param {Object} to
 * @param {Object} types
 * @returns {Object}
 */
Exhibit.parseURLParameters = function(url, to, types) {
    var q, param, parsed, params, decode, i, eq, name, old, replacement, type, data;
    to = to || {};
    types = types || {};

    if (typeof url === "undefined") {
        url = document.location.href;
    }

    q = url.indexOf("?");
    if (q < 0) {
        return to;
    }

    url = (url+"#").slice(q+1, url.indexOf("#")); // remove URL fragment
    params = url.split("&");
    parsed = {};
    decode = window.decodeURIComponent || unescape;
    for (i = 0; i < params.length; i++) {
        param = params[i];
        eq = param.indexOf("=");
        name = decode(param.slice(0, eq));
        old = parsed[name];
        replacement = decode(param.slice(eq+1));

        if (typeof old === "undefined") {
            old = [];
        } else if (!(old instanceof Array)) {
            old = [old];
        }
        parsed[name] = old.concat(replacement);
    }

    for (i in parsed) {
        if (parsed.hasOwnProperty(i)) {
            type = types[i] || String;
            data = parsed[i];
            if (!(data instanceof Array)) {
                data = [data];
            }
            if (type === Boolean && data[0] === "false") {
                to[i] = false;
            } else {
                to[i] = type.apply(this, data);
            }
        }
    }

    return to;
};

$LAB.setGlobalDefaults({
    AlwaysPreserveOrder: true,
    UseLocalXHR: false,
    AllowDuplicates: false
});
Exhibit.loader = $LAB.setOptions({"AlwaysPreserveOrder": true});