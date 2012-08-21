/**
 * @fileOverview Methods for generating and interpreting session state
 *               bookmarks.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace Bookmarking the current state of a browsing session.
 */
Exhibit.Bookmark = {
    /**
     * Whether the History system should load the bookmarked state.
     *
     * @private
     */
    _shouldRun: undefined,

    /**
     * The bookmark state read in by the bookmarking system.
     */
    state: {},
    
    /**
     * Whether a bookmark was used at the start or not.
     */
    run: undefined
};

/**
 * Generate a string that can be used as the hash portion of a URI
 * to be used for bookmarking the current state of an Exhibit browsing
 * session.
 *
 * @static
 * @param state {Object} An JSON serializable object fully describing
 *                       the current state.
 * @returns {String} The Base64-encoded string representing a JSON
 *                   serialized object.
 * @depends JSON
 * @depends Base64
 */
Exhibit.Bookmark.generateBookmarkHash = function(state) {
    if (typeof state === "undefined" ||
        state === null ||
        typeof state.data === "undefined" ||
        state.data === null ||
        typeof state.data.state === "undefined" ||
        state.data.state === null) {
        return "";
    }
    return Base64.encode(JSON.stringify(state));
};

/**
 * Turn a bookmark hash into a representation of state.
 *
 * @static
 * @param hash {String} A Base64-encoded string representing a JSON
 *                      serialized object.
 * @returns {Object} The deserialized object represented by the hash.
 * @depends JSON
 * @depends Base64
 */
Exhibit.Bookmark.interpretBookmarkHash = function(hash) {
    if (typeof hash === "undefined" || hash === null || hash === "") {
        return null;
    } else {
        return JSON.parse(Base64.decode(hash));
    }
};

/**
 * Given the current page state from Exhibit.History, make a bookmark URI.
 *
 * @static
 * @returns {String} The bookmark URI
 * @depends Exhibit.History
 */
Exhibit.Bookmark.generateBookmark = function() {
    var hash;
    hash = Exhibit.Bookmark.generateBookmarkHash(Exhibit.History.getState());
    return document.location.href + ((hash === "") ? "": "#" + hash);
};

/**
 * Change the state of the page given an interpreted bookmark hash.
 *
 * @static
 * @param state {Object} The interpreted bookmark hash as the state
 *                       object History.js uses.
 * @depends Exhibit.History
 */
Exhibit.Bookmark.implementBookmark = function(state) {
    if (typeof state !== "undefined" && state !== null) {
        Exhibit.History.replaceState(state.data, state.title, state.url);
        Exhibit.Bookmark.run = true;
    }
};

/**
 * Answer whether the bookmark system should run or not on the hash
 * (if there is a hash) in the current URL.
 *
 * @returns {Boolean}
 */
Exhibit.Bookmark.runBookmark = function() {
    return Exhibit.Bookmark._shouldRun;
};

/**
 * When run, examine this page's URI for a hash and try to interpret and
 * implement it.
 *
 * @static
 */
Exhibit.Bookmark.init = function() {
    var hash, state;
    hash = document.location.hash;
    if (hash.length > 0) {
        try {
            state = Exhibit.Bookmark.interpretBookmarkHash(hash.substr(1));
            if (typeof state === "object" &&
                typeof state["data"] !== "undefined" &&
                typeof state["title"] !== "undefined" &&
                typeof state["url"] !== "undefined") {
                Exhibit.Bookmark.state = state;
                Exhibit.Bookmark._shouldRun = true;
            } else {
                Exhibit.Bookmark._shouldRun = false;
            }
        } catch (ex) {
            Exhibit.Bookmark._shouldRun = false;
        } finally {
            Exhibit.Bookmark.run = false;
        }
    }
};
