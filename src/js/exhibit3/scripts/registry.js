/**
 * @fileOverview Centralized component registry for easier API access.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 * @class
 */
Exhibit.Registry = function(isStatic) {
    this._registry = {};
    this._idCache = {};
    this._components = [];
    this._isStatic = (typeof isStatic !== "undefined" && isStatic !== null) ?
        isStatic :
        false;
};

Exhibit.Registry.prototype.isStatic = function() {
    return this._isStatic;
};

/**
 * @param {String} component
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.createRegistry = function(component) {
    this._registry[component] = {};
    this._components.push(component);
};

/**
 * @returns {Array}
 */
Exhibit.Registry.prototype.components = function() {
    return this._components;
};

/**
 * @param {String} component
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.hasRegistry = function(component) {
    return typeof this._registry[component] !== "undefined";
};

/**
 * @param {String} component
 * @returns {Number}
 */
Exhibit.Registry.prototype.generateIdentifier = function(component) {
    var branch, key, size;
    size = 0;
    branch = this._registry[component];
    if (typeof branch !== "undefined") {
        for (key in branch) {
            if (branch.hasOwnProperty(key)) {
                size++;
            }
        }
    } else {
        throw new Error(Exhibit._("%registry.error.noSuchRegistry", component));
    }
    return size;
};

/**
 * @param {String} component
 * @param {String} id
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.isRegistered = function(component, id) {
    return (this.hasRegistry(component) &&
            typeof this._registry[component][id] !== "undefined");
};

/**
 * @param {String} component
 * @param {String} id
 * @param {Object} handler
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.register = function(component, id, handler) {
    if (!this.isRegistered(component, id)) {
        this._registry[component][id] = handler;
        if (!this.isStatic() && typeof this._idCache[id] === "undefined") {
            this._idCache[id] = handler;
        }
        return true;
    } else {
        return false;
    }
};

/**
 * @param {String} component
 * @returns {Object}
 */
Exhibit.Registry.prototype.componentHandlers = function(component) {
    if (this.hasRegistry(component)) {
        return this._registry[component];
    } else {
        return null;
    }
};

/**
 * @param {String} component
 * @returns {Array}
 */
Exhibit.Registry.prototype.getKeys = function(component) {
    var hash, key, keys;
    hash = this._registry[component];
    keys = [];
    for (key in hash) {
        if (hash.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
};

/**
 * Called when both the type of component and its ID are known to retrieve
 * the object associated with both.
 *
 * @param {String} component
 * @param {String} id
 * @returns {Object}
 * @see Exhibit.Registry.prototype.getID
 */
Exhibit.Registry.prototype.get = function(component, id) {
    if (this.isRegistered(component, id)) {
        return this._registry[component][id];
    } else {
        return null;
    }
};

/**
 * Called when the component type cannot be specified at the time of
 * calling but the ID is expected to exist.  Will always return null
 * for a static registry.
 *
 * @param {String} id
 * @returns {Object}
 * @see Exhibit.Registry.prototype.get
 */
Exhibit.Registry.prototype.getID = function(id) {
    if (!this.isStatic()) {
        if (typeof this._idCache[id] !== "undefined") {
            return this._idCache[id];
        }
    }
    return null;
};

/**
 * Typically called from within a dispose() method, removes component
 * from Exhibit's awareness, and the handler should be garbage collected.
 *
 * @param {String} component
 * @param {String} id
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.unregister = function(component, id) {
    var c;
    if (this.isRegistered(component, id)) {
        c = this.get(component, id);
        this._registry[component][id] = null;
        delete this._registry[component][id];
        if (!this.isStatic() && typeof this._idCache[id] !== "undefined") {
            this._idCache[id] = null;
            delete this._idCache[id];
        }
    }
};
