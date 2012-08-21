/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.UI = {
    /**
     * Map of components used for instantiating new UI objects.
     */
    componentMap: {},

    /**
     * Link to JSON validating service.
     */
    validator: (typeof Exhibit.babelPrefix !== "undefined") ?
        Exhibit.babelPrefix + "validator?url=" :
        Exhibit.validateJSON
};

/**
 * Augment with Exhibit.Registry?
 * @param {String} name
 * @param {String} comp
 */
Exhibit.UI.registerComponent = function(name, comp) {
    var msg = Exhibit._("%general.error.cannotRegister", name);
    if (typeof Exhibit.UI.componentMap[name] !== "undefined") {
        Exhibit.Debug.warn(Exhibit._("%general.error.componentNameTaken", msg));
    } else if (typeof comp === "undefined" || comp === null) {
        Exhibit.Debug.warn(Exhibit._("%general.error.noComponentObject", msg));
    } else if (typeof comp.create === "undefined") {
        Exhibit.Debug.warn(Exhibit._("%general.error.missingCreateFunction", msg));
    } else if (typeof comp.createFromDOM === "undefined") {
        Exhibit.Debug.warn(Exhibit._("%general.error.missingDOMCreateFunction", msg));
    } else {
        Exhibit.UI.componentMap[name] = comp;
    }
};

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.create = function(configuration, elmt, uiContext) {
    var role, createFunc;

    if (typeof configuration["role"] !== "undefined") {
        role = configuration.role;
        if (typeof role !== "undefined" && role !== null && role.startsWith("exhibit-")) {
            role = role.substr("exhibit-".length);
        }
        
        if (typeof Exhibit.UI.componentMap[role] !== "undefined") {
            createFunc = Exhibit.UI.componentMap[role].create;
            return createFunc(configuration, elmt, uiContext);
        }
        
        switch (role) {
        case "lens":
        case "edit-lens":
            Exhibit.UIContext.registerLens(configuration, uiContext.getLensRegistry());
            return null;
        case "view":
            return Exhibit.UI.createView(configuration, elmt, uiContext);
        case "facet":
            return Exhibit.UI.createFacet(configuration, elmt, uiContext);
        case "coordinator":
            return Exhibit.UI.createCoordinator(configuration, uiContext);
        case "coder":
            return Exhibit.UI.createCoder(configuration, uiContext);
        case "viewPanel":
            return Exhibit.ViewPanel.create(configuration, elmt, uiContext);
        case "logo":
            return Exhibit.Logo.create(configuration, elmt, uiContext);
        case "controlPanel":
            return Exhibit.ControlPanel.create(configuration, elmt, uiContext);
        case "hiddenContent":
            $(elmt).hide();
            return null;
        }
    }
    return null;
};

/**
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * returns {Object}
 */
Exhibit.UI.createFromDOM = function(elmt, uiContext) {
    var role, createFromDOMFunc;

    role = Exhibit.getRoleAttribute(elmt);
    
    if (typeof Exhibit.UI.componentMap[role] !== "undefined") {
        createFromDOMFunc = Exhibit.UI.componentMap[role].createFromDOM;
        return createFromDOMFunc(elmt, uiContext);
    }
    
    switch (role) {
    case "lens":
    case "edit-lens":
        Exhibit.UIContext.registerLensFromDOM(elmt, uiContext.getLensRegistry());
        return null;
    case "view":
        return Exhibit.UI.createViewFromDOM(elmt, null, uiContext);
    case "facet":
        return Exhibit.UI.createFacetFromDOM(elmt, null, uiContext);
    case "coordinator":
        return Exhibit.UI.createCoordinatorFromDOM(elmt, uiContext);
    case "coder":
        return Exhibit.UI.createCoderFromDOM(elmt, uiContext);
    case "viewPanel":
        return Exhibit.ViewPanel.createFromDOM(elmt, uiContext);
    case "controlPanel":
        return Exhibit.ControlPanel.createFromDOM(elmt, null, uiContext);
    case "logo":
        return Exhibit.Logo.createFromDOM(elmt, uiContext);
    case "hiddenContent":
        $(elmt).hide();
        return null;
    }
    return null;
};

