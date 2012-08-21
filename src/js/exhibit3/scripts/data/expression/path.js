/**
 * @fileOverview Query language class representing graph paths.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 */
Exhibit.Expression.Path = function() {
    this._rootName = null;
    this._segments = [];
};

/**
 * @param {String} property
 * @param {Boolean} forward
 * @returns {Exhibit.Expression.Path}
 */
Exhibit.Expression.Path.create = function(property, forward) {
    var path = new Exhibit.Expression.Path();
    path._segments.push({ property: property,
                          forward: forward,
                          isArray: false });
    return path;
};

/**
 * @param {String} rootName
 */
Exhibit.Expression.Path.prototype.setRootName = function(rootName) {
    this._rootName = rootName;
};

/**
 * @param {String} property
 * @param {String} hopOperator
 */
Exhibit.Expression.Path.prototype.appendSegment = function(property, hopOperator) {
    this._segments.push({
        property:   property,
        forward:    hopOperator.charAt(0) === ".",
        isArray:    hopOperator.length > 1
    });
};

/**
 * @param {Number} index
 * @returns {Object}
 */
Exhibit.Expression.Path.prototype.getSegment = function(index) {
    var segment;
    if (index < this._segments.length) {
        segment = this._segments[index];
        return {
            property:   segment.property,
            forward:    segment.forward,
            isArray:    segment.isArray
        };
    } else {
        return null;
    }
};

/**
 * @returns {Object}
 */
Exhibit.Expression.Path.prototype.getLastSegment = function() {
    return this.getSegment(this._segments.length - 1);
};

/**
 * @returns {Number}
 */
Exhibit.Expression.Path.prototype.getSegmentCount = function() {
    return this._segments.length;
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {String} defaultRootName
 * @param {Exhibit.Database} database
 * @returns {Exhibit.Expression._Collection}
 * @throws Error
 */
Exhibit.Expression.Path.prototype.evaluate = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    var rootName, valueType, collection, root;
    rootName = (typeof this._rootName !== "undefined" && this._rootName !== null) ?
        this._rootName :
        defaultRootName;
    valueType = typeof rootValueTypes[rootName] !== "undefined" ?
        rootValueTypes[rootName] :
        "text";
    
    collection = null;
    if (typeof roots[rootName] !== "undefined") {
        root = roots[rootName];
        if (root instanceof Exhibit.Set || root instanceof Array) {
            collection = new Exhibit.Expression._Collection(root, valueType);
        } else {
            collection = new Exhibit.Expression._Collection([root], valueType);
        }
        
        return this._walkForward(collection, database);
    } else {
        throw new Error(Exhibit._("%expression.error.noSuchVariable", rootName));
    }
};

/**
 * @param {String|Number} value
 * @param {String} valueType
 * @param {Exhibit.Set} filter
 * @param {Exhibit.Database} database
 */
Exhibit.Expression.Path.prototype.evaluateBackward = function(
    value,
    valueType,
    filter,
    database
) {
    var collection = new Exhibit.Expression._Collection([ value ], valueType);
    
    return this._walkBackward(collection, filter, database);
};

/**
 * @param {Exhibit.Set|Array} values
 * @param {String} valueType
 * @param {Exhibit.Database} database
 */
Exhibit.Expression.Path.prototype.walkForward = function(
    values,
    valueType,
    database
) {
    return this._walkForward(new Exhibit.Expression._Collection(values, valueType), database);
};

/**
 * @param {Exhibit.Set|Array} values
 * @param {String} valueType
 * @param {Exhibit.Set} filter
 * @param {Exhibit.Database} database
 */
Exhibit.Expression.Path.prototype.walkBackward = function(
    values,
    valueType,
    filter,
    database
) {
    return this._walkBackward(new Exhibit.Expression._Collection(values, valueType), filter, database);
};

/**
 * @private
 * @param {Exhibit.Expression._Collection} collection
 * @param {Exhibit.Database} database
 * @returns {Exhibit.Expression._Collection}
 */
