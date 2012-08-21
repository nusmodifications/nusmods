/**
 * @fileOverview Thumbnail view functions and UI.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @author <a href="mailto:axel@pike.org">Axel Hecht</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElement
 * @param {Exhibit.UIContext} uiContext
 */ 
Exhibit.ThumbnailView = function(containerElmt, uiContext) {
    var view = this;
    $.extend(this, new Exhibit.View(
        "thumbnail",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(Exhibit.ThumbnailView._settingSpecs);

    this._onItemsChanged = function() {
        // @@@this will ignore the stored state, which is odd
        // it should probably replace the state after doing this - 
        // or forget it since this will always ignore the stored state,
        // correctly
        view._orderedViewFrame._settings.page = 0;
        view._reconstruct();
    };
    $(uiContext.getCollection().getElement()).bind(
        "onItemsChanged.exhibit",
        view._onItemsChanged
    );

    this._orderedViewFrame = new Exhibit.OrderedViewFrame(uiContext);
    this._orderedViewFrame.parentReconstruct = function() {
        view._reconstruct();
    };
    this._orderedViewFrame.parentHistoryAction = function(child, state, title) {
        Exhibit.History.pushComponentState(
            view,
            Exhibit.View.getRegistryKey(),
            view.exportState(view.makeStateWithSub(child, state)),
            title,
            true
        );
    };

    this.register();
};

/**
 * @constant
 */
Exhibit.ThumbnailView._settingSpecs = {
    "columnCount":          { type: "int", defaultValue: -1 }
};

/**
 * Constant leftover from a now unnecessary IE hack.
 * @constant
 */
Exhibit.ThumbnailView._itemContainerClass = "exhibit-thumbnailView-itemContainer";

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ThumbnailView}
 */
Exhibit.ThumbnailView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.ThumbnailView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext, true)
    );

    view._lensRegistry = Exhibit.UIContext.createLensRegistry(
        configuration,
        uiContext.getLensRegistry()
    );

    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        view.getSettingSpecs(),
        view._settings
    );

    view._orderedViewFrame.configure(configuration);

    view._initializeUI();
    return view;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ThumbnailView}
 */
Exhibit.ThumbnailView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, view;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    view = new Exhibit.ThumbnailView(
        typeof containerElmt !== "undefined" && containerElmt !== null ?
            containerElmt :
            configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext, true)
    );

    view._lensRegistry = Exhibit.UIContext.createLensRegistryFromDOM(
        configElmt,
        configuration,
        uiContext.getLensRegistry()
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt,
        view.getSettingSpecs(),
        view._settings
    );
    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        view.getSettingSpecs(),
        view._settings
    );

    view._orderedViewFrame.configureFromDOM(configElmt);
    view._orderedViewFrame.configure(configuration);

    view._initializeUI();
    return view;
};

/**
 *
 */
Exhibit.ThumbnailView.prototype.dispose = function() {
    var view = this;
    $(this.getUIContext().getCollection().getElement()).unbind(
        "onItemsChanged.exhibit",
        view._onItemsChanged
    );

    this._orderedViewFrame.dispose();
    this._orderedViewFrame = null;

    this._lensRegistry = null;
    this._dom = null;

    this._dispose();
};

/**
 *
 */
Exhibit.ThumbnailView.prototype._initializeUI = function() {
    var self, template;

    self = this;

    $(this.getContainer()).empty();
    self._initializeViewUI(function() {
        return $(self._dom.bodyDiv).html();
    });

    template = {
        elmt: this.getContainer(),
        children: [
            {   tag: "div",
                field: "headerDiv"
            },
            {   tag: "div",
                "class": "exhibit-collectionView-body",
                field: "bodyDiv"
            },
            {   tag: "div",
                field: "footerDiv"
            }
        ]
    };

    this._dom = $.simileDOM("template", template);

    this._orderedViewFrame._divHeader = this._dom.headerDiv;
    this._orderedViewFrame._divFooter = this._dom.footerDiv;
    this._orderedViewFrame._generatedContentElmtRetriever = function() {
        return self._dom.bodyDiv;
    };

    this._orderedViewFrame.initializeUI();

    Exhibit.View.addViewState(
        this.getID(),
        this.exportState()
    );

    this._reconstruct();
};