/**
 * @param {Object} constructor
 * @returns {Object}
 */
Exhibit.UI.generateCreationMethods = function(constructor) {
    constructor.create = function(configuration, elmt, uiContext) {
        var newContext, settings;
        newContext = Exhibit.UIContext.create(configuration, uiContext);
        settings = {};
        
        Exhibit.SettingsUtilities.collectSettings(
            configuration, 
            constructor._settingSpecs || {}, 
            settings);
            
        return new constructor(elmt, newContext, settings);
    };
    constructor.createFromDOM = function(elmt, uiContext) {
        var newContext, settings;
        newContext = Exhibit.UIContext.createFromDOM(elmt, uiContext);
        settings = {};
        
        Exhibit.SettingsUtilities.collectSettingsFromDOM(
            elmt, 
            constructor._settingSpecs || {},
            settings);
        
        return new constructor(elmt, newContext, settings);
    };
};

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createView = function(configuration, elmt, uiContext) {
    var viewClass = typeof configuration["viewClass"] !== "undefined" ?
        configuration.viewClass :
        Exhibit.TileView;
    if (typeof viewClass === "string") {
        viewClass = Exhibit.UI.viewClassNameToViewClass(viewClass);
    }
    return viewClass.create(configuration, elmt, uiContext);
};

/**
 * @param {Element} elmt
 * @param {Element} container
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createViewFromDOM = function(elmt, container, uiContext) {
    var viewClass = Exhibit.UI.viewClassNameToViewClass(Exhibit.getAttribute(elmt, "viewClass"));
    return viewClass.createFromDOM(elmt, container, uiContext);
};

/**
 * @param {String} name
 * @returns {Object}
 */
Exhibit.UI.viewClassNameToViewClass = function(name) {
    if (typeof name !== "undefined" && name !== null && name.length > 0) {
        try {
            return Exhibit.UI._stringToObject(name, "View");
        } catch (e) {
            Exhibit.Debug.warn(Exhibit._("%general.error.unknownViewClass", name));
        }
    }
    return Exhibit.TileView;
};

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createFacet = function(configuration, elmt, uiContext) {
    var facetClass = typeof configuration["facetClass"] !== "undefined" ?
        configuration.facetClass :
        Exhibit.ListFacet;
    if (typeof facetClass === "string") {
        facetClass = Exhibit.UI.facetClassNameToFacetClass(facetClass);
    }
    return facetClass.create(configuration, elmt, uiContext);
};

/**
 * @param {Element} elmt
 * @param {Element} container
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createFacetFromDOM = function(elmt, container, uiContext) {
    var facetClass = Exhibit.UI.facetClassNameToFacetClass(Exhibit.getAttribute(elmt, "facetClass"));
    return facetClass.createFromDOM(elmt, container, uiContext);
};

/**
 * @param {String} name
 * @returns {Object}
 */
