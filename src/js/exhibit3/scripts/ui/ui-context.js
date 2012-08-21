/** 
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * 
 * 
 * @class
 * @constructor
 */
Exhibit.UIContext = function() {
    this._parent = null;
    
    this._exhibit = null;
    this._collection = null;
    this._lensRegistry = new Exhibit.LensRegistry();
    this._settings = {};
    
    this._formatters = {};
    this._listFormatter = null;
    
    this._editModeRegistry = {};
    
    this._popupFunc = null;
};

/**
 * @constant
 */
Exhibit.UIContext._settingSpecs = {
    "bubbleWidth": { "type": "int", "defaultValue": 400 },
    "bubbleHeight": { "type": "int", "defaultValue": 300 }
};

/**
 * @param {Object} configuration
 * @param {Exhibit} exhibit
 * @returns {Exhibit.UIContext}
 */
Exhibit.UIContext.createRootContext = function(configuration, exhibit) {
    var context, settings, n, formats;

    context = new Exhibit.UIContext();
    context._exhibit = exhibit;
    
    settings = Exhibit.UIContext.initialSettings;

    for (n in settings) {
        if (settings.hasOwnProperty(n)) {
            context._settings[n] = settings[n];
        }
    }
    
    formats = Exhibit.getAttribute(document.body, "formats");
    if (typeof formats !== "undefined" && formats !== null && formats.length > 0) {
        Exhibit.FormatParser.parseSeveral(context, formats, 0, {});
    }
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        document.body, Exhibit.UIContext._settingSpecs, context._settings);
        
    Exhibit.UIContext._configure(context, configuration);
    
    return context;
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} parentUIContext
 * @param {Boolean} ignoreLenses
 * @returns {Exhibit.UIContext}
 */
Exhibit.UIContext.create = function(configuration, parentUIContext, ignoreLenses) {
    var context = Exhibit.UIContext._createWithParent(parentUIContext);
    Exhibit.UIContext._configure(context, configuration, ignoreLenses);
    
    return context;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} parentUIContext
 * @param {Boolean} ignoreLenses
 * @returns {Exhibit.UIContext}
 */
Exhibit.UIContext.createFromDOM = function(configElmt, parentUIContext, ignoreLenses) {
    var context, id, formats;

    context = Exhibit.UIContext._createWithParent(parentUIContext);
    
    if (!(ignoreLenses)) {
        Exhibit.UIContext.registerLensesFromDOM(configElmt, context.getLensRegistry());
    }
    
    id = Exhibit.getAttribute(configElmt, "collectionID");
    if (typeof id !== "undefined" && id !== null && id.length > 0) {
        context._collection = context._exhibit.getCollection(id);
    }
    
    formats = Exhibit.getAttribute(configElmt, "formats");
    if (typeof formats !== "undefined" && formats !== null && formats.length > 0) {
        Exhibit.FormatParser.parseSeveral(context, formats, 0, {});
    }
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt, Exhibit.UIContext._settingSpecs, context._settings);
        
    Exhibit.UIContext._configure(context, Exhibit.getConfigurationFromDOM(configElmt), ignoreLenses);
    
    return context;
};

/**
 *
 */
Exhibit.UIContext.prototype.dispose = function() {
};

/**
 * @returns {Exhibit.UIContext}
 */
Exhibit.UIContext.prototype.getParentUIContext = function() {
    return this._parent;
};

/**
 * @returns {Exhibit}
 */
Exhibit.UIContext.prototype.getMain = function() {
    return this._exhibit;
};

/**
 * @returns {Exhibit.Database}
 */
Exhibit.UIContext.prototype.getDatabase = function() {
    return this.getMain().getDatabase();
};

/**
 * @returns {Exhibit.Collection}
 */
Exhibit.UIContext.prototype.getCollection = function() {
    if (this._collection === null) {
        if (this._parent !== null) {
            this._collection = this._parent.getCollection();
        } else {
            this._collection = this._exhibit.getDefaultCollection();
        }
    }
    return this._collection;
};

/**
 * @returns {Exhibit.LensRegistry}
 */
Exhibit.UIContext.prototype.getLensRegistry = function() {
    return this._lensRegistry;
};

/**
 * @param {String} name
 * @returns {String|Number|Boolean|Object}
 */