Exhibit.Expression.Path.prototype._walkForward = function(collection, database) {
    var i, segment, a, valueType, property, values, makeForEach;
    makeForEach = function(forward, as, s) {
        var fn = forward ? database.getObjects : database.getSubjects;
        return function(v) {
            fn(v, s.property).visit(function(v2) {
                as.push(v2);
            });
        };
    };
    for (i = 0; i < this._segments.length; i++) {
        segment = this._segments[i];
        if (segment.isArray) {
            a = [];
            collection.forEachValue(makeForEach(segment.forward, a, segment));
            if (segment.forward) {
                property = database.getProperty(segment.property);
                valueType = (typeof property !== "undefined" && property !== null) ?
                    property.getValueType() :
                    "text";
            } else {
                valueType = "item";
            }
            collection = new Exhibit.Expression._Collection(a, valueType);
        } else {
            if (segment.forward) {
                values = database.getObjectsUnion(collection.getSet(), segment.property);
                property = database.getProperty(segment.property);
                valueType = (typeof property !== "undefined" && property !== null) ?
                    property.getValueType() :
                    "text";
                collection = new Exhibit.Expression._Collection(values, valueType);
            } else {
                values = database.getSubjectsUnion(collection.getSet(), segment.property);
                collection = new Exhibit.Expression._Collection(values, "item");
            }
        }
    }
    
    return collection;
};

/**
 * @private
 * @param {Exhibit.Expression._Collection} collection
 * @param {Exhiibt.Set} filter
 * @param {Exhibit.Database} database
 * @param {Exhibit.Expression._Collection}
 */
Exhibit.Expression.Path.prototype._walkBackward = function(collection, filter, database) {
    var i, segment, a, valueType, property, values, makeForEach;
    makeForEach = function(forward, as, s, idx) {
        var fn = forward ? database.getObjects : database.getSubjects;
        return function(v) {
            fn(v, s.property).visit(function(v2) {
                if (idx > 0 || typeof filter === "undefined" || filter === null || filter.contains(v2)) {
                    as.push(v2);
                }
            });
        };
    };
    for (i = this._segments.length - 1; i >= 0; i--) {
        segment = this._segments[i];
        if (segment.isArray) {
            a = [];
            collection.forEachValue(makeForEach(segment.forward, a, segment, i));
            if (segment.forward) {
                property = database.getProperty(segment.property);
                valueType = (typeof property !== "undefined" && property !== null) ?
                    property.getValueType() :
                    "text";
            } else {
                valueType = "item";
            }
            collection = new Exhibit.Expression._Collection(a, valueType);
        } else {
            if (segment.forward) {
                values = database.getSubjectsUnion(collection.getSet(), segment.property, null, i === 0 ? filter : null);
                collection = new Exhibit.Expression._Collection(values, "item");
            } else {
                values = database.getObjectsUnion(collection.getSet(), segment.property, null, i === 0 ? filter : null);
                property = database.getProperty(segment.property);
                valueType = (typeof property !== "undefined" && property !== null) ? property.getValueType() : "text";
                collection = new Exhibit.Expression._Collection(values, valueType);
            }
        }
    }
    
    return collection;
};

/**
 * @param {Number} from
 * @param {Number} to
 * @param {Boolean} inclusive
 * @param {Exhibit.Set} filter
 * @param {Exhibit.Database} database
 * @returns {Object}
 * @throws Error
 */
Exhibit.Expression.Path.prototype.rangeBackward = function(
    from,
    to,
    inclusive,
    filter,
    database
) {
    var set, valueType, segment, i, property;
    set = new Exhibit.Set();
    valueType = "item";
    if (this._segments.length > 0) {
        segment = this._segments[this._segments.length - 1];
        if (segment.forward) {
            database.getSubjectsInRange(segment.property, from, to, inclusive, set, this._segments.length === 1 ? filter : null);
        } else {
            throw new Error(Exhibit._("%expression.error.mustBeForward"));
        }
                
        for (i = this._segments.length - 2; i >= 0; i--) {
            segment = this._segments[i];
            if (segment.forward) {
                set = database.getSubjectsUnion(set, segment.property, null, i === 0 ? filter : null);
                valueType = "item";
            } else {
                set = database.getObjectsUnion(set, segment.property, null, i === 0 ? filter : null);
                
                property = database.getProperty(segment.property);
                valueType = (typeof property !== "undefined" && property !== null) ? property.getValueType() : "text";
            }
        }
    }
    return {
        valueType:  valueType,
        values:     set,
        count:      set.size()
    };
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {String} defaultRootName
 * @param {Exhibit.Database} database
 * @returns {Boolean}
 */
Exhibit.Expression.Path.prototype.testExists = function(
    roots, 
    rootValueTypes, 
    defaultRootName, 
    database
) {
    return this.evaluate(roots, rootValueTypes, defaultRootName, database).size > 0;
};
