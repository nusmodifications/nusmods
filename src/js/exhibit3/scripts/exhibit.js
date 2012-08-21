/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @static
 * @param {Exhibit.Database} database
 * @returns {Exhibit._Impl}
 */
Exhibit.create = function(database) {
    return new Exhibit._Impl(database);
};

/**
 * Check for instances of ex:role and throw into backwards compatibility
 * mode if any are found.  Authors are responsible for converting or using
 * the HTML5 attributes correctly; backwards compatibility is only applicable
 * when used with unconverted Exhibits.
 * @static
 * @see Exhibit.Backwards
 */
Exhibit.checkBackwardsCompatibility = function() {
    var exroles;
    exroles = $("*").filter(function() {
        return typeof $(this).attr("ex:role") !== "undefined";
    });
    if (exroles.length > 0) {
        Exhibit.Backwards.enable("Attributes");
    }
};

/**
 * Retrieve an Exhibit-specific attribute from an element.
 *
 * @static
 * @param {jQuery|Element} elmt
 * @param {String} name Full attribute name or Exhibit attribute (without any
 *    prefix), e.g., "id" or "itemTypes".  "item-types" or "data-ex-item-types"
 *    are equivalent to "itemTypes", but "itemTypes" is the preferred form.
 * @param {String} splitOn Separator character to split a string
 *    representation into several values.  Returns an array if used.
 * @returns {String|Array}
 */
Exhibit.getAttribute = function(elmt, name, splitOn) {
    var value, i, values;

    try {
        value = $(elmt).attr(name);
        if (typeof value === "undefined" || value === null || value.length === 0) {
            value = $(elmt).data("ex-"+name);
            if (typeof value === "undefined" || value === null || value.length === 0) {
                return null;
            }
        }
        if (typeof splitOn === "undefined" || splitOn === null) {
            return value;
        }
        values = value.split(splitOn);
        for (i = 0; i < values.length; i++) {
            values[i] = values[i].trim();
        }
        return values;
    } catch(e) {
        return null;
    }
};

/**
 * @static
 * @param {Element} elmt
 * @returns {String}
 */
Exhibit.getRoleAttribute = function(elmt) {
    var role = Exhibit.getAttribute(elmt, "role") || "";
    if (typeof role === "object") {
        role = role[0];
    }
    role = role.replace(/^exhibit-/, "");
    return role;
};

/**
 * Process a DOM element's attribute name to see if it is an Exhibit
 * attribute.
 * @static
 * @param {String} name
 * @returns {Boolean}
 */
Exhibit.isExhibitAttribute = function(name) {
    return name.length > "data-ex-".length
        && name.startsWith("data-ex-");
};

/**
 * Process a DOM element's attribute and convert it into the name Exhibit
 * uses internally.
 * @static
 * @param {String} name
 * @returns {String}
 */
Exhibit.extractAttributeName = function(name) {
    return name.substr("data-ex-".length);
};

/**
 * Turn an internal attribute name into something that can be inserted into
 * the DOM and correctly re-extracted later as an Exhibit attribute.
 * @static
 * @param {String} name
 */
Exhibit.makeExhibitAttribute = function(name) {
    var exname;
    switch (name) {
        case "itemID":
            exname = "itemid";
            break;
        default:
            exname = "data-ex-" + name.replace(/([A-Z])/g, "-$1").toLowerCase();
            break;
    }
    return exname;
};

/**
 * @static
 * @param {Element} elmt
 * @returns {Object}
 */
Exhibit.getConfigurationFromDOM = function(elmt) {
    var c, o;
    c = Exhibit.getAttribute(elmt, "configuration");
    if (typeof c !== "undefined" && c !== null && c.length > 0) {
        try{
            o = eval(c);
            if (typeof o === "object") {
                return o;
            }
        } catch (e) {}
    }
    return {};
};

/**
 * This method is not commonly used.  Consider using Exhibit.SettingsUtilties.
 * @deprecated
 * @static
 * @param {Element} elmt
 * @returns {Object}
 */
Exhibit.extractOptionsFromElement = function(elmt) {
    var opts, dataset, i;
    opts = {};
    dataset = $(elmt).data();
    for (i in dataset) {
        if (dataset.hasOwnProperty(i)) {
            if (i.startsWith("ex")) {
                opts[i.substring(2)] = dataset[i];
            } else {
                opts[i] = dataset[i];
            }
        }
    }
    return opts;
};

