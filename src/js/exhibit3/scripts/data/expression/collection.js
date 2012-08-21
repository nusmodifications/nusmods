/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {Array|Exhibit.Set} values
 * @param {String} valueType
 */
Exhibit.Expression._Collection = function(values, valueType) {
    this._values = values;
    this.valueType = valueType;
    
    if (values instanceof Array) {
        this.forEachValue = Exhibit.Expression._Collection._forEachValueInArray;
        this.getSet = Exhibit.Expression._Collection._getSetFromArray;
        this.contains = Exhibit.Expression._Collection._containsInArray;
        this.size = values.length;
    } else {
        this.forEachValue = Exhibit.Expression._Collection._forEachValueInSet;
        this.getSet = Exhibit.Expression._Collection._getSetFromSet;
        this.contains = Exhibit.Expression._Collection._containsInSet;
        this.size = values.size();
    }
};

/**
 * @param {Function} f
 */
Exhibit.Expression._Collection._forEachValueInSet = function(f) {
    this._values.visit(f);
};

/**
 * @param {Function} f
 */
Exhibit.Expression._Collection._forEachValueInArray = function(f) {
    var a, i;
    a = this._values;
    for (i = 0; i < a.length; i++) {
        if (f(a[i])) {
            break;
        }
    }
};

/**
 * @returns {Exhibit.Set}
 */
Exhibit.Expression._Collection._getSetFromSet = function() {
    return this._values;
};

/**
 * @returns {Exhibit.Set}
 */
Exhibit.Expression._Collection._getSetFromArray = function() {
    return new Exhibit.Set(this._values);
};

/**
 * @param {String|Number} v
 * @returns {Boolean}
 */
Exhibit.Expression._Collection._containsInSet = function(v) {
    return this._values.contains(v);
};

/**
 * @param {String|Number} v
 * @returns {Boolean}
 */
Exhibit.Expression._Collection._containsInArray = function(v) {
    var a, i;
    a = this._values;
    for (i = 0; i < a.length; i++) {
        if (a[i] === v) {
            return true;
        }
    }
    return false;
};