Exhibit.UIContext.prototype.getSetting = function(name) {
    return typeof this._settings[name] !== "undefined" ? 
        this._settings[name] : 
        (this._parent !== null ? this._parent.getSetting(name) : undefined);
};

/**
 * @param {String} name
 * @param {Boolean} defaultValue
 * @returns {Boolean}
 */
Exhibit.UIContext.prototype.getBooleanSetting = function(name, defaultValue) {
    var v = this.getSetting(name);
    return v === undefined || v === null ? defaultValue : v;
};

/**
 * @param {String} name 
 * @param {String|Number|Boolean|Object} value
 */
Exhibit.UIContext.prototype.putSetting = function(name, value) {
    this._settings[name] = value;
};

/**
 * @param {String|Number|Boolean|Object} value
 * @param {String} valueType
 * @param {Function} appender
 */
Exhibit.UIContext.prototype.format = function(value, valueType, appender) {
    var f;
    if (typeof this._formatters[valueType] !== "undefined") {
        f = this._formatters[valueType];
    } else {
        f = this._formatters[valueType] = 
            new Exhibit.Formatter._constructors[valueType](this);
    }
    f.format(value, appender);
};

/**
 * @param {Exhibit.Set} iterator
 * @param {Number} count
 * @param {String} valueType
 * @param {Function} appender
 */
Exhibit.UIContext.prototype.formatList = function(iterator, count, valueType, appender) {
    if (this._listFormatter === null) {
        this._listFormatter = new Exhibit.Formatter._ListFormatter(this);
    }
    this._listFormatter.formatList(iterator, count, valueType, appender);
};

/**
 * @param {String} itemID
 * @param {Boolean} val
 */
Exhibit.UIContext.prototype.setEditMode = function(itemID, val) {
    if (val) {
        this._editModeRegistry[itemID] = true;
    } else {
        this._editModeRegistry[itemID] = false;
    }
};

/**
 * @param {String} itemID
 * @returns {Boolean}
 */
Exhibit.UIContext.prototype.isBeingEdited = function(itemID) {
    return !!this._editModeRegistry[itemID];
};


/*----------------------------------------------------------------------
 *  Internal implementation
 *----------------------------------------------------------------------
 */

/**
 * @static
 * @private
 * @param {Exhibit.UIContext} parent
 * @returns {Exhibit.UIContext}
 */
Exhibit.UIContext._createWithParent = function(parent) {
    var context = new Exhibit.UIContext();
    
    context._parent = parent;
    context._exhibit = parent._exhibit;
    context._lensRegistry = new Exhibit.LensRegistry(parent.getLensRegistry());
    context._editModeRegistry = parent._editModeRegistry;
    
    return context;
};

/**
 * @private
 * @static
 * @param {Exhbit.UIContext} context
 * @param {Object} configuration
 * @param {Boolean} ignoreLenses
 */
Exhibit.UIContext._configure = function(context, configuration, ignoreLenses) {
    Exhibit.UIContext.registerLenses(configuration, context.getLensRegistry());
    
    if (typeof configuration["collectionID"] !== "undefined") {
        context._collection = context._exhibit.getCollection(configuration.collectionID);
    }
    
    if (typeof configuration["formats"] !== "undefined") {
        Exhibit.FormatParser.parseSeveral(context, configuration.formats, 0, {});
    }
    
    if (!(ignoreLenses)) {
        Exhibit.SettingsUtilities.collectSettings(
            configuration, Exhibit.UIContext._settingSpecs, context._settings);
    }
};

/*----------------------------------------------------------------------
 *  Lens utility functions for internal use
 *----------------------------------------------------------------------
 */

/**
 * @static
 * @param {Object} configuration
 * @param {Exhibit.LensRegistry} lensRegistry
 */
Exhibit.UIContext.registerLens = function(configuration, lensRegistry) {
    var template, i;
    template = configuration.templateFile;
    if (typeof template !== "undefined" && template !== null) {
        if (typeof configuration["itemTypes"] !== "undefined") {
            for (i = 0; i < configuration.itemTypes.length; i++) {
                lensRegistry.registerLensForType(template, configuration.itemTypes[i]);
            }
        } else {
            lensRegistry.registerDefaultLens(template);
        }
    }
};

/**
 * @param {Element} elmt
 * @param {Exhibit.LensRegistry} lensRegistry
 */