/**
 * @public
 * @class
 * @constructor
 * @param {Exhibit.Database} database
 */
Exhibit._Impl = function(database) {
    this._database = (database !== null && typeof database !== "undefined") ? 
        database : 
        (typeof window["database"] !== "undefined" ?
            window.database :
            Exhibit.Database.create());
            
    this._uiContext = Exhibit.UIContext.createRootContext({}, this);
    this._registry = new Exhibit.Registry();
    $(document).trigger("registerComponents.exhibit", this._registry);
    this._collectionMap = {};
};

/**
 * 
 */
Exhibit._Impl.prototype.dispose = function() {
    var id;

    for (id in this._collectionMap) {
        if (this._collectionMap.hasOwnProperty(id)) {
            try {
                this._collectionMap[id].dispose();
            } catch(ex2) {
                Exhibit.Debug.exception(ex2, Exhibit._("%general.error.disposeCollection"));
            }
        }
    }
    
    this._uiContext.dispose();
    
    this._collectionMap = null;
    this._uiContext = null;
    this._database = null;
    this._registry.dispose();
    this._registry = null;
};

/**
 * @returns {Exhibit.Database}
 */
Exhibit._Impl.prototype.getDatabase = function() {
    return this._database;
};

/**
 * @returns {Exhibit.Registry}
 */
Exhibit._Impl.prototype.getRegistry = function() {
    return this._registry;
};

/**
 * @returns {Exhibit.UIContext}
 */
Exhibit._Impl.prototype.getUIContext = function() {
    return this._uiContext;
};

/**
 * @param {String} id
 * @returns {Exhibit.Collection}
 */
Exhibit._Impl.prototype.getCollection = function(id) {
    var collection = this._collectionMap[id];
    if ((typeof collection === "undefined" || collection === null) && id === "default") {
        collection = Exhibit.Collection.createAllItemsCollection(id, this._database);
        this.setDefaultCollection(collection);
    }
    return collection;
};

/**
 * @returns {Exhibit.Collection}
 */
Exhibit._Impl.prototype.getDefaultCollection = function() {
    return this.getCollection("default");
};

/**
 * @param {String} id
 * @param {Exhibit.Collection} c
 */
Exhibit._Impl.prototype.setCollection = function(id, c) {
    if (typeof this._collectionMap[id] !== "undefined") {
        try {
            this._collectionMap[id].dispose();
        } catch(e) {
            Exhibit.Debug.exception(e);
        }
    }
    this._collectionMap[id] = c;
};

/**
 * @param {Exhibit.Collection} c
 */
Exhibit._Impl.prototype.setDefaultCollection = function(c) {
    this.setCollection("default", c);
};

/**
 * @param {String} id
 * @returns {Object}
 */
Exhibit._Impl.prototype.getComponent = function(id) {
    return this.getRegistry().getID(id);
};

/**
 * @param {Object} configuration
 */
Exhibit._Impl.prototype.configure = function(configuration) {
    var i, config, id;
    if (typeof configuration["collections"] !== "undefined") {
        for (i = 0; i < configuration.collections.length; i++) {
            config = configuration.collections[i];
            id = config.id;
            if (typeof id === "undefined" || id === null || id.length === 0) {
                id = "default";
            }
            this.setCollection(id, Exhibit.Collection.create2(id, config, this._uiContext));
        }
    }
    if (typeof configuration["components"] !== "undefined") {
        for (i = 0; i < configuration.components.length; i++) {
            config = configuration.components[i];
            component = Exhibit.UI.create(config, config.elmt, this._uiContext);
        }
    }
};

/**
 * Set up this Exhibit's view from its DOM configuration.
 * @param {Node} [root] optional root node, below which configuration gets read
 *                      (defaults to document.body, when none provided)
 */
