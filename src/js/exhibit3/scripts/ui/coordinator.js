/**
 * @fileOverview Helps bind and trigger events between views.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Coordinator = function(uiContext) {
    this._uiContext = uiContext;
    this._listeners = [];
};

/**
 * @static
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.Coordinator.create = function(configuration, uiContext) {
    return new Exhibit.Coordinator(uiContext);
};

/**
 * @static
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.Coordinator.createFromDOM = function(div, uiContext) {
    return new Exhibit.Coordinator(Exhibit.UIContext.createFromDOM(div, uiContext, false));
};

/**
 *
 */
Exhibit.Coordinator.prototype.dispose = function() {
    this._uiContext.dispose();
    this._uiContext = null;
};

/**
 * @param {Function} callback
 * @returns {Exhibit.Coordinator._Listener}
 */
Exhibit.Coordinator.prototype.addListener = function(callback) {
    var listener = new Exhibit.Coordinator._Listener(this, callback);
    this._listeners.push(listener);
    
    return listener;
};

/**
 * @param {Exhibit.Coordinator._Listener} listener
 */
Exhibit.Coordinator.prototype._removeListener = function(listener) {
    var i;
    for (i = 0; i < this._listeners.length; i++) {
        if (this._listeners[i] === listener) {
            this._listeners.splice(i, 1);
            return;
        }
    }
};

/**
 * @param {Exhibit.Coordinator._Listener} listener
 * @param {Object} o
 */
Exhibit.Coordinator.prototype._fire = function(listener, o) {
    var i, listener2;
    for (i = 0; i < this._listeners.length; i++) {
        listener2 = this._listeners[i];
        if (listener2 !== listener) {
            listener2._callback(o);
        }
    }
};

/**
 * @constructor
 * @class
 * @param {Exhibit.Coordinator} coordinator
 * @param {Function} callback
 */
Exhibit.Coordinator._Listener = function(coordinator, callback) {
    this._coordinator = coordinator;
    this._callback = callback;
};

/**
 */
Exhibit.Coordinator._Listener.prototype.dispose = function() {
    this._coordinator._removeListener(this);
};

/**
 * @param {Object} o
 */
Exhibit.Coordinator._Listener.prototype.fire = function(o) {
    this._coordinator._fire(this, o);
};
