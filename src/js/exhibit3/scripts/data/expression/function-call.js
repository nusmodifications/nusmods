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
Exhibit.Expression._FunctionCall = function(name, args) {
    this._name = name;
    this._args = args;
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {String} defaultRootName
 * @param {Exhibit.Database} database
 * @returns {Exhibit.Expression._Collection}
 * @throws Error
 */
Exhibit.Expression._FunctionCall.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var args = [], i;
    for (i = 0; i < this._args.length; i++) {
        args.push(this._args[i].evaluate(roots, rootValueTypes, defaultRootName, database));
    }
    
    if (typeof Exhibit.Functions[this._name] !== "undefined") {
        return Exhibit.Functions[this._name].f(args);
    } else {
        throw new Error(Exhibit._("%expression.noSuchFunction", this._name));
    }
};