Exhibit._Impl.prototype.configureFromDOM = function(root) {
    var controlPanelElmts, collectionElmts, coderElmts, coordinatorElmts, lensElmts, facetElmts, otherElmts, f, uiContext, i, elmt, id, self, processElmts, exporters, expr, exporter, hash, itemID;

    collectionElmts = [];
    coderElmts = [];
    coordinatorElmts = [];
    lensElmts = [];
    facetElmts = [];
    controlPanelElmts = [];
    otherElmts = [];

    f = function(elmt) {
        var role, node;
        role = Exhibit.getRoleAttribute(elmt);
        if (role.length > 0) {
            switch (role) {
            case "collection":  collectionElmts.push(elmt); break;
            case "coder":       coderElmts.push(elmt); break;
            case "coordinator": coordinatorElmts.push(elmt); break;
            case "lens":
            case "submission-lens":
            case "edit-lens":   lensElmts.push(elmt); break;
            case "facet":       facetElmts.push(elmt); break;
            case "controlPanel": controlPanelElmts.push(elmt); break;
            default: 
                otherElmts.push(elmt);
            }
        } else {
            node = elmt.firstChild;
            while (typeof node !== "undefined" && node !== null) {
                if (node.nodeType === 1) {
                    f(node);
                }
                node = node.nextSibling;
            }
        }
    };
    f(root || document.body);
    
    uiContext = this._uiContext;
    for (i = 0; i < collectionElmts.length; i++) {
        elmt = collectionElmts[i];
        id = elmt.id;
        if (typeof id === "undefined" || id === null || id.length === 0) {
            id = "default";
        }
        this.setCollection(id, Exhibit.Collection.createFromDOM2(id, elmt, uiContext));
    }
    
    self = this;
    processElmts = function(elmts) {
        var i, elmt;
        for (i = 0; i < elmts.length; i++) {
            elmt = elmts[i];
            try {
                Exhibit.UI.createFromDOM(elmt, uiContext);
            } catch (ex1) {
                Exhibit.Debug.exception(ex1);
            }
        }
    };

    processElmts(coordinatorElmts);
    processElmts(coderElmts);
    processElmts(lensElmts);
    processElmts(facetElmts);

    if (controlPanelElmts.length === 0) {
        panel = Exhibit.ControlPanel.createFromDOM(
            $("<div>").prependTo(document.body),
            null,
            uiContext
        );
        panel.setCreatedAsDefault();
    } else {
        processElmts(controlPanelElmts);
    }

    processElmts(otherElmts);
    
    exporters = Exhibit.getAttribute(document.body, "exporters");
    if (typeof exporters !== "undefined" && exporters !== null) {
        exporters = exporters.split(";");
        for (i = 0; i < exporters.length; i++) {
            expr = exporters[i];
            exporter = null;
            
            try {
                exporter = eval(expr);
            } catch (ex2) {}
            
            if (exporter === null) {
                try { exporter = eval(expr + "Exporter"); } catch (ex3) {}
            }
            
            if (exporter === null) {
                try { exporter = eval("Exhibit." + expr + "Exporter"); } catch (ex4) {}
            }
            
            if (typeof exporter === "object") {
                Exhibit.addExporter(exporter);
            }
        }
    }
    
    hash = document.location.hash;
    if (hash.length > 1) {
        itemID = decodeURIComponent(hash.substr(1));
        if (this._database.containsItem(itemID)) {
            this._showFocusDialogOnItem(itemID);
        }
    }
    $(document).trigger("exhibitConfigured.exhibit", this);
};

/**
 * @private
 * @param {String} itemID
 */
Exhibit._Impl.prototype._showFocusDialogOnItem = function(itemID) {
    var dom, itemLens;
    dom = $.simileDOM("string",
        "div",
        "<div class='exhibit-focusDialog-viewContainer' id='lensContainer'>" +
        "</div>" +
        "<div class='exhibit-focusDialog-controls'>" +
            "<button id='closeButton'>" + 
                      Exhibit._("%export.focusDialogBoxCloseButtonLabel") + 
            "</button>" +
        "</div>"
    );
    $(dom.elmt).attr("class", "exhibit-focusDialog exhibit-ui-protection");
    Exhibit.UI.setupDialog(dom, true);
    
    itemLens = this._uiContext.getLensRegistry().createLens(itemID, dom.lensContainer, this._uiContext);
    
    $(dom.elmt).css("top", (document.body.scrollTop + 100) + "px");
    $(document.body).append($(dom.elmt));
    $(document).trigger("modalSuperseded.exhibit");

    $(dom.closeButton).bind("click", function(evt) {
        dom.close();
    });
};
