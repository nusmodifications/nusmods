/**
 * This requires the entire Exhibit infrastructure to be oriented around
 * generating registered state changes.
 */

/**
 * @fileOverview Local interface to a history manager.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace For history management related methods.
 */
Exhibit.History = {
    /**
     * Whether the history module is available.
     */
    enabled: false,

    /**
     * @private
     */
    _state: 0,

    /**
     * @private
     */
    _originalTitle: "",

    /**
     * @private
     */
    _originalLocation: "",
    
    /**
     * @private
     */
    _registry: null,

    /**
     * @private
     * @constant
     */
    _activeTypes: [ "facet", "view", "viewPanel" ]
};

/**
 * @depends History.js
 * @param {Exhibit._Impl} ex
 */
Exhibit.History.init = function(ex) {
    var state, types, i, j, keys, component;

    if (typeof History !== "undefined" && History.enabled) {
        Exhibit.History.enabled = true;
        Exhibit.History._originalTitle = document.title;
        Exhibit.History._originalLocation = Exhibit.Persistence.getURLWithoutQueryAndHash();
        Exhibit.History._registry = ex.getRegistry();

        $(window).bind("statechange", Exhibit.History.stateListener);
        if (Exhibit.Bookmark.runBookmark()) {
            Exhibit.Bookmark.implementBookmark(Exhibit.Bookmark.state);
        } else {
            Exhibit.History._processEmptyState();
            Exhibit.History.stateListener();
        }
    }
};

/**
 * @private
 * @static
 */
Exhibit.History._processEmptyState = function() {
    var state, types, reg, keys, component, i;
    types = Exhibit.History._activeTypes;
    reg = Exhibit.History._registry;
    state = Exhibit.History.getState();
    if (typeof state.data.components === "undefined") {
        state.data.components = {};
        state.data.state = Exhibit.History._state;
        for (i = 0; i < types.length; i++) {
            keys = reg.getKeys(types[i]);
            for (j = 0; j < keys.length; j++) {
                component = reg.get(types[i], keys[j]);
                if (typeof component.exportState === "function") {
                    state.data.components[keys[j]] = {};
                    state.data.components[keys[j]].type = types[i];
                    state.data.components[keys[j]].state = component.exportState();
                }
            }
        }
        Exhibit.History.replaceState(state.data);
    }
};

/**
 * @param {jQuery.Event} evt
 */
Exhibit.History.stateListener = function(evt) {
    var fullState, components, key, id, componentState, component;

    fullState = Exhibit.History.getState();

    if (fullState.data.lengthy) {
        Exhibit.UI.showBusyIndicator();
    }

    components = fullState.data.components;
    for (key in components) {
        if (components.hasOwnProperty(key)) {
            componentState = components[key].state;
            component = Exhibit.History._registry.get(components[key].type, key);
            if (component !== null &&
                typeof component.importState === "function") {
                // @@@ not every component is immediately available
                component.importState(componentState);
            }
        }
    }
    Exhibit.History._state = fullState.data.state || 0;

    if (fullState.data.lengthy) {
        Exhibit.UI.hideBusyIndicator();
    }
};

/**
 * Catch up for components that aren't immediately available.
 *
 * @param {jQuery.Event} evt
 * @param {String} type
 * @param {String} id
 */
Exhibit.History.componentStateListener = function(evt, type, id) {
    var fullState, components, componentState, component;
    fullState = Exhibit.History.getState();
    if (fullState !== null) {
        components = fullState.data.components;
        if (typeof components[id] !== "undefined") {
            componentState = components[id].state;
            component = Exhibit.History._registry.get(type, id);
            if (component !== null &&
                typeof component.importState === "function") {
                // @@@ not every component is immediately available
                // @@@ some components should be considered disposed of
                component.importState(componentState);
            }
        }
    }
};

/**
 * Passes through to History.js History.getState function.
 *
 * @static
 * @returns {Object}
 */
Exhibit.History.getState = function() {
    if (Exhibit.History.enabled) {
        return History.getState();
    } else {
        return null;
    }
};

Exhibit.History.setComponentState = function(state, component, registry, data, lengthy) {
    if (typeof state === "undefined" || state === null) {
        state = { "data": { "components": {} } };
    }

    if (typeof state["data"] === "undefined") {
        state.data = { "components": {} };
    }
    if (typeof state.data["components"] === "undefined") {
        state.data.components = {};
    }

    state.data.lengthy = lengthy;
    state.data.components[component.getID()] = {
        "type": registry,
        "state": data
    };

    return state;
};

Exhibit.History.pushComponentState = function(component, registry, data, subtitle, lengthy) {
    var state = Exhibit.History.getState();
    Exhibit.History.setComponentState(state, component, registry, data, lengthy);
    Exhibit.History.pushState(state.data, subtitle);
};

/**
 * Passes through to History.js History.pushState function.
 * 
 * @static
 * @param {Object} data
 * @param {String} subtitle
 */
Exhibit.History.pushState = function(data, subtitle) {
    var title, url;

    if (Exhibit.History.enabled) {
        Exhibit.History._state++;
        data.state = Exhibit.History._state;

        title = Exhibit.History._originalTitle;

        if (typeof subtitle !== "undefined" &&
            subtitle !== null &&
            subtitle !== "") {
            title += " {" + subtitle + "}";
        }
        
        url = Exhibit.History._originalLocation;
        
        History.pushState(data, title, url);
    }
};

/**
 * Passes through to History.js History.replaceState function.
 * 
 * @static
 * @param {Object} data
 * @param {String} subtitle
 * @param {String} url
 */
Exhibit.History.replaceState = function(data, subtitle, url) {
    var title, currentState;

    if (Exhibit.History.enabled) {
        currentState = Exhibit.History.getState();
        title = Exhibit.History._originalTitle;

        if (typeof subtitle !== "undefined" &&
            subtitle !== null &&
            subtitle !== "") {
            title += " {" + subtitle + "}";
        } else {
            if (typeof currentState.title !== "undefined") {
                title = Exhibit.History.getState().title;
            }
        }

        if ((typeof url === "undefined" || url === null) &&
            typeof currentState.url !== "undefined") {
            url = currentState.url;
        }
        
        History.replaceState(data, title, url);
    }
};

/**
 * Pushes an empty state into the history state tracker so the next refresh
 * will start from scratch.
 * 
 * @static
 */
Exhibit.History.eraseState = function() {
    Exhibit.History.pushState({});
};

$(document).bind("importReady.exhibit",
                 Exhibit.History.componentStateListener);
