/**
 * @fileOverview Modify History.js to take over all anchor management.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * Always return true so History.js won't futz with page anchors.
 * It is unlikely this type of option would be placed into History.js
 * proper, so expect it to stay here.
 *
 * @returns {Boolean}
 */
History.isTraditionalAnchor = function() {
    return true;
};
