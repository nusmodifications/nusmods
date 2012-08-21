/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.UIContext} uiContext
 */ 
Exhibit.OrderedViewFrame = function(uiContext) {
    this._uiContext = uiContext;
    
    this._orders = null;
    this._possibleOrders = null;
    this._settings = {};

    this._historyKey = "orderedViewFrame";

    // functions to be defined by framed view
    this.parentReconstruct = null;
    this.parentHistoryAction = null;
};

/**
 * @constant
 */
Exhibit.OrderedViewFrame._settingSpecs = {
    "showAll":                  { type: "boolean", defaultValue: false },
    "grouped":                  { type: "boolean", defaultValue: true },
    "showDuplicates":           { type: "boolean", defaultValue: false },
    "abbreviatedCount":         { type: "int",     defaultValue: 10 },
    "showHeader":               { type: "boolean", defaultValue: true },
    "showSummary":              { type: "boolean", defaultValue: true },
    "showControls":             { type: "boolean", defaultValue: true },
    "showFooter":               { type: "boolean", defaultValue: true },
    "paginate":                 { type: "boolean", defaultValue: false },
    "pageSize":                 { type: "int",     defaultValue: 20 },
    "pageWindow":               { type: "int",     defaultValue: 2 },
    "page":                     { type: "int",     defaultValue: 0 },
    "alwaysShowPagingControls": { type: "boolean", defaultValue: false },
    "pagingControlLocations":   { type: "enum",    defaultValue: "topbottom",
                                  choices: [ "top", "bottom", "topbottom" ] }
};

/**
 * @param {Object} configuration
 */
Exhibit.OrderedViewFrame.prototype.configure = function(configuration) {
    if (typeof configuration.orders !== "undefined") {
        this._orders = [];
        this._configureOrders(configuration.orders);
    }
    if (typeof configuration.possibleOrders !== "undefined") {
        this._possibleOrders = [];
        this._configurePossibleOrders(configuration.possibleOrders);
    }

    Exhibit.SettingsUtilities.collectSettings(
        configuration, Exhibit.OrderedViewFrame._settingSpecs, this._settings);
        
    this._internalValidate();
};

/**
 * @param {Element} domConfiguration
 */