Exhibit.UIContext.registerLensFromDOM = function(elmt, lensRegistry) {
    var itemTypes, template, url, id, elmt2, i;

    $(elmt).hide();
    
    itemTypes = Exhibit.getAttribute(elmt, "itemTypes", ",");
    template = null;
    
    url = Exhibit.getAttribute(elmt, "templateFile");
    if (typeof url !== "undefined" && url !== null && url.length > 0) {
        template = url;
    } else {
        id = Exhibit.getAttribute(elmt, "template");
        elmt2 = id && document.getElementById(id);
        if (typeof elmt2 !== "undefined" && elmt2 !== null) {
            template = elmt2;
        } else {
            template = elmt;
        }
    }
    
    if (typeof template !== "undefined" && template !== null) {
        if (typeof itemTypes === "undefined" || itemTypes === null || itemTypes.length === 0 || (itemTypes.length === 1 && itemTypes[0] === "")) {
            lensRegistry.registerDefaultLens(template);
        } else {
            for (i = 0; i < itemTypes.length; i++) {
                lensRegistry.registerLensForType(template, itemTypes[i]);
            }
        }
    }
};

/**
 * @param {Object} configuration
 * @param {Exhibit.LensRegistry} lensRegistry
 */
Exhibit.UIContext.registerLenses = function(configuration, lensRegistry) {
    var i, lensSelector;
    if (typeof configuration["lenses"] !== "undefined") {
        for (i = 0; i < configuration.lenses.length; i++) {
            Exhibit.UIContext.registerLens(configuration.lenses[i], lensRegistry);
        }
    }
    if (typeof configuration["lensSelector"] !== "undefined") {
        lensSelector = configuration.lensSelector;
        if (typeof lensSelector === "function") {
            lensRegistry.addLensSelector(lensSelector);
        } else {
            Exhibit.Debug.log(Exhibit._("%general.error.lensSelectorNotFunction"));
        }
    }
};

/**
 * @param {Element} parentNode
 * @param {Exhibit.LensRegistry} lensRegistry
 */
Exhibit.UIContext.registerLensesFromDOM = function(parentNode, lensRegistry) {
    var node, role, lensSelectorString, lensSelector;

    node = $(parentNode).children().get(0);
    while (typeof node !== "undefined" && node !== null) {
        if (node.nodeType === 1) {
            role = Exhibit.getRoleAttribute(node);
            if (role === "lens" || role === "edit-lens") {
                Exhibit.UIContext.registerLensFromDOM(node, lensRegistry);
            }
        }
        node = node.nextSibling;
    }
    
    lensSelectorString = Exhibit.getAttribute(parentNode, "lensSelector");
    if (typeof lensSelectorString !== "undefined" && lensSelectorString !== null && lensSelectorString.length > 0) {
        try {
            lensSelector = eval(lensSelectorString);
            if (typeof lensSelector === "function") {
                lensRegistry.addLensSelector(lensSelector);
            } else {
                Exhibit.Debug.log(Exhibit._("%general.error.lensSelectorExpressionNotFunction", lensSelectorString));
            }
        } catch (e) {
            Exhibit.Debug.exception(e, Exhibit._("%general.error.badLensSelectorExpression", lensSelectorString));
        }
    }
};

/**
 * @param {Object} configuration
 * @param {Exhibit.LensRegistry} parentLensRegistry
 * @returns {Exhibit.LensRegistry}
 */
Exhibit.UIContext.createLensRegistry = function(configuration, parentLensRegistry) {
    var lensRegistry = new Exhibit.LensRegistry(parentLensRegistry);
    Exhibit.UIContext.registerLenses(configuration, lensRegistry);
    
    return lensRegistry;
};

/**
 * @param {Element} parentNode
 * @param {Object} configuration
 * @param {Exhibit.LensRegistry} parentLensRegistry
 * @returns {Exhibit.LensRegistry}
 */
Exhibit.UIContext.createLensRegistryFromDOM = function(parentNode, configuration, parentLensRegistry) {
    var lensRegistry = new Exhibit.LensRegistry(parentLensRegistry);
    Exhibit.UIContext.registerLensesFromDOM(parentNode, lensRegistry);
    Exhibit.UIContext.registerLenses(configuration, lensRegistry);
    
    return lensRegistry;
};
