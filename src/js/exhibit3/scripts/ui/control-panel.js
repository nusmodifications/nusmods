/**
 * @fileOverview Provides a holding place for Exhibit-wide controls.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ControlPanel = function(elmt, uiContext) {
    this._uiContext = uiContext;
    this._widgets = [];
    this._div = elmt;
    this._settings = {};
    this._hovering = false;
    this._id = null;
    this._registered = false;
    this._childOpen = false;
    this._createdAsDefault = false;
};

/**
 * @static
 * @private
 */
Exhibit.ControlPanel._settingSpecs = {
    "showBookmark":         { type: "boolean", defaultValue: true },
    "developerMode":        { type: "boolean", defaultvalue: false },
    "hoverReveal":          { type: "boolean", defaultValue: false }
};

/**
 * @private
 * @constant
 */
Exhibit.ControlPanel._registryKey = "controlPanel";

/**
 * @static
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ControlPanel}
 */
Exhibit.ControlPanel.create = function(configuration, elmt, uiContext) {
    var panel = new Exhibit.ControlPanel(
        elmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.ControlPanel._configure(panel, configuration);
    panel._setIdentifier();
    panel.register();
    panel._initializeUI();
    return panel;
};

/**
 * @static
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.ControlPanel.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, panel;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    panel = new Exhibit.ControlPanel(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt :
            configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    Exhibit.ControlPanel._configureFromDOM(panel, configuration);
    panel._setIdentifier();
    panel.register();
    panel._initializeUI();
    return panel;
};

/**
 * @static
 * @private
 * @param {Exhibit.ControlPanel} panel
 * @param {Object} configuration
 */
Exhibit.ControlPanel._configure = function(panel, configuration) {
    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        Exhibit.ControlPanel._settingSpecs,
        panel._settings
    );
};

/**
 * @static
 * @private
 * @param {Exhibit.ControlPanel} panel
 * @param {Object} configuration
 */
Exhibit.ControlPanel._configureFromDOM = function(panel, configuration) {
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        panel._div,
        Exhibit.ControlPanel._settingSpecs,
        panel._settings
    );
};

/**
 * @private
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.ControlPanel.registerComponent = function(evt, reg) {
    if (!reg.hasRegistry(Exhibit.ControlPanel._registryKey)) {
        reg.createRegistry(Exhibit.ControlPanel._registryKey);
    }
};

/**
 * @static
 * @param {jQuery.Event} evt
 * @param {jQuery} elmt
 */
Exhibit.ControlPanel.mouseOutsideElmt = function(evt, elmt) {
    var coords = $(elmt).offset();
    return (
        evt.pageX < coords.left
            || evt.pageX > coords.left + $(elmt).outerWidth()
            || evt.pageY < coords.top
            || evt.pageY > coords.top + $(elmt).outerHeight()
    );
};

/**
 * @private
 */
Exhibit.ControlPanel.prototype._initializeUI = function() {
    var widget, self;
    self = this;
    if (this._settings.hoverReveal) {
        $(this.getContainer()).fadeTo(1, 0);
        $(this.getContainer()).bind("mouseover", function(evt) {
            self._hovering = true;
            $(this).fadeTo("fast", 1);
        });
        $(document.body).bind("mousemove", function(evt) {
            if (self._hovering
                && !self._childOpen
                && Exhibit.ControlPanel.mouseOutsideElmt(
                    evt,
                    self.getContainer()
                )) {
                self._hovering = false;
                $(self.getContainer()).fadeTo("fast", 0);
            }
        });
    }
    if (this._settings.showBookmark) {
        widget = Exhibit.BookmarkWidget.create(
            { },
            this.getContainer(),
            this._uiContext
        );
        this.addWidget(widget, true);
    }
    if (this._settings.developerMode) {
        widget = Exhibit.ResetHistoryWidget.create(
            { },
            this.getContainer(),
            this._uiContext
        );
        this.addWidget(widget, true);
    }
    $(this.getContainer()).addClass("exhibit-controlPanel");
};

/**
 *
 */
