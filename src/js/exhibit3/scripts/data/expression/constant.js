/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @public
 * @param {String|Number} value
 * @param {String} valueType
 */
Exhibit.Expression._Constant = function(value, valueType) {
    this._value = value;
    this._valueType = valueType;
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {String} defaultRootName
 * @param {Exhibit.Database} database
 * @returns {Exhibit.Expression._Collection}
 */
Exhibit.Expression._Constant.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return new Exhibit.Expression._Collection([ this._value ], this._valueType);
};