/**
 *
 */
Exhibit.ThumbnailView.prototype._reconstruct = function() {
    if (this._settings.columnCount < 2) {
        this._reconstructWithFloats();
    } else {
        this._reconstructWithTable();
    }
};

Exhibit.ThumbnailView.prototype._reconstructWithFloats = function() {
    var view, state, closeGroups, i;
    view = this;
    state = {
        div:            this._dom.bodyDiv,
        itemContainer:  null,
        groupDoms:      [],
        groupCounts:    []
    };

    closeGroups = function(groupLevel) {
        for (i = groupLevel; i < state.groupDoms.length; i++) {
            state.groupDoms[i].countSpan.innerHTML = state.groupCounts[i];
        }
        state.groupDoms = state.groupDoms.slice(0, groupLevel);
        state.groupCounts = state.groupCounts.slice(0, groupLevel);

        if (groupLevel > 0) {
            state.div = state.groupDoms[groupLevel - 1].contentDiv;
        } else {
            state.div = view._dom.bodyDiv;
        }
        state.itemContainer = null;
    };

    this._orderedViewFrame.onNewGroup = function(groupSortKey, keyType, groupLevel) {
        closeGroups(groupLevel);

        var groupDom = Exhibit.ThumbnailView.constructGroup(
            groupLevel,
            groupSortKey
        );

        $(state.div).append(groupDom.elmt);
        state.div = groupDom.contentDiv;

        state.groupDoms.push(groupDom);
        state.groupCounts.push(0);
    };

    this._orderedViewFrame.onNewItem = function(itemID, index) {
        //if (index > 10) return;

        var i, itemLensItem, itemLens;
        if (typeof state.itemContainer === "undefined" || state.itemContainer === null) {
            state.itemContainer = Exhibit.ThumbnailView.constructItemContainer();
            $(state.div).append(state.itemContainer);
        }

        for (i = 0; i < state.groupCounts.length; i++) {
            state.groupCounts[i]++;
        }

        itemLensDiv = $("<div>");
        itemLensDiv.attr("class", Exhibit.ThumbnailView._itemContainerClass);

        itemLens = view._lensRegistry.createLens(itemID, itemLensDiv, view.getUIContext());
        state.itemContainer.append(itemLensDiv);
    };

    $(this.getContainer()).hide();

    $(this._dom.bodyDiv).empty();
    this._orderedViewFrame.reconstruct();
    closeGroups(0);

    $(this.getContainer()).show();
};