Exhibit.ControlPanel.prototype._setIdentifier = function() {
    this._id = $(this._div).attr("id");
    if (typeof this._id === "undefined" || this._id === null) {
        this._id = Exhibit.ControlPanel._registryKey
            + "-"
            + this._uiContext.getCollection().getID()
            + "-"
            + this._uiContext.getMain().getRegistry().generateIdentifier(
                Exhibit.ControlPanel._registryKey
            );
    }
};

/**
 *
 */
Exhibit.ControlPanel.prototype.register = function() {
    if (!this._uiContext.getMain().getRegistry().isRegistered(
        Exhibit.ControlPanel._registryKey,
        this.getID()
    )) {
        this._uiContext.getMain().getRegistry().register(
            Exhibit.ControlPanel._registryKey,
            this.getID(),
            this
        );
        this._registered = true;
    }
};

/**
 *
 */
Exhibit.ControlPanel.prototype.unregister = function() {
    this._uiContext.getMain().getRegistry().unregister(
        Exhibit.ControlPanel._registryKey,
        this.getID()
    );
    this._registered = false;
};

/**
 * @returns {jQuery}
 */
Exhibit.ControlPanel.prototype.getContainer = function() {
    return $(this._div);
};

/**
 * @returns {String}
 */
Exhibit.ControlPanel.prototype.getID = function() {
    return this._id;
};

/**
 *
 */
Exhibit.ControlPanel.prototype.childOpened = function() {
    this._childOpen = true;
};

/**
 *
 */
Exhibit.ControlPanel.prototype.childClosed = function() {
    this._childOpen = false;
};

/**
 * 
 */
Exhibit.ControlPanel.prototype.setCreatedAsDefault = function() {
    var self;
    self = this;
    this._createdAsDefault = true;
    $(this._div).hide();
    $(document).one("exhibitConfigured.exhibit", function(evt, ex) {
        var keys, component, i, place;
        component = Exhibit.ViewPanel._registryKey;
        keys = ex.getRegistry().getKeys(component);
        if (keys.length === 0) {
            component = Exhibit.View._registryKey;
            keys = ex.getRegistry().getKeys(component);
        }
        if (keys.length !== 0) {
            // Places default control panel before the "first" one - ideally,
            // this is the first of its kind presentationally to the user,
            // but it may not be.  If not, authors should be placing it
            // themselves.
            place = ex.getRegistry().get(component, keys[0]);
            if (typeof place._div !== "undefined") {
                $(place._div).before(self._div);
                $(self._div).show();
            }
        }
    });
};

/**
 * @returns {Boolean}
 */
Exhibit.ControlPanel.prototype.createdAsDefault = function() {
    return this._createdAsDefault;
};

/**
 *
 */
Exhibit.ControlPanel.prototype.dispose = function() {
    this.unregister();
    this._uiContext.dispose();
    this._uiContext = null;
    this._div = null;
    this._widgets = null;
    this._settings = null;
};

/**
 * @param {Object} widget
 * @param {Boolean} initial
 */
Exhibit.ControlPanel.prototype.addWidget = function(widget, initial) {
    this._widgets.push(widget);
    if (typeof widget.setControlPanel === "function") {
        widget.setControlPanel(this);
    }
    if (typeof initial === "undefined" || !initial) {
        this.reconstruct();
    }
};

/**
 * @param {Object} widget
 * @returns {Object}
 */
Exhibit.ControlPanel.prototype.removeWidget = function(widget) {
    var i, removed;
    removed = null;
    for (i = 0; i < this._widgets.length; i++) {
        if (this._widgets[i] === widget) {
            removed = this._widgets.splice(i, 1);
            break;
        }
    }
    this.reconstruct();
    return removed;
};

/**
 *
 */
Exhibit.ControlPanel.prototype.reconstruct = function() {
    var i;
    $(this._div).empty();
    for (i = 0; i < this._widgets.length; i++) {
        if (typeof this._widgets[i].reconstruct === "function") {
            this._widgets[i].reconstruct(this);
        }
    }
};

$(document).one(
    "registerComponents.exhibit",
    Exhibit.ControlPanel.registerComponent
);
