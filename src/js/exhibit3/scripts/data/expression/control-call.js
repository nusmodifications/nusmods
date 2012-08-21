/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @public
 * @param {String} name
 * @param {Array} args
 */
Exhibit.Expression._ControlCall = function(name, args) {
    this._name = name;
    this._args = args;
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {String} defaultRootName
 * @param {Exhibit.Database} database
 * @returns {Exhibit.Expression._Collection}
 */
Exhibit.Expression._ControlCall.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return Exhibit.Controls[this._name].f(this._args, roots, rootValueTypes, defaultRootName, database);
};
