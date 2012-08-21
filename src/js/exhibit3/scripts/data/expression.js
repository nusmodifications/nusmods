/**
 * @fileOverview Base class for database query language.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Expression = {};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.Expression.Path} rootNode
 */
Exhibit.Expression._Impl = function(rootNode) {
    this._rootNode = rootNode;
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {String} defaultRootName
 * @param {Exhibit.Database} database
 * @returns {Object}
 */
Exhibit.Expression._Impl.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var collection = this._rootNode.evaluate(roots, rootValueTypes, defaultRootName, database);
    return {
        values:     collection.getSet(),
        valueType:  collection.valueType,
        size:       collection.size
    };
};

/**
 * @param {String} itemID
 * @param {Exhibit.Database} database
 * @returns {Object}
 */
Exhibit.Expression._Impl.prototype.evaluateOnItem = function(itemID, database) {
    return this.evaluate(
        { "value" : itemID }, 
        { "value" : "item" }, 
        "value",
        database
    );
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {String} defaultRootName
 * @param {Exhibit.Database} database
 * @returns {Object}
 */
Exhibit.Expression._Impl.prototype.evaluateSingle = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var collection, result;
    collection = this._rootNode.evaluate(roots, rootValueTypes, defaultRootName, database);
    result = { value: null,
               valueType: collection.valueType };
    collection.forEachValue(function(v) {
        result.value = v;
        return true;
    });
    
    return result;
};

/**
 * @param {String} itemID
 * @param {Exhibit.Database} database
 * @returns {Object}
 */
Exhibit.Expression._Impl.prototype.evaluateSingleOnItem = function(itemID, database) {
    return this.evaluateSingle(
        { "value" : itemID }, 
        { "value" : "item" }, 
        "value",
        database
    );
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {String} defaultRootName
 * @param {Exhibit.Database} database
 * @returns {Boolean}
 */
Exhibit.Expression._Impl.prototype.testExists = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this.isPath() ?
        this._rootNode.testExists(roots, rootValueTypes, defaultRootName, database) :
        this.evaluate(roots, rootValueTypes, defaultRootName, database).values.size() > 0;
};

/**
 * @returns {Boolean}
 */
Exhibit.Expression._Impl.prototype.isPath = function() {
    return this._rootNode instanceof Exhibit.Expression.Path;
};

/**
 * @returns {Exhibit.Expression.Path}
 */
Exhibit.Expression._Impl.prototype.getPath = function() {
    return this.isPath() ?
        this._rootNode :
        null;
};