Exhibit.UI.facetClassNameToFacetClass = function(name) {
    if (typeof name !== "undefined" && name !== null && name.length > 0) {
        try {
            return Exhibit.UI._stringToObject(name, "Facet");
        } catch (e) {
            Exhibit.Debug.warn(Exhibit._("%general.error.unknownFacetClass", name));
        }
    }
    return Exhibit.ListFacet;
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createCoder = function(configuration, uiContext) {
    var coderClass = typeof configuration["coderClass"] !== "undefined" ?
        configuration.coderClass :
        Exhibit.ColorCoder;
    if (typeof coderClass === "string") {
        coderClass = Exhibit.UI.coderClassNameToCoderClass(coderClass);
    }
    return coderClass.create(configuration, uiContext);
};

/**
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createCoderFromDOM = function(elmt, uiContext) {
    var coderClass = Exhibit.UI.coderClassNameToCoderClass(Exhibit.getAttribute(elmt, "coderClass"));
    return coderClass.createFromDOM(elmt, uiContext);
};

/**
 * @param {String} name
 * @returns {Object}
 */
Exhibit.UI.coderClassNameToCoderClass = function(name) {
    if (typeof name !== "undefined" && name !== null && name.length > 0) {
        try {
            return Exhibit.UI._stringToObject(name, "Coder");
        } catch (e) {
            Exhibit.Debug.warn(Exhibit._("%general.error.unknownCoderClass", name));
        }
    }
    return Exhibit.ColorCoder;
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.UI.createCoordinator = function(configuration, uiContext) {
    return Exhibit.Coordinator.create(configuration, uiContext);
};

/**
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.UI.createCoordinatorFromDOM = function(elmt, uiContext) {
    return Exhibit.Coordinator.createFromDOM(elmt, uiContext);
};

/**
 * @private
 * @param {String} name
 * @param {String} suffix
 * @returns {Object}
 * @throws {Error}
 */
Exhibit.UI._stringToObject = function(name, suffix) {
    if (!name.startsWith("Exhibit.")) {
        if (!name.endsWith(suffix)) {
            try {
                return eval("Exhibit." + name + suffix);
            } catch (ex1) {
                // ignore
            }
        }
        
        try {
            return eval("Exhibit." + name);
        } catch (ex2) {
            // ignore
        }
    }
    
    if (!name.endsWith(suffix)) {
        try {
            return eval(name + suffix);
        } catch (ex3) {
            // ignore
        }
    }
    
    try {
        return eval(name);
    } catch (ex4) {
        // ignore
    }
    
    throw new Error(Exhibit._("%general.error.unknownClass", name));
};

/*----------------------------------------------------------------------
 *  Help and Debugging
 *----------------------------------------------------------------------
 */

/**
 * @static
 * @param {String} message
 * @param {String} url
 * @param {String} target
 */
Exhibit.UI.showHelp = function(message, url, target) {
    target = (target) ? target : "_blank";
    if (typeof url !== "undefined" && url !== null) {
        if (window.confirm(Exhibit._("%general.showDocumentationMessage", message))) {
            window.open(url, target);
        }
    } else {
        window.alert(message);
    }
};

/**
 * @static
 * @param {String} message
 * @param {String} url
 */
Exhibit.UI.showJsonFileValidation = function(message, url) {
    var target = "_blank";
    if (typeof Exhibit.babelPrefix !== "undefined" && url.indexOf("file:") === 0) {
        if (window.confirm(Exhibit._("%general.showJsonValidationFormMessage", message))) {
            window.open(Exhibit.UI.validator, target);
        }
    } else {
        if (window.confirm(Exhibit._("%general.showJsonValidationMessage", message))) {
            window.open(Exhibit.UI.validator + url, target);
        }
    }
};

/*----------------------------------------------------------------------
 *  Status Indication and Feedback
 *----------------------------------------------------------------------
 */
Exhibit.UI._busyIndicator = null;
Exhibit.UI._busyIndicatorCount = 0;

/**
 * @static
 */
Exhibit.UI.showBusyIndicator = function() {
    var scrollTop, height, top;

    Exhibit.UI._busyIndicatorCount++;
    if (Exhibit.UI._busyIndicatorCount > 1) {
        return;
    }
    
    if (Exhibit.UI._busyIndicator === null) {
        Exhibit.UI._busyIndicator = Exhibit.UI.createBusyIndicator();
    }
    
    // @@@ jQuery simplification?
    scrollTop = typeof document.body["scrollTop"] !== "undefined" ?
        document.body.scrollTop :
        document.body.parentNode.scrollTop;
    height = typeof window["innerHeight"] !== "undefined" ?
        window.innerHeight :
        (typeof document.body["clientHeight"] !== "undefined" ?
            document.body.clientHeight :
            document.body.parentNode.clientHeight);
        
    top = Math.floor(scrollTop + height / 3);
    
    $(Exhibit.UI._busyIndicator).css("top", top + "px");
    $(document.body).append(Exhibit.UI._busyIndicator);
};

/**
 * @static
 */
Exhibit.UI.hideBusyIndicator = function() {
    Exhibit.UI._busyIndicatorCount--;
    if (Exhibit.UI._busyIndicatorCount > 0) {
        return;
    }
    
    try {
        Exhibit.UI._busyIndicator.remove();
    } catch(e) {
        // silent
    }
};

/*----------------------------------------------------------------------
 *  Common UI Generation
 *----------------------------------------------------------------------
 */

/**
 * @static
 * @param {Element|jQuery} elmt
 */
Exhibit.UI.protectUI = function(elmt) {
    $(elmt).addClass("exhibit-ui-protection");
};

/**
 * @static
 * @param {String} text
 * @param {Function} handler
 * @returns {jQuery}
 */
Exhibit.UI.makeActionLink = function(text, handler) {
    var a, handler2;

    a = $("<a>" + text + "</a>").
        attr("href", "#").
        addClass("exhibit-action");
    
    handler2 = function(evt) {
        if (typeof $(this).attr("disabled") === "undefined") {
            evt.preventDefault();
            handler(evt);
        }
    };

    $(a).bind("click", handler2);
    
    return a;
};

/**
 * @static
 * @param {Element} a
 * @param {Boolean} enabled
 */
Exhibit.UI.enableActionLink = function(a, enabled) {
    if (enabled) {
        $(a).removeAttr("disabled");
        $(a).addClass("exhibit-action").removeClass("exhibit-action-disabled");
    } else {
        $(a).attr("disabled", true);
        $(a).removeClass("exhibit-action").addClass("exhibit-action-disabled");
    }
};

/**
 * @static
 * @param {String} itemID
 * @param {String} label
 * @param {Exhibit.UIContext} uiContext
 * @returns {jQuery}
 */
Exhibit.UI.makeItemSpan = function(itemID, label, uiContext) {
    var database, a, handler;

    database = uiContext.getDatabase();

    if (typeof label === "undefined" || label === null) {
        label = database.getObject(itemID, "label");
        if (typeof label === "undefined" || label === null) {
            label = itemID;
        }
    }
    
    a = $("<a>" + label + "</a>").
        attr("href", Exhibit.Persistence.getItemLink(itemID)).
        addClass("exhibit-item");
        
    handler = function(evt) {
        Exhibit.UI.showItemInPopup(itemID, this, uiContext);
        evt.preventDefault();
        evt.stopPropagation();
    };

    a.bind("click", handler);

    return a.get(0);
};

/**
 * @static
 * @param {String} label
 * @param {String} valueType
 * @returns {jQuery}
 */
Exhibit.UI.makeValueSpan = function(label, valueType) {
    var span, url;

    span = $("<span>").addClass("exhibit-value")
;
    if (valueType === "url") {
        url = label;
        if (Exhibit.params.safe && url.trim().startsWith("javascript:")) {
            span.text(url);
        } else {
            span.html("<a href=\"" + url + "\" target=\"_blank\">" +
                      (label.length > 50 ? 
                       label.substr(0, 20) + " ... " + label.substr(label.length - 20) :
                       label) +
                      "</a>");
        }
    } else {
        if (Exhibit.params.safe) {
            label = Exhibit.Formatter.encodeAngleBrackets(label);
        }
        span.html(label);
    }
    return span.get(0);
};

/**
 * @static
 * @param {Element} elmt
 */
Exhibit.UI.calculatePopupPosition = function(elmt) {
    var coords = $(elmt).offset();
    return {
        x: coords.left + Math.round($(elmt).outerWidth() / 2),
        y: coords.top + Math.round($(elmt).outerHeight() / 2)
    };
};

/**
 * @static
 * @param {String} itemID
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} opts
 */
Exhibit.UI.showItemInPopup = function(itemID, elmt, uiContext, opts) {
    var itemLensDiv, lensOpts;

    $(document).trigger("closeAllModeless.exhibit");

    opts = opts || {};
    opts.coords = opts.coords || Exhibit.UI.calculatePopupPosition(elmt);
    
    itemLensDiv = $("<div>");

    lensOpts = {
        inPopup: true,
        coords: opts.coords
    };

    if (opts.lensType === "normal") {
        lensOpts.lensTemplate = uiContext.getLensRegistry().getNormalLens(itemID, uiContext);
    } else if (opts.lensType === "edit") {
        lensOpts.lensTemplate = uiContext.getLensRegistry().getEditLens(itemID, uiContext);
    } else if (opts.lensType) {
        Exhibit.Debug.warn(Exhibit._("%general.error.unknownLensType", opts.lensType));
    }

    uiContext.getLensRegistry().createLens(itemID, itemLensDiv, uiContext, lensOpts);
    
    $.simileBubble("createBubbleForContentAndPoint",
        itemLensDiv, 
        opts.coords.x,
        opts.coords.y, 
        uiContext.getSetting("bubbleWidth")
    );
};

/**
 * @static
 * @param {String} name
 * @param {Function} handler
 * @param {String} className
 * @returns {Element}
 */
Exhibit.UI.createButton = function(name, handler, className) {
    var button = $("<button>").
        html(name).
        addClass((className || "exhibit-button")).
        addClass("screen");
    button.bind("click", handler);
    return button;
};

/**
 * @static
 * @param {Element} element
 * @returns {Object}
 */
Exhibit.UI.createPopupMenuDom = function(element) {
    var div, dom;

    div = $("<div>").
        addClass("exhibit-menu-popup").
        addClass("exhibit-ui-protection");
    
    /**
     * @ignore
     */
    dom = {
        elmt: div,
        open: function(evt) {
            var self, docWidth, docHeight, coords;
            self = this;
            // @@@ exhibit-dialog needs to be set
            if (typeof evt !== "undefined") {
                if ($(evt.target).parent(".exhibit-dialog").length > 0) {
                    dom._dialogParent = $(evt.target).parent(".exhibit-dialog:eq(0)").get(0);
                }
                evt.preventDefault();
            }
                
            docWidth = $(document.body).width();
            docHeight = $(document.body).height();
        
            coords = $(element).offset();
            this.elmt.css("top", (coords.top + element.scrollHeight) + "px");
            this.elmt.css("right", (docWidth - (coords.left + element.scrollWidth)) + "px");

            $(document.body).append(this.elmt);
            this.elmt.trigger("modelessOpened.exhibit");
            evt.stopPropagation();
        },
        appendMenuItem: function(label, icon, onClick) {
            var self, a, container;
            self = this;
            a = $("<a>").
                attr("href", "#").
                addClass("exhibit-menu-item").
                bind("click", function(evt) {
                    onClick(evt); // elmt, evt, target:being passed a jqevent
                    dom.close();
                    evt.preventDefault();
                    evt.stopPropagation();
                });

            container = $("<div>");
            a.append(container);
    
            container.append($.simileBubble("createTranslucentImage",
                (typeof icon !== "undefined" && icon !== null) ?
                    icon :
                    (Exhibit.urlPrefix + "images/blank-16x16.png")));
                
            container.append(document.createTextNode(label));
            
            this.elmt.append(a);
        },
        appendSeparator: function() {
            this.elmt.append("<hr/>");
        }
    };
    Exhibit.UI.setupDialog(dom, false);
    return dom;
};

/**
 * @static
 * @returns {Element}
 */
Exhibit.UI.createBusyIndicator = function() {
    var urlPrefix, containerDiv, topDiv, topRightDiv, middleDiv, middleRightDiv, contentDiv, bottomDiv, bottomRightDiv, img;
    urlPrefix = Exhibit.urlPrefix + "images/";
    containerDiv = $("<div>");
    if ($.simileBubble("pngIsTranslucent")) {
        topDiv = $("<div>").css({
            "height": "33px",
            "padding-left": "44px",
            "background": "url(" + urlPrefix + "message-bubble/message-top-left.png) top left no-repeat"
        });
        containerDiv.append(topDiv);
        
        topRightDiv = $("<div>").css({
            "height": "33px",
            "background": "url(" + urlPrefix + "message-bubble/message-top-right.png) top right no-repeat"
        });
        topDiv.append(topRightDiv);
        
        middleDiv = $("<div>").css({
            "padding-left": "44px",
            "background": "url(" + urlPrefix + "message-bubble/message-left.png) top left repeat-y"
        });
        containerDiv.append(middleDiv);
        
        middleRightDiv = $("<div>").css({
            "padding-right": "44px",
            "background": "url(" + urlPrefix + "message-bubble/message-right.png) top right repeat-y"
        });
        middleDiv.append(middleRightDiv);
        
        contentDiv = $("<div>");
        middleRightDiv.append(contentDiv);
        
        bottomDiv = $("<div>").css({
            "height": "55px",
            "padding-left": "44px",
            "background": "url(" + urlPrefix + "message-bubble/message-bottom-left.png) bottom left no-repeat"
        });
        containerDiv.append(bottomDiv);
        
        bottomRightDiv = $("<div>").css({
            "height": "55px",
            "background": "url(" + urlPrefix + "message-bubble/message-bottom-right.png) bottom right no-repeat"
        });
        bottomDiv.append(bottomRightDiv);
    } else {
        containerDiv.css({
            "border": "2px solid #7777AA",
            "padding": "20px",
            "background": "white",
            "opacity": 0.9
        });
        
        contentDiv = $("<div>");
        containerDiv.append(contentDiv);
    }

    containerDiv.addClass("exhibit-busyIndicator");
    contentDiv.addClass("exhibit-busyIndicator-content");
    
    img = $("<img />").attr("src", urlPrefix + "progress-running.gif");
    contentDiv.append(img);
    contentDiv.append(document.createTextNode(Exhibit._("%general.busyIndicatorMessage")));
    
    return containerDiv;
};

/**
 * @static
 * @param {String} itemID
 * @param {Exhibit} exhibit
 * @param {Object} configuration
 * @returns {Object}
 */
Exhibit.UI.createFocusDialogBox = function(itemID, exhibit, configuration) {
    var template, dom;
    template = {
        tag:        "div",
        className:  "exhibit-focusDialog exhibit-ui-protection",
        children: [
            {   tag:        "div",
                className:  "exhibit-focusDialog-viewContainer",
                field:      "viewContainer"
            },
            {   tag:        "div",
                className:  "exhibit-focusDialog-controls",
                children: [
                    {   tag:        "button",
                        field:      "closeButton",
                        children:   [ Exhibit._("%general.focusDialogBoxCloseButtonLabel") ]
                    }
                ]
            }
        ]
    };

    /**
     * @ignore
     */
    dom = $.simileDOM("template", template);

    Exhibit.UI.setupDialog(dom, true);

    /**
     * @ignore Can't get JSDocTK to ignore this one method for some reason.
     */
    dom.open = function() {
        var lens;
        $(document).trigger("modalSuperseded.exhibit");
        lens = new Exhibit.Lens(itemID, dom.viewContainer, exhibit, configuration);
        
        $(dom.elmt).css("top", (document.body.scrollTop + 100) + "px");
        $(document.body).append(dom.elmt);
        
        $(dom.closeButton).bind("click", function(evt) {
            dom.close();
            evt.preventDefault();
            evt.stopPropagation();
        });
        $(dom.elmt).trigger("modalOpened.exhibit");
    };
    
    return dom;
};

/**
 * @static
 * @param {String} relativeUrl
 * @param {String} verticalAlign
 * @returns {Element}
 */
Exhibit.UI.createTranslucentImage = function(relativeUrl, verticalAlign) {
    return $.simileBubble("createTranslucentImage", Exhibit.urlPrefix + relativeUrl, verticalAlign);
};

/**
 * @static
 * @param {String} relativeUrl
 * @param {String} verticalAlign
 * @returns {Element}
 */
Exhibit.UI.createTranslucentImageHTML = function(relativeUrl, verticalAlign) {
    return $.simileBubble("createTranslucentImageHTML", Exhibit.urlPrefix + relativeUrl, verticalAlign);
};

/**
 * @param {Number} x
 * @param {Number} y
 * @param {Element} elmt
 * @returns {Boolean}
 */
Exhibit.UI._clickInElement = function(x, y, elmt) {
    var offset = $(elmt).offset();
    var dims = { "w": $(elmt).outerWidth(),
                 "h": $(elmt).outerHeight() };
    return (x < offset.left &&
            x > offset.left + dims.w &&
            y < offset.top &&
            y > offset.top + dims.h);
};

/**
 * Add the close property to dom, a function taking a jQuery event that
 * simulates the UI for closing a dialog.  THe dialog can either be modal
 * (takes over the window focus) or modeless (will be closed if something
 * other than it is focused).
 *
 * This scheme assumes a modeless dialog will never produce a modal dialog
 * without also closing down.
 * 
 * @param {Object} dom An object with pointers into the DOM.
 * @param {Boolean} modal Whether the dialog is modal or not.
 * @param {Element} [dialogParent] The element containing the parent dialog.
 */
Exhibit.UI.setupDialog = function(dom, modal, dialogParent) {
    var clickHandler, cancelHandler, cancelAllHandler, createdHandler, i, trap;

    if (typeof parentDialog !== "undefined" && parentDialog !== null) {
        dom._dialogParent = dialogParent;
    }

    if (!modal) {
        dom._dialogDescendants = [];
        
        clickHandler = function(evt) {
            if (!Exhibit.UI._clickInElement(evt.pageX, evt.pageY, dom.elmt)) {
                trap = false;
                for (i = 0; i < dom._dialogDescendants; i++) {
                    trap = trap || Exhibit.UI._clickInElement(evt.pageX, evt.pageY, dom._dialogDescendants[i]);
                    if (trap) {
                        break;
                    }
                }
                if (!trap) {
                    dom.close(evt);
                }
            }
        };

        cancelAllHandler = function(evt) {
            dom.close(evt);
        };

        cancelHandler = function(evt) {
            dom.close(evt);
        };

        createdHandler = function(evt) {
            var descendant = evt.target;
            dom._dialogDescendants.push(descendant);
            $(descendant).bind("cancelModeless.exhibit", function(evt) {
                dom._dialogDescendants.splice(dom._dialogDescendants.indexOf(descendant), 1);
                $(descendant).unbind(evt);
            });
        };

        dom.close = function(evt) {
            if (typeof evt !== "undefined") {
                if (evt.type !== "cancelAllModeless") {
                    $(dom.elmt).trigger("cancelModeless.exhibit");
                }
            } else {
                $(dom.elmt).trigger("cancelModeless.exhibit");
            }
            $(document.body).unbind("click", clickHandler);
            $(dom._dialogParent).unbind("cancelModeless.exhibit", cancelHandler);
            $(document).unbind("cancelAllModeless.exhibit", cancelAllHandler);
            $(dom.elmt).trigger("closed.exhibit");
            $(dom.elmt).remove();
        };

        $(dom.elmt).bind("modelessOpened.exhibit", createdHandler);
        $(dom.elmt).one("modelessOpened.exhibit", function(evt) {
            $(document.body).bind("click", clickHandler);
            $(dom._dialogParent).bind("cancelModeless.exhibit", cancelHandler);
            $(document).bind("cancellAllModeless.exhibit", cancelAllHandler);
        });
    } else {
        dom._superseded = 0;

        clickHandler = function(evt) {
            if (dom._superseded === 0 &&
                !Exhibit.UI._clickInElement(evt.pageX, evt.pageY, dom.elmt)) {
                evt.preventDefault();
                evt.stopImmediatePropagation();
            }
        };

        closedHandler = function(evt) {
            dom._superseded--;
        };
        
        supersededHandler = function(evt) {
            dom._superseded++;
            // Will be unbound when element issuing this signal removes
            // itself.
            $(evt.target).bind("cancelModal.exhibit", closedHandler);
        };

        // Some UI element or keystroke should bind dom.close now that
        // it's been setup.
        dom.close = function(evt) {
            $(dom.elmt).trigger("cancelModal.exhibit");
            $(document).trigger("cancelAllModeless.exhibit");
            $(dom.elmt).remove();
            $(document.body).unbind("click", clickHandler);
            $(document).unbind("modalSuperseded.exhibit", supersededHandler);
        };

        $(dom.elmt).one("modalOpened.exhibit", function() {
            $(document.body).bind("click", clickHandler);
            $(document).bind("modalSuperseded.exhibit", supersededHandler);
        });
    }
};