Exhibit.OrderedViewFrame.prototype.configureFromDOM = function(domConfiguration) {
    var orders, directions, i, possibleOrders, possibleDirections;
    orders = Exhibit.getAttribute(domConfiguration, "orders", ",");
    if (typeof orders !== "undefined" && orders !== null && orders.length > 0) {
        this._orders = [];
        this._configureOrders(orders);
    }
    
    directions = Exhibit.getAttribute(domConfiguration, "directions", ",");
    if (typeof directions !== "undefined" && directions !== null && directions.length > 0 && this._orders !== null) {
        for (i = 0; i < directions.length && i < this._orders.length; i++) {
            this._orders[i].ascending = (directions[i].toLowerCase() !== "descending");
        }
    }
    
    possibleOrders = Exhibit.getAttribute(domConfiguration, "possibleOrders", ",");
    if (typeof possibleOrders !== "undefined" && possibleOrders !== null && possibleOrders.length > 0) {
        this._possibleOrders = [];
        this._configurePossibleOrders(possibleOrders);
    }

    possibleDirections = Exhibit.getAttribute(domConfiguration, "possibleDirections", ",");
    if (typeof possibleDirections !== "undefined" && possibleDirections !== null && possibleDirections.length > 0 && typeof this._possibleOrders !== "undefined" && this._possibleOrders !== null) {
        for (i = 0; i < possibleDirections.length && i < this._possibleOrders.length; i++) {
            this._possibleOrders[i].ascending = (possibleDirections[i].toLowerCase() !== "descending");
        }
    }
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        domConfiguration, Exhibit.OrderedViewFrame._settingSpecs, this._settings);
        
    this._internalValidate();
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype.dispose = function() {
    if (this._headerDom) {
        this._headerDom.dispose();
        this._headerDom = null;
    }
    if (this._footerDom) {
        this._footerDom.dispose();
        this._footerDom = null;
    }
    
    this._divHeader = null;
    this._divFooter = null;
    this._uiContext = null;
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype._internalValidate = function() {
    if (this._orders !== null && this._orders.length === 0) {
        this._orders = null;
    }
    if (this._possibleOrders !== null && this._possibleOrders.length === 0) {
        this._possibleOrders = null;
    }
    if (this._settings.paginate) {
        this._settings.grouped = false;
    }
};

/**
 * @param {Array} orders
 */
Exhibit.OrderedViewFrame.prototype._configureOrders = function(orders) {
    var i, order, expr, ascending, expression, path, segment;
    for (i = 0; i < orders.length; i++) {
        order = orders[i];
        ascending = true;
        expr = null;

        if (typeof order === "string") {
            expr = order;
        } else if (typeof order === "object") {
            expr = order.expression;
            ascending = (typeof order.ascending !== "undefined") ?
                (order.ascending) :
                true;
        }

        if (expr !== null) {
            try {
                expression = Exhibit.ExpressionParser.parse(expr);
                if (expression.isPath()) {
                    path = expression.getPath();
                    if (path.getSegmentCount() === 1) {
                        segment = path.getSegment(0);
                        this._orders.push({
                            property:   segment.property,
                            forward:    segment.forward,
                            ascending:  ascending
                        });
                    }
                }
            } catch (e) {
                Exhibit.Debug.warn(Exhibit._("%orderedViewFrame.error.orderExpression", expr));
            }
        } else {
            Exhibit.Debug.warn(Exhibit._("%orderedViewFrame.error.orderObject", JSON.stringify(order)));
        }
    }
};

/**
 * @param {Array} possibleOrders
 */
Exhibit.OrderedViewFrame.prototype._configurePossibleOrders = function(possibleOrders) {
    var i, order, expr, ascending, expression, path, segment;
    for (i = 0; i < possibleOrders.length; i++) {
        order = possibleOrders[i];
        ascending = true;
        expr = null;
        
        if (typeof order === "string") {
            expr = order;
        } else if (typeof order === "object") {
            expr = order.expression;
            ascending = (typeof order.ascending !== "undefined") ?
                (order.ascending) :
                true;
        }

        if (expr !== null) {
            try {
                expression = Exhibit.ExpressionParser.parse(expr);
                if (expression.isPath()) {
                    path = expression.getPath();
                    if (path.getSegmentCount() === 1) {
                        segment = path.getSegment(0);
                        this._possibleOrders.push({
                            property:   segment.property,
                            forward:    segment.forward,
                            ascending:  ascending
                        });
                    }
                }
            } catch (e) {
                Exhibit.Debug.warn(Exhibit._("%orderedViewFrame.error.possibleOrderExpression", expr));
            }
        }  else {
            Exhibit.Debug.warn(Exhibit._("%orderedViewFrame.error.possibleOrderObject", JSON.stringify(order)));
        }
    }
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype.initializeUI = function() {
    var self;
    self = this;
    if (this._settings.showHeader) {
        this._headerDom = Exhibit.OrderedViewFrame.createHeaderDom(
            this._uiContext,
            this._divHeader, 
            this._settings.showSummary,
            this._settings.showControls,
            function(evt) { self._openSortPopup(evt, -1); },
            function(evt) { self._toggleGroup(evt); },
            function(pageIndex) { self._gotoPage(pageIndex); }
        );
    }
    if (this._settings.showFooter) {
        this._footerDom = Exhibit.OrderedViewFrame.createFooterDom(
            this._uiContext,
            this._divFooter, 
            function(evt) { self._setShowAll(true); },
            function(evt) { self._setShowAll(false); },
            function(pageIndex) { self._gotoPage(pageIndex); }
        );
    }
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype.reconstruct = function() {
    var self, collection, database, originalSize, currentSize, hasSomeGrouping, currentSet, orderElmts, buildOrderElmt, orders;
    self = this;
    collection = this._uiContext.getCollection();
    database = this._uiContext.getDatabase();
    
    originalSize = collection.countAllItems();
    currentSize = collection.countRestrictedItems();
    
    hasSomeGrouping = false;
    if (currentSize > 0) {
        currentSet = collection.getRestrictedItems();
        
        hasSomeGrouping = this._internalReconstruct(currentSet);
        
        /*
         *  Build sort controls
         */
        orderElmts = [];
        buildOrderElmt = function(order, index) {
            var property, label;
            property = database.getProperty(order.property);
            label = (typeof property !== "undefined" && property !== null) ?
                (order.forward ? property.getPluralLabel() : property.getReversePluralLabel()) :
                (order.forward ? order.property : "reverse of " + order.property);
                
            orderElmts.push(Exhibit.UI.makeActionLink(
                label,
                function(evt) {
                    self._openSortPopup(evt, index);
                }
            ));
        };
        orders = this._getOrders();
        for (i = 0; i < orders.length; i++) {
            buildOrderElmt(orders[i], i);
        }
        
        if (this._settings.showHeader && this._settings.showControls) {
            this._headerDom.setOrders(orderElmts);
            this._headerDom.enableThenByAction(orderElmts.length < this._getPossibleOrders().length);
        }
    }
    
    if (this._settings.showHeader && this._settings.showControls) {
        this._headerDom.groupOptionWidget.setChecked(this._settings.grouped);
    }

    if (this._settings.showFooter) {
        this._footerDom.setCounts(
            currentSize, 
            this._settings.abbreviatedCount, 
            this._settings.showAll, 
            (!(hasSomeGrouping && this._settings.grouped)
             && !this._settings.paginate)
        );
    }
};

/** 
 * @param {Exhibit.Set} allItems
 * @returns {Boolean}
 */
Exhibit.OrderedViewFrame.prototype._internalReconstruct = function(allItems) {
    var self, settings, database, orders, itemIndex, hasSomeGrouping, createItem, createGroup, processLevel, processNonNumericLevel, processNumericLevel, totalCount, pageCount, fromIndex, toIndex;
    self = this;
    settings = this._settings;
    database = this._uiContext.getDatabase();
    orders = this._getOrders();
    itemIndex = 0;
    
    hasSomeGrouping = false;
    createItem = function(itemID) {
        if ((itemIndex >= fromIndex && itemIndex < toIndex) || (hasSomeGrouping && settings.grouped)) {
            self.onNewItem(itemID, itemIndex);
        }
        itemIndex++;
    };
    createGroup = function(label, valueType, index) {
        if ((itemIndex >= fromIndex && itemIndex < toIndex) || (hasSomeGrouping && settings.grouped)) {
            self.onNewGroup(label, valueType, index);
        }
    };

    processLevel = function(items, index) {
        var order, values, valueType, property, keys, grouped, k, key;
        order = orders[index];
         values = order.forward ? 
            database.getObjectsUnion(items, order.property) : 
            database.getSubjectsUnion(items, order.property);
        
        valueType = "text";
        if (order.forward) {
            property = database.getProperty(order.property);
            valueType = (typeof property !== "undefined" && property !== null) ? property.getValueType() : "text";
        } else {
            valueType = "item";
        }
        
        keys = (valueType === "item" || valueType === "text") ?
            processNonNumericLevel(items, index, values, valueType) :
            processNumericLevel(items, index, values, valueType);
        
        grouped = false;
        for (k = 0; k < keys.length; k++) {
            if (keys[k].items.size() > 1) {
                grouped = true;
            }
        }

        if (grouped) {
            hasSomeGrouping = true;
        }
        
        for (k = 0; k < keys.length; k++) {
            key = keys[k];
            if (key.items.size() > 0) {
                if (grouped && settings.grouped) {
                    createGroup(key.display, valueType, index);
                }
                
                items.removeSet(key.items);
                if (key.items.size() > 1 && index < orders.length - 1) {
                    processLevel(key.items, index+1);
                } else {
                    key.items.visit(createItem);
                }
            }
        }
        
        if (items.size() > 0) {
            if (grouped && settings.grouped) {
                createGroup(Exhibit._("%general.missingSortKey"), valueType, index);
            }
            
            if (items.size() > 1 && index < orders.length - 1) {
                processLevel(items, index+1);
            } else {
                items.visit(createItem);
            }
        }
    };
    
    processNonNumericLevel = function(items, index, values, valueType) {
        var keys, compareKeys, retrieveItems, order, k, key, vals;
        keys = [];
        order = orders[index];
        
        if (valueType === "item") {
            values.visit(function(itemID) {
                var label = database.getObject(itemID, "label");
                label = (typeof label !== "undefined" && label !== null) ? label : itemID;
                keys.push({ itemID: itemID, display: label });
            });
            
            compareKeys = function(key1, key2) {
                var c = key1.display.localeCompare(key2.display);
                return c !== 0 ? c : key1.itemID.localeCompare(key2.itemID);
            };
            
            retrieveItems = order.forward ? function(key) {
                return database.getSubjects(key.itemID, order.property, null, items);
            } : function(key) {
                return database.getObjects(key.itemID, order.property, null, items);
            };
        } else { //text
            values.visit(function(value) {
                keys.push({ display: value });
            });
            
            compareKeys = function(key1, key2) {
                return key1.display.localeCompare(key2.display);
            };
            retrieveItems = order.forward ? function(key) {
                return database.getSubjects(key.display, order.property, null, items);
            } : function(key) {
                return database.getObjects(key.display, order.property, null, items);
            };
        }
        
        keys.sort(function(key1, key2) { 
            return (order.ascending ? 1 : -1) * compareKeys(key1, key2); 
        });
        
        for (k = 0; k < keys.length; k++) {
            key = keys[k];
            key.items = retrieveItems(key);
            if (!settings.showDuplicates) {
                items.removeSet(key.items);
            }
        }
        
        return keys;
    };
    
    processNumericLevel = function(items, index, values, valueType) {
        var keys, keyMap, order, valueParser, key, k, v;
        keys = [];
        keyMap = {};
        order = orders[index];
        
        if (valueType === "number") {
            valueParser = function(value) {
                if (typeof value === "number") {
                    return value;
                } else {
                    try {
                        return parseFloat(value);
                    } catch (e) {
                        return null;
                    }
                }
            };
        } else { //date
            valueParser = function(value) {
                if (value instanceof Date) {
                    return value.getTime();
                } else {
                    try {
                        return Exhibit.DateTime.parseIso8601DateTime(value.toString()).getTime();
                    } catch (e) {
                        return null;
                    }
                }
            };
        }
        
        values.visit(function(value) {
            var sortkey, key;
            sortkey = valueParser(value);
            if (typeof sortKey !== "undefined" && sortkey !== null) {
                key = keyMap[sortkey];
                if (!key) {
                    key = { sortkey: sortkey, display: value, values: [], items: new Exhibit.Set() };
                    keyMap[sortkey] = key;
                    keys.push(key);
                }
                key.values.push(value);
            }
        });
        
        keys.sort(function(key1, key2) { 
            return (order.ascending ? 1 : -1) * (key1.sortkey - key2.sortkey); 
        });
        
        for (k = 0; k < keys.length; k++) {
            key = keys[k];
            vals = key.values;
            for (v = 0; v < vals.length; v++) {
                if (order.forward) {
                    database.getSubjects(vals[v], order.property, key.items, items);
                } else {
                    database.getObjects(vals[v], order.property, key.items, items);
                }
            }
            
            if (!settings.showDuplicates) {
                items.removeSet(key.items);
            }
        }
        
        return keys;
    };

    totalCount = allItems.size();
    pageCount = Math.ceil(totalCount / settings.pageSize);
    fromIndex = 0;
    toIndex = settings.showAll ? totalCount : Math.min(totalCount, settings.abbreviatedCount);
    
    if (!settings.grouped && settings.paginate && (pageCount > 1 || (pageCount > 0 && settings.alwaysShowPagingControls))) {
        fromIndex = settings.page * settings.pageSize;
        toIndex = Math.min(fromIndex + settings.pageSize, totalCount);
        
        if (settings.showHeader && (settings.pagingControlLocations === "top" || settings.pagingControlLocations === "topbottom")) {
            this._headerDom.renderPageLinks(
                settings.page,
                pageCount,
                settings.pageWindow
            );
        }
        if (settings.showFooter && (settings.pagingControlLocations === "bottom" || settings.pagingControlLocations === "topbottom")) {
            this._footerDom.renderPageLinks(
                settings.page,
                pageCount,
                settings.pageWindow
            );
        }
    } else {
        if (settings.showHeader) {
            this._headerDom.hidePageLinks();
        }
        if (settings.showFooter) {
            this._footerDom.hidePageLinks();
        }
    }
    
    processLevel(allItems, 0);
    
    return hasSomeGrouping;
};

/**
 * @returns {Array}
 */
Exhibit.OrderedViewFrame.prototype._getOrders = function() {
    return this._orders || [ this._getPossibleOrders()[0] ];
};

/**
 * @returns {Array}
 */
Exhibit.OrderedViewFrame.prototype._getPossibleOrders = function() {
    var possibleOrders, i, p;
    possibleOrders = null;
    if (typeof this._possibleOrders === "undefined" ||
        this._possibleOrders === null) {
        possibleOrders = this._uiContext.getDatabase().getAllProperties();
        for (i = 0; i < possibleOrders.length; i++ ) {
            p = possibleOrders[i];
            possibleOrders[i] = { ascending:true, forward:true, property:p };
        }
    } else {
        possibleOrders = [].concat(this._possibleOrders);
    }
    
    if (possibleOrders.length === 0) {
        possibleOrders.push({
            property:   "label", 
            forward:    true, 
            ascending:  true 
        });
    }
    return possibleOrders;
};

/**
 * @pararm {jQuery.Event} evt
 * @param {Number} index
 * @returns {Object}
 */
Exhibit.OrderedViewFrame.prototype._openSortPopup = function(evt, index) {
    var self, database, popupDom, configuredOrders, order, property, propertyLabel, valueType, sortLabels, orders, possibleOrders, possibleOrder, skip, j, existingOrder, appendOrder;
    self = this;
    database = this._uiContext.getDatabase();
    
    popupDom = Exhibit.UI.createPopupMenuDom(evt.target);

    /*
     *  Ascending/descending/remove options for the current order
     */
    configuredOrders = this._getOrders();
    if (index >= 0) {
        order = configuredOrders[index];
        property = database.getProperty(order.property);
        propertyLabel = order.forward ? property.getPluralLabel() : property.getReversePluralLabel();
        valueType = order.forward ? property.getValueType() : "item";
        sortLabels = Exhibit.ViewUtilities.getSortLabels(valueType);

        popupDom.appendMenuItem(
            sortLabels.ascending, 
            Exhibit.urlPrefix +
                (order.ascending ? "images/option-check.png" : "images/option.png"),
            order.ascending ?
                function() {} :
                function() {
                    self._reSort(
                        index, 
                        order.property, 
                        order.forward, 
                        true,
                        false
                    );
                }
        );
        popupDom.appendMenuItem(
            sortLabels.descending, 
            Exhibit.urlPrefix +
                (order.ascending ? "images/option.png" : "images/option-check.png"),
            order.ascending ?
                function() {
                    self._reSort(
                        index, 
                        order.property, 
                        order.forward, 
                        false,
                        false
                    );
                } :
                function() {}
        );
        if (configuredOrders.length > 1) {
            popupDom.appendSeparator();
            popupDom.appendMenuItem(
                Exhibit._("%orderedViewFrame.removeOrderLabel"),
                null,
                function() {self._removeOrder(index);}
            );
        }
    }
    
    /*
     *  The remaining possible orders
     */
    orders = [];
    possibleOrders = this._getPossibleOrders();
    for (i = 0; i < possibleOrders.length; i++) {
        possibleOrder = possibleOrders[i];
        skip = false;
        for (j = (index < 0) ? configuredOrders.length - 1 : index; j >= 0; j--) {
            existingOrder = configuredOrders[j];
            if (existingOrder.property === possibleOrder.property && 
                existingOrder.forward === possibleOrder.forward) {
                skip = true;
                break;
            }
        }
        
        if (!skip) {
            property = database.getProperty(possibleOrder.property);
            orders.push({
                property:   possibleOrder.property,
                forward:    possibleOrder.forward,
                ascending:  possibleOrder.ascending,
                label:      possibleOrder.forward ? 
                                property.getPluralLabel() : 
                                property.getReversePluralLabel()
            });
        }
    }
    
    if (orders.length > 0) {
        if (index >= 0) {
            popupDom.appendSeparator();
        }
        
        orders.sort(function(order1, order2) {
            return order1.label.localeCompare(order2.label);
        });
        
        appendOrder = function(order) {
            popupDom.appendMenuItem(
                order.label,
                null,
                function() {
                    self._reSort(
                        index, 
                        order.property, 
                        order.forward, 
                        order.ascending,
                        true
                    );
                }
            );
        };
        
        for (i = 0; i < orders.length; i++) {
            appendOrder(orders[i]);
        }
    }
    popupDom.open(evt);
};

/**
 * @param {Number} index
 * @param {String} propertyID
 * @param {Boolean} forward
 * @param {Boolean} ascending
 * @param {Number} slice
 */
Exhibit.OrderedViewFrame.prototype._reSort = function(index, propertyID, forward, ascending, slice) {
    var newOrders, property, propertyLabel, valueType, sortLabels;
    oldOrders = this._getOrders();
    index = (index < 0) ? oldOrders.length : index;
    
    newOrders = oldOrders.slice(0, index);
    newOrders.push({ property: propertyID, forward: forward, ascending: ascending });
    if (!slice) {
        newOrders = newOrders.concat(oldOrders.slice(index+1));
    }
    
    property = this._uiContext.getDatabase().getProperty(propertyID);
    propertyLabel = forward ? property.getPluralLabel() : property.getReversePluralLabel();
    valueType = forward ? property.getValueType() : "item";
    sortLabels = Exhibit.ViewUtilities.getSortLabels(valueType);

    this.parentHistoryAction(
        this._historyKey,
        this.makeState(newOrders),
        Exhibit._("%orderedViewFrame.formatSortActionTitle",
            propertyLabel,
            ascending ?
                sortLabels.ascending :
                sortLabels.descending
        )
    );
};

/**
 * @param {Number} index
 */
Exhibit.OrderedViewFrame.prototype._removeOrder = function(index) {
    var oldOrders, newOrders, order, property, propertyLabel, valueType, sortLabels;
    oldOrders = this._getOrders();
    newOrders = oldOrders.slice(0, index).concat(oldOrders.slice(index + 1));
    
    order = oldOrders[index];
    property = this._uiContext.getDatabase().getProperty(order.property);
    propertyLabel = order.forward ?
        property.getPluralLabel() :
        property.getReversePluralLabel();
    valueType = order.forward ?
        property.getValueType() :
        "item";
    sortLabels = Exhibit.ViewUtilities.getSortLabels(valueType);
    
    this.parentHistoryAction(
        this._historyKey,
        this.makeState(newOrders),
        Exhibit._("%orderedViewFrame.formatRemoveOrderActionTitle",
            propertyLabel, order.ascending ?
                sortLabels.ascending :
                sortLabels.descending)
    );
};

/**
 * @param {Boolean} showAll
 */
Exhibit.OrderedViewFrame.prototype._setShowAll = function(showAll) {
    this.parentHistoryAction(
        this._historyKey,
        this.makeState(null, showAll),
        Exhibit._(
            showAll ?
                "%orderedViewFrame.showAllActionTitle" :
                "%orderedViewFrame.dontShowAllActionTitle")
    );
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype._toggleGroup = function() {
    var oldGrouped;
    oldGrouped = this._settings.grouped;

    this.parentHistoryAction(
        this._historyKey,
        this.makeState(null, !oldGrouped ? true : null, null, !oldGrouped),
        Exhibit._(
            oldGrouped ?
                "%orderedViewFrame.ungroupAsSortedActionTitle" :
                "%orderedViewFrame.groupAsSortedActionTitle")
    );
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype._toggleShowDuplicates = function() {
    var oldShowDuplicates;
    oldShowDuplicates = this._settings.showDuplicates;

    this.parentHistoryAction(
        this._historyKey,
        this.makeState(null, null, !oldShowDuplicates),
        Exhibit._(
            oldShowDuplicates ?
                "%orderedViewFrame.hideDuplicatesActionTitle" :
                "%orderedViewFrame.showDuplicatesActionTitle")
    );
};

/**
 * @param {Number} pageIndex
 */ 
Exhibit.OrderedViewFrame.prototype._gotoPage = function(pageIndex) {
    this.parentHistoryAction(
        this._historyKey,
        this.makeState(null, null, null, null, pageIndex),
        Exhibit.ViewUtilities.makePagingActionTitle(pageIndex)
    );
};

/**
 * @constant
 */
Exhibit.OrderedViewFrame.headerTemplate =
    '<div id="collectionSummaryDiv" style="display: none;"></div>' +
    '<div class="exhibit-collectionView-header-sortControls" style="display: none;" id="controlsDiv">' +
        '%1$s' + // sorting controls template
        '<span class="exhibit-collectionView-header-groupControl"> &bull; ' +
            '<a id="groupOption" class="exhibit-action"></a>' + 
        '</span>' +
    '</div>';

/**
 * @param {Exhibit.UIContext} uiContext
 * @param {Element} headerDiv
 * @param {Boolean} showSummary
 * @param {Boolean} showControls
 * @param {Function} onThenSortBy
 * @param {Function} onGroupToggle
 * @param {Function} gotoPage
 * @returns {Object}
 */
Exhibit.OrderedViewFrame.createHeaderDom = function(
    uiContext,
    headerDiv,
    showSummary,
    showControls,
    onThenSortBy,
    onGroupToggle,
    gotoPage
) {
    var template, dom;
    template = sprintf(
        Exhibit.OrderedViewFrame.headerTemplate +
            '<div class="exhibit-collectionView-pagingControls" style="display: none;" id="topPagingDiv"></div>',
        Exhibit._("%orderedViewFrame.sortingControlsTemplate"));

    dom = $.simileDOM("string", headerDiv, template, {});
    $(headerDiv).attr("class", "exhibit-collectionView-header");
    
    if (showSummary) {
        $(dom.collectionSummaryDiv).show();
        dom.collectionSummaryWidget = Exhibit.CollectionSummaryWidget.create(
            {},
            dom.collectionSummaryDiv, 
            uiContext
        );
    }
    if (showControls) {
        $(dom.controlsDiv).show();
        dom.groupOptionWidget = Exhibit.OptionWidget.create(
            {   label:      Exhibit._("%orderedViewFrame.groupedAsSortedOptionLabel"),
                onToggle:   onGroupToggle
            },
            dom.groupOption,
            uiContext
        );

        $(dom.thenSortByAction).bind("click", onThenSortBy);

        dom.enableThenByAction = function(enabled) {
            Exhibit.UI.enableActionLink(dom.thenSortByAction, enabled);
        };
        dom.setOrders = function(orderElmts) {
            var addDelimter, i;
            $(dom.ordersSpan).empty();
            
            addDelimiter = Exhibit.Formatter.createListDelimiter(dom.ordersSpan, orderElmts.length, uiContext);
            for (i = 0; i < orderElmts.length; i++) {
                addDelimiter();
                $(dom.ordersSpan).append(orderElmts[i]);
            }
            addDelimiter();
        };
    }
    dom.renderPageLinks = function(page, totalPage, pageWindow) {
        Exhibit.OrderedViewFrame.renderPageLinks(dom.topPagingDiv, page, totalPage, pageWindow, gotoPage);
        $(dom.topPagingDiv).show();
    };
    dom.hidePageLinks = function() {
        $(dom.topPagingDiv).hide();
    };
    dom.dispose = function() {
        if (typeof dom.collectionSummaryWidget !== "undefined") {
            dom.collectionSummaryWidget.dispose();
            dom.collectionSummaryWidget = null;
        }
        
        dom.groupOptionWidget.dispose();
        dom.groupOptionWidget = null;
    };
    
    return dom;
};

/**
 * @constant
 */
Exhibit.OrderedViewFrame.footerTemplate = "<div id='showAllSpan'></div>";

/**
 * @param {Exhibit.UIContext} uiContext
 * @param {Element} footerDiv
 * @param {Function} onShowAll
 * @param {Function} onDontShowAll
 * @param {Function} gotoPage
 * @returns {Object}
 */ 
Exhibit.OrderedViewFrame.createFooterDom = function(
    uiContext,
    footerDiv,
    onShowAll,
    onDontShowAll,
    gotoPage
) {
    var dom;
    
    dom = $.simileDOM(
        "string",
        footerDiv,
        Exhibit.OrderedViewFrame.footerTemplate +
            '<div class="exhibit-collectionView-pagingControls" style="display: none;" id="bottomPagingDiv"></div>',
        {}
    );
    $(footerDiv).attr("class", "exhibit-collectionView-footer");
    
    dom.setCounts = function(count, limitCount, showAll, canToggle) {
        $(dom.showAllSpan).empty();
        if (canToggle && count > limitCount) {
            $(dom.showAllSpan).show();
            if (showAll) {
                $(dom.showAllSpan).append(
                    Exhibit.UI.makeActionLink(
                        Exhibit._("%orderedViewFrame.formatDontShowAll", limitCount), onDontShowAll));
            } else {
                $(dom.showAllSpan).append(
                    Exhibit.UI.makeActionLink(
                        Exhibit._("%orderedViewFrame.formatShowAll", count), onShowAll));
            }
        }
    };
    dom.renderPageLinks = function(page, totalPage, pageWindow) {
        Exhibit.OrderedViewFrame.renderPageLinks(dom.bottomPagingDiv, page, totalPage, pageWindow, gotoPage);
        $(dom.bottomPagingDiv).show();
        $(dom.showAllSpan).hide();
    };
    dom.hidePageLinks = function() {
        $(dom.bottomPagingDiv).hide();
    };
    dom.dispose = function() {};
    
    return dom;
};

/**
 * @param {Element} parentElmt
 * @param {Number} page
 * @param {Number} pageCount
 * @param {Number} pageWindow
 * @param {Function} gotoPage
 */
Exhibit.OrderedViewFrame.renderPageLinks = function(parentElmt, page, pageCount, pageWindow, gotoPage) {
    var self, renderPageLink, renderPageNumber, renderHTML, pageWindowStart, pageWindowEnd, i;
    
    $(parentElmt).attr("class", "exhibit-collectionView-pagingControls");
    $(parentElmt).empty();
    
    self = this;
    renderPageLink = function(label, index) {
        var elmt, a, handler;
        elmt = $("<span>")
            .attr("class", "exhibit-collectionView-pagingControls-page");
        $(parentElmt).append(elmt);
        
        a = $("<a>")
            .html(label)
            .attr("href", "#")
            .attr("title", Exhibit.ViewUtilities.makePagingLinkTooltip(index));
        elmt.append(a);
        
        handler = function(evt) {
            gotoPage(index);
            evt.preventDefault();
            evt.stopPropagation();
        };
        a.bind("click", handler);
    };

    renderPageNumber = function(index) {
        if (index === page) {
            var elmt = $("<span>")
                .attr("class",
                      "exhibit-collectionView-pagingControls-currentPage")
                .html(index + 1);
            
            $(parentElmt).append(elmt);
        } else {
            renderPageLink(index + 1, index);
        }
    };
    renderHTML = function(html) {
        var elmt = $("<span>")
            .html(html);
        
        $(parentElmt).append(elmt);
    };
    
    if (page > 0) {
        renderPageLink(Exhibit._("%orderedViewFrame.previousPage"), page - 1);
        if (Exhibit._("%orderedViewFrame.pageSeparator").length > 0) {
            renderHTML(" ");
        }
    }
    
    pageWindowStart = 0;
    pageWindowEnd = pageCount - 1;
    
    if (page - pageWindow > 1) {
        renderPageNumber(0);
        renderHTML(Exhibit._("%orderedViewFrame.pageWindowEllipses"));
        
        pageWindowStart = page - pageWindow;
    }
    if (page + pageWindow < pageCount - 2) {
        pageWindowEnd = page + pageWindow;
    }
    
    for (i = pageWindowStart; i <= pageWindowEnd; i++) {
        if (i > pageWindowStart && Exhibit._("%orderedViewFrame.pageSeparator").length > 0) {
            renderHTML(Exhibit._("%orderedViewFrame.pageSeparator"));
        }
        renderPageNumber(i);
    }
    
    if (pageWindowEnd < pageCount - 1) {
        renderHTML(Exhibit._("%orderedViewFrame.pageWindowEllipses"));
        renderPageNumber(pageCount - 1);
    }
    
    if (page < pageCount - 1) {
        if (Exhibit._("%orderedViewFrame.pageSeparator").length > 0) {
            renderHTML(" ");
        }
        renderPageLink(Exhibit._("%orderedViewFrame.nextPage"), page + 1);
    }
};

/**
 * Sub-component of components with identifiers, does not need its
 * own identifier.
 * @param {Object} [state]
 * @returns {Object}
 */
Exhibit.OrderedViewFrame.prototype.exportState = function(state) {
    if (typeof state === "undefined" || state === null) {
        return this.makeState();
    } else {
        return state;
    }
};

/**
 * @param {Object} state
 * @param {Array} state.orders
 * @param {Boolean} state.showAll
 * @param {Boolean} state.showDuplicates
 * @param {Boolean} state.grouped
 * @param {Number} state.page
 */
Exhibit.OrderedViewFrame.prototype.importState = function(state) {
    var changed, i, currentOrders;
    changed = false;

    // too many toggles to bother with monolithic state difference checking,
    // check each in turn
    if (state.grouped !== this._settings.grouped) {
        this._settings.grouped = state.grouped;
        changed = true;
    }
    if (state.showAll !== this._settings.showAll) {
        this._settings.showAll = state.showAll;
        changed = true;
    }
    if (state.showDuplicates !== this._settings.showDuplicates) {
        this._settings.showDuplicates = showDuplicates;
        changed = true;
    }
    if (state.page !== this._settings.page) {
        this._settings.page = state.page;
        changed = true;
    }
    if (state.orders.length !== this._getOrders().length) {
        this._orders = state.orders;
        changed = true;
    } else {
        currentOrders = this._getOrders();
        for (i = 0; i < state.orders.length; i++) {
            if (state.orders[i].property !== currentOrders[i].property ||
                state.orders[i].ascending !== currentOrders[i].ascending ||
                state.orders[i].descending !== currentOrders[i].descending) {
                this._orders = state.orders;
                changed = true;
                break;
            }
        }
    }

    if (changed) {
        this.parentReconstruct();
    }
};

/**
 * @param {Array} orders
 * @param {Boolean} showAll
 * @param {Boolean} showDuplicates
 * @param {Boolean} grouped
 * @param {Number} page
 * @returns {Object}
 */
Exhibit.OrderedViewFrame.prototype.makeState = function(
    orders,
    showAll,
    showDuplicates,
    grouped,
    page
) {
    orders = (typeof orders !== "undefined" && orders !== null) ?
        orders :
        this._getOrders();
    showAll = (typeof showAll !== "undefined" && showAll !== null) ?
        showAll :
        this._settings.showAll;
    showDuplicates = (typeof showDuplicates !== "undefined" &&
                      showDuplicates !== null) ?
        showDuplicates :
        this._settings.showDuplicates;
    grouped = (typeof grouped !== "undefined" && grouped !== null) ?
        grouped :
        this._settings.grouped;
    page = (typeof page !== "undefined" && page !== null) ?
        page :
        this._settings.page;
    
    return {
        "orders": orders,
        "showAll": showAll,
        "showDuplicates": showDuplicates,
        "grouped": grouped,
        "page": page
    };
};

/**
 * @param {Object} state
 * @returns {Boolean}
 */
Exhibit.OrderedViewFrame.prototype.stateDiffers = function(state) {
    var differs, currentOrders;
    differs = false;
    differs = (state.page !== this._settings.page ||
               state.grouped !== this._settings.grouped ||
               state.showAll !== this._settings.showAll ||
               state.showDuplicates !== this._settings.showDuplicates ||
               state.orders.length !== this._getOrders().length);
    if (!differs) {
        currentOrders = this._getOrders();
        for (i = 0; i < state.orders.length; i++) {
            if (state.orders[i].property !== currentOrders[i].property ||
                state.orders[i].ascending !== currentOrders[i].ascending ||
                state.orders[i].descending !== currentOrders[i].descending) {
                differs = true;
                break;
            }
        }
    }

    return differs;
};
