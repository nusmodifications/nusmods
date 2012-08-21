/**
 * @fileOverview Lens registry for tracking lenses in a context.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.LensRegistry} parentRegistry
 */
Exhibit.LensRegistry = function(parentRegistry) {
    this._parentRegistry = parentRegistry;
    this._defaultLens = null;
    this._typeToLens = {};
    this._editLensTemplates = {};
    this._submissionLensTemplates = {};
    this._lensSelectors = [];
};

/**
 * @param {Element|String} elmtOrURL
 */
Exhibit.LensRegistry.prototype.registerDefaultLens = function(elmtOrURL) {
    this._defaultLens = (typeof elmtOrURL === "string") ? elmtOrURL : elmtOrURL.cloneNode(true);
};

/**
 * @param {Element|String} elmtOrURL
 * @param {String} type
 */
Exhibit.LensRegistry.prototype.registerLensForType = function(elmtOrURL, type) { 
    if (typeof elmtOrURL === "string") {
        this._typeToLens[type] = elmtOrURL;
    } 
    
    var role = Exhibit.getRoleAttribute(elmtOrURL);
    if (role === "lens") {
        this._typeToLens[type] = elmtOrURL.cloneNode(true);
    } else if (role === "edit-lens") {
        this._editLensTemplates[type] = elmtOrURL.cloneNode(true);
    } else {
        Exhibit.Debug.warn(Exhibit._("%lens.error.unknownLensType", elmtOrURL));
    }
};

/**
 * @param {Function} lensSelector
 */
Exhibit.LensRegistry.prototype.addLensSelector = function(lensSelector) {
    this._lensSelectors.unshift(lensSelector);
};

/**
 * @param {String} itemID
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Lens}
 */
Exhibit.LensRegistry.prototype.getLens = function(itemID, uiContext) {
    return uiContext.isBeingEdited(itemID)
        ? this.getEditLens(itemID, uiContext)
        : this.getNormalLens(itemID, uiContext);
};

/**
 * @param {String} itemID
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Lens}
 */
Exhibit.LensRegistry.prototype.getNormalLens = function(itemID, uiContext) {
    var db, i, lens, type;

    db = uiContext.getDatabase();

    for (i = 0; i < this._lensSelectors.length; i++) {
        lens = this._lensSelectors[i](itemID, db);
        if (typeof lens !== "undefined" && lens !== null) {
            return lens;
        }
    }
    
    type = db.getObject(itemID, "type");
    if (typeof this._typeToLens[type] !== "undefined") {
        return this._typeToLens[type];
    }
    if (typeof this._defaultLens !== "undefined" &&
        this._defaultLens !== null) {
        return this._defaultLens;
    }
    if (typeof this._parentRegistry !== "undefined" &&
        this._parenRegistry !== null) {
        return this._parentRegistry.getLens(itemID, uiContext);
    }
    return null;
};

/**
 * @param {String} itemID
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Lens}
 */
Exhibit.LensRegistry.prototype.getEditLens = function(itemID, uiContext) {
    var type = uiContext.getDatabase().getObject(itemID, "type");
    
    if (typeof this._editLensTemplates[type] !== "undefined") {
        return this._editLensTemplates[type];
    } else {
        return this._parentRegistry && this._parentRegistry.getEditLens(itemID, uiContext);
    }
};

/**
 * @param {String} itemID
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} opts
 * @param {Exhibit.Lens} opts.lensTemplate
 * @returns {Exhibit.Lens}
 */
Exhibit.LensRegistry.prototype.createLens = function(itemID, div, uiContext, opts) {
    var lens, lensTemplate;
    lens = new Exhibit.Lens();
    
    opts = opts || {};
    lensTemplate = opts.lensTemplate || this.getLens(itemID, uiContext);
    
    if (typeof lensTemplate === "undefined" || lensTemplate === null) {
        lens._constructDefaultUI(itemID, div, uiContext);
    } else if (typeof lensTemplate === "string") {
        lens._constructFromLensTemplateURL(itemID, div, uiContext, lensTemplate, opts);
    } else {
        lens._constructFromLensTemplateDOM(itemID, div, uiContext, lensTemplate, opts);
    }
    return lens;
};

/**
 * @param {String} itemID
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} opts
 * @param {Exhibit.Lens} opts.lensTemplate
 * @returns {Exhibit.Lens}
 */
Exhibit.LensRegistry.prototype.createEditLens = function(itemID, div, uiContext, opts) {
    opts = opts || {};
    opts.lensTemplate = this.getEditLens(itemID, uiContext);
    return this.createLens(itemID, div, uiContext, opts);
};

/**
 * @param {String} itemID
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} opts
 * @param {Exhibit.Lens} opts.lensTemplate
 * @returns {Exhibit.Lens}
 */
Exhibit.LensRegistry.prototype.createNormalLens = function(itemID, div, uiContext, opts) {
    opts = opts || {};
    opts.lensTemplate = this.getNormalLens(itemID, uiContext);
    return this.createLens(itemID, div, uiContext, opts);
};
