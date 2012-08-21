/**
 * @fileOverview Database interface and local implementation, with helper
 *               classes.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace Database layer of Exhibit.
 */
Exhibit.Database = {
    defaultIgnoredProperties: [ "uri", "modified" ]
};

/**
 * Instantiate an Exhibit database object.
 *
 * @static
 * @returns {Object}
 */
Exhibit.Database.create = function(type) {
    if (typeof Exhibit.Database[type] !== "undefined") {
        return new Exhibit.Database[type]();
    } else {
        // warn?
        return new Exhibit.Database._LocalImpl();
    }
};

/**
 * Add or initialize an array entry in a two-level hash, such that
 * index[x][y].push(z), given z isn't already in index[x][y].
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {String} z Value to put into an array in the subhash key.
 */
Exhibit.Database._indexPut = function(index, x, y, z) {
    var hash, array, i;

    hash = index[x];
    if (typeof hash === "undefined") {
        hash = {};
        index[x] = hash;
    }

    array = hash[y];
    if (typeof array === "undefined") {
        array = [];
        hash[y] = array;
    } else {
        for (i = 0; i < array.length; i++) {
            if (z === array[i]) {
                return;
            }
        }
    }

    array.push(z);
};

/**
 * Add or initialize an array entry in a two-level hash, such that
 * index[x][y] = list if undefined or index[x][y].concat(list) if already
 * defined. 
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {Array} list List of values to add or assign to the subhash key.
 */
Exhibit.Database._indexPutList = function(index, x, y, list) {
    var hash, array;

    hash = index[x];
    if (typeof hash === "undefined") {
        hash = {};
        index[x] = hash;
    }
    
    array = hash[y];
    if (typeof array === "undefined") {
        hash[y] = list;
    } else {
        hash[y] = hash[y].concat(list);
    }
};

/**
 * Remove the element z from the array index[x][y]; also remove
 * index[x][y] if the array becomes empty and index[x] if the hash becomes
 * empty as a result.
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @param {String} z Value to remove from an array in the subhash key.
 * @returns {Boolean} True if value removed, false if not.
 */
Exhibit.Database._indexRemove = function(index, x, y, z) {
    var hash, array, i, prop, empty;

    hash = index[x];
    if (typeof hash === "undefined") {
        return false;
    }

    array = hash[y];
    if (typeof array === "undefined") {
        return false;
    }

    for (i = 0; i < array.length; i++) {
        if (z === array[i]) {
            array.splice(i, 1);

            if (array.length === 0) {
                delete hash[y];

                empty = true;
                for (prop in hash) {
                    if (hash.hasOwnProperty(prop)) {
                        empty = false;
                        break;
                    }
                }
                if (empty) {
                    delete index[x];
                }
            }

            return true;
        }
    }
};

/**
 * Removes index[x][y] and index[x] if it becomes empty.
 *
 * @static
 * @private
 * @param {Object} index Base hash; may be modified as a side-effect.
 * @param {String} x First tier entry key in the base hash.
 * @param {String} y Second tier entry key in a subhash of the base hash.
 * @returns {Array} The removed array, or null if nothing was removed.
 */
Exhibit.Database._indexRemoveList = function(index, x, y) {
    var hash, array, prop, empty;

    hash = index[x];
    if (typeof hash === "undefined") {
        return null;
    }

    array = hash[y];
    if (typeof array === "undefined") {
        return null;
    }

    delete hash[y];

    empty = true;
    for (prop in hash) {
        if (hash.hasOwnProperty(prop)) {
            empty = false;
            break;
        }
    }
    if (empty) {
        delete index[x];
    }
    
    return array;
};