Exhibit.ThumbnailView.prototype._reconstructWithTable = function() {
    var view, state, closeGroups;
    view = this;
    state = {
        div:            this._dom.bodyDiv,
        groupDoms:      [],
        groupCounts:    [],
        table:          null,
        columnIndex:    0
    };

    closeGroups = function(groupLevel) {
        var i;
        for (i = groupLevel; i < state.groupDoms.length; i++) {
            state.groupDoms[i].countSpan.innerHTML = state.groupCounts[i];
        }
        state.groupDoms = state.groupDoms.slice(0, groupLevel);
        state.groupCounts = state.groupCounts.slice(0, groupLevel);

        if (groupLevel > 0) {
            state.div = state.groupDoms[groupLevel - 1].contentDiv;
        } else {
            state.div = view._dom.bodyDiv;
        }
        state.itemContainer = null;
        state.table = null;
        state.columnIndex = 0;
    };

    this._orderedViewFrame.onNewGroup = function(groupSortKey, keyType, groupLevel) {
        closeGroups(groupLevel);

        var groupDom = Exhibit.ThumbnailView.constructGroup(
            groupLevel,
            groupSortKey
        );

        $(state.div).append(groupDom.elmt);
        state.div = groupDom.contentDiv;

        state.groupDoms.push(groupDom);
        state.groupCounts.push(0);
    };

    this._orderedViewFrame.onNewItem = function(itemID, index) {
        //if (index > 10) return;

        var i, td, itemLensDiv, ItemLens;
        if (state.columnIndex >= view._settings.columnCount) {
            state.columnIndex = 0;
        }

        if (typeof state.table === "undefined" || state.table === null) {
            state.table = Exhibit.ThumbnailView.constructTableItemContainer();
            $(state.div).append(state.table);
        }

        // one could jQuerify this with just append, but it seems less
        // precise than this DOM-based method
        if (state.columnIndex === 0) {
            state.table.insertRow(state.table.rows.length);
        }
        td = state.table.rows[state.table.rows.length - 1].insertCell(state.columnIndex++);

        for (i = 0; i < state.groupCounts.length; i++) {
            state.groupCounts[i]++;
        }

        itemLensDiv = $("<div>");
        itemLensDiv.attr("class", Exhibit.ThumbnailView._itemContainerClass);

        itemLens = view._lensRegistry.createLens(itemID, itemLensDiv, view.getUIContext());
        $(td).append(itemLensDiv);
    };

    $(this.getContainer()).hide();

    $(this._dom.bodyDiv).empty();
    this._orderedViewFrame.reconstruct();
    closeGroups(0);

    $(this.getContainer()).show();
};


/**
 * @returns {Object}
 */
Exhibit.ThumbnailView.prototype.makeState = function() {
    return {};
};

/**
 * @param {String} sub
 * @param {Object} state
 * @returns {Object}
 */
Exhibit.ThumbnailView.prototype.makeStateWithSub = function(sub, state) {
    var original;
    original = this.makeState();
    original[sub] = state;
    return original;
};

/**
 * @param {Object} state
 * @returns {Object}
 */
Exhibit.ThumbnailView.prototype.exportState = function(state) {
    if (typeof state === "undefined" || state === null) {
        return this.makeStateWithSub(this._orderedViewFrame._historyKey,
                                     this._orderedViewFrame.exportState());
    } else {
        return state;
    }
};

/**
 * @param {Object} state
 * @param {Object} state.orderedViewFrame
 */
Exhibit.ThumbnailView.prototype.importState = function(state) {
    if (this._orderedViewFrame !== null && this.stateDiffers(state)) {
        this._orderedViewFrame.importState(state.orderedViewFrame);
    }
};

/**
 * @param {Object} state
 * @param {Object} state.orderedViewFrame
 * @returns {Boolean}
 */
Exhibit.ThumbnailView.prototype.stateDiffers = function(state) {
    if (typeof state.orderedViewFrame !== "undefined") {
        return this._orderedViewFrame.stateDiffers(state.orderedViewFrame);
    } else {
        return false;
    }
};

/**
 * @static
 * @param {Number} groupLevel
 * @param {String} label
 * @returns {Element}
 */
Exhibit.ThumbnailView.constructGroup = function(groupLevel, label) {
    var template = {
        tag: "div",
        "class": "exhibit-thumbnailView-group",
        children: [
            {   tag: "h" + (groupLevel + 1),
                children: [ 
                    label,
                    {   tag:        "span",
                        "class":  "exhibit-collectionView-group-count",
                        children: [
                            " (",
                            {   tag: "span",
                                field: "countSpan"
                            },
                            ")"
                        ]
                    }
                ],
                field: "header"
            },
            {   tag: "div",
                "class": "exhibit-collectionView-group-content",
                field: "contentDiv"
            }
        ]
    };
    return $.simileDOM("template", template);
};

/**
 * @returns {jQuery}
 */
Exhibit.ThumbnailView.constructItemContainer = function() {
    var div = $("<div>");
    div.addClass("exhibit-thumbnailView-body");
    return div;
};
    
/**
 * @returns table element
 */
Exhibit.ThumbnailView.constructTableItemContainer = function() {
    var table = $("<table>");
    table.addClass("exhibit-thumbnailView-body");
    return table.get(0);
};
