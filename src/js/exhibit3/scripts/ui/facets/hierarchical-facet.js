/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @author Brice Sommercal
 */

/**
 * @class
 * @constructor
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.HierarchicalFacet = function(containerElmt, uiContext) {
    var self = this;
    $.extend(this, new Exhibit.Facet("hierarchical", containerElmt, uiContext));
    this.addSettingSpecs(Exhibit.HierarchicalFacet._settingSpecs);

    this._colorCoder = null;
    this._uniformGroupingExpression = null;
    this._selections = [];
    this._expanded = {};
    this._dom = null;
    
    this._onRootItemsChanged = function() {
        if (typeof self._cache !== "undefined") {
            delete self._cache;
        }
    };
    $(uiContext.getCollection().getElement()).bind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
};

/**
 * @private
 * @constant
 */
Exhibit.HierarchicalFacet._settingSpecs = {
    "fixedOrder":       { "type": "text" },
    "sortMode":         { "type": "text", "defaultValue": "value" },
    "sortDirection":    { "type": "text", "defaultValue": "forward" },
    "othersLabel":      { "type": "text" },
    "scroll":           { "type": "boolean", "defaultValue": true },
    "height":           { "type": "text" },
    "colorCoder":       { "type": "text", "defaultValue": null },
    "collapsible":      { "type": "boolean", "defaultValue": false },
    "collapsed":        { "type": "boolean", "defaultValue": false }
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.HierarchicalFacet}
 */
Exhibit.HierarchicalFacet.create = function(configuration, containerElmt, uiContext) {
    var uiContext, facet;
    uiContext = Exhibit.UIContext.create(configuration, uiContext);
    facet = new Exhibit.HierarchicalFacet(containerElmt, uiContext);
    
    Exhibit.HierarchicalFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    facet.register();
    
    return facet;
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.HierarchicalFacet}
 */
Exhibit.HierarchicalFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, uiContext, facet, expressionString, uniformGroupingString, selection, i, s;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    uiContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    facet = new Exhibit.HierarchicalFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ? containerElmt : configElmt,
        uiContext
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, facet.getSettingSpecs(), facet._settings);
    
    try {
        expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString !== null && expressionString.length > 0) {
            facet.setExpressionString(expressionString);
            facet.setExpression(Exhibit.ExpressionParser.parse(expressionString));
        }
        
        uniformGroupingString = Exhibit.getAttribute(configElmt, "uniformGrouping");
        if (uniformGroupingString !== null && uniformGroupingString.length > 0) {
            facet._uniformGroupingExpression = Exhibit.ExpressionParser.parse(uniformGroupingString);
        }
        
        selection = Exhibit.getAttribute(configElmt, "selection", ";");
        if (selection !== null && selection.length > 0) {
            for (i = 0; i < selection.length; i++) {
                s = selection[i];
                facet._selections = facet._internalAddSelection({ "value": s, "selectOthers": false });
            }
        }
    } catch (e) {
        Exhibit.Debug.exception(e, Exhibit._("%facets.error.configuration", "HierarchicalFacet"));
    }
    Exhibit.HierarchicalFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    facet.register();
    
    return facet;
};

/**
 * @static
 * @private
 * @param {Exhibit.HierarchicalFacet} facet
 * @param {Object} configuration
 */
Exhibit.HierarchicalFacet._configure = function(facet, configuration) {
    var selection, i, segment, property, values, orderMap;

    Exhibit.SettingsUtilities.collectSettings(configuration, facet.getSettingSpecs(), facet._settings);
    
    if (typeof configuration.expression !== "undefined") {
        facet.setExpressionString(configuration.expression);
        facet.setExpression(Exhibit.ExpressionParser.parse(configuration.expression));
    }

    if (typeof configuration.uniformGrouping !== "undefined") {
        facet._uniformGroupingExpression = Exhibit.ExpressionParser.parse(configuration.uniformGrouping);
    }

    if (typeof configuration.selection !== "undefined") {
        selection = configuration.selection;
        for (i = 0; i < selection.length; i++) {
            facet._selections.push({ "value": selection[i], "selectOthers": false });
        }
    }
    
    if (typeof facet._settings.facetLabel === "undefined") {
        if (facet.getExpression() !== null && facet.getExpression().isPath()) {
            segment = facet.getExpression().getPath().getLastSegment();
            property = facet.getUIContext().getDatabase().getProperty(segment.property);
            if (property !== null) {
                facet._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
            }
        }
    }

    if (typeof facet._settings.fixedOrder !== "undefined") {
        values = facet._settings.fixedOrder.split(";");
        orderMap = {};
        for (i = 0; i < values.length; i++) {
            orderMap[values[i].trim()] = i;
        }
        
        facet._orderMap = orderMap;
    }
    
    if (typeof facet._settings.colorCoder !== "undefined") {
        facet._colorCoder = facet.getUIContext().getMain().getComponent(facet._settings.colorCoder);
    }
    
    if (facet._settings.collapsed) {
        facet._settings.collapsible = true;
    }
};

/**
 *
 */
Exhibit.HierarchicalFacet.prototype.dispose = function() {
    this.getUIContext().getCollection().removeFacet(this);
    $(this.getUIContext().getCollection().getElement()).unbind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );

    this._dom = null;
    this._orderMap = null;
    this._colorCoder = null;
    this._uniformGroupingExpression = null;
    this._selections = null;
    this._cache = null;
    this._expanded = null;
    this._dispose();
};

/**
 * @returns {Boolean}
 */
Exhibit.HierarchicalFacet.prototype.hasRestrictions = function() {
    return this._selections.length > 0;
};

/**
 *
 */
Exhibit.HierarchicalFacet.prototype.clearAllRestrictions = function() {
    $(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
    if (this._selections.length > 0) {
        this._selections = [];
        this._notifyCollection();
    }
};

/**
 * @param {Array} restrictions
 */
Exhibit.HierarchicalFacet.prototype.applyRestrictions = function(restrictions) {
    this._selections = [].concat(restrictions);
    this._notifyCollection();
};

/**
 * @param {String} value
 * @param {Boolean} selected
 * @returns
 */
Exhibit.HierarchicalFacet.prototype.setSelection = function(value, selected) {
    var selection, selections;
    selection = { "value": value, "selectOthers": false };
    if (selected) {
        selections = this._internalAddSelection(selection);
    } else {
        selections = this._internalRemoveSelection(selection);
    }
    return selections;
};

/**
 * @param {String} value
 * @param {Boolean} selected
 * @returns {Array}
 */
Exhibit.HierarchicalFacet.prototype.setSelectOthers = function(value, selected) {
    var selection, selections;
    selection = { "value": value, "selectOthers": true };
    if (selected) {
        selections = this._internalAddSelection(selection);
    } else {
        selections = this._internalRemoveSelection(selection);
    }
    return selections;
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.HierarchicalFacet.prototype.restrict = function(items) {
    if (this._selections.length == 0) {
        return items;
    }

    var set, includeNode, includeChildNodes, i, selection, node;
    
    this._buildCache();
    
    set = new Exhibit.Set();
    includeNode = function(node) {
        if (typeof node.children !== "undefined") {
            includeChildNodes(node.children);
            Exhibit.Set.createIntersection(node.others, items, set);
        } else {
            Exhibit.Set.createIntersection(node.items, items, set);
        }
    };
    includeChildNodes = function(childNodes) {
        var i;
        for (i = 0; i < childNodes.length; i++) {
            includeNode(childNodes[i]);
        }
    };
    
    for (i = 0; i < this._selections.length; i++) {
        selection = this._selections[i];
        node = this._getTreeNode(selection.value);
        if (typeof node !== "undefined" && node !== null) {
            if (selection.selectOthers) {
                Exhibit.Set.createIntersection(node.others, items, set);
            } else {
                includeNode(node);
            }
        }
    }
    
    return set;
};

/**
 * @param {Object} selection
 * @param {String} selection.value
 * @param {Boolean} selection.selectOthers
 * @returns {Array}
 */
Exhibit.HierarchicalFacet.prototype._internalAddSelection = function(selection) {
    var parentToClear, childrenToClear, cache, markClearAncestors, markClearDescendants, oldSelections, newSelections, i, s;
    parentToClear = {};
    childrenToClear = {};
    
    this._buildCache();
    cache = this._cache;
    markClearAncestors = function(value) {
        var parents, i, parent;
        if (typeof cache.valueToParent[value] !== "undefined") {
            parents = cache.valueToParent[value];
            for (i = 0; i < parents.length; i++) {
                parent = parents[i];
                parentToClear[parent] = true;
                markClearAncestors(parent);
            }
        }
    };
    markClearDescendants = function(value) {
        var children, i, child;
        if (typeof cache.valueToChildren[value] !== "undefined") {
            children = cache.valueToChildren[value];
            for (i = 0; i < children.length; i++) {
                child = children[i];
                childrenToClear[child] = true;
                markClearDescendants(child);
            }
        }
    };
    
    /*
        ignore "(others)" at the root (its value is null) 
        because it has no parent nor children.
     */
    if (selection.value !== null) { 
        markClearAncestors(selection.value);
        if (selection.selectOthers) {
            parentToClear[selection.value] = true;
        } else {
            childrenToClear[selection.value] = true;
            markClearDescendants(selection.value);
        }
    }
    
    oldSelections = this._selections;
    newSelections = [ selection ];
    for (i = 0; i < oldSelections.length; i++) {
        s = oldSelections[i];
        if ((!(s.value in parentToClear) || s.selectOthers) && 
            (!(s.value in childrenToClear))) {
            newSelections.push(s);
        }
    }
    
    return newSelections;
};

/**
 * @param {Object} selection
 * @param {String} selection.value
 * @param {Boolean} selection.selectOthers
 * @returns {Array}
 */
Exhibit.HierarchicalFacet.prototype._internalRemoveSelection = function(selection) {
    var oldSelections, newSelections, i, s;
    oldSelections = this._selections;
    newSelections = [];
    for (i = 0; i < oldSelections.length; i++) {
        s = oldSelections[i];
        if (s.value != selection.value || s.selectOthers != selection.selectOthers) {
            newSelections.push(s);
        }
    }
    
    return newSelections;
};

/**
 * @param {Exhibit.Set} items
 */
Exhibit.HierarchicalFacet.prototype.update = function(items) {
    var tree;

    $(this._dom.valuesContainer).hide().empty();

    tree = this._computeFacet(items);
    if (typeof tree !== "undefined" && tree !== null) {
        this._constructBody(tree);
    }
    $(this._dom.valuesContainer).show();
};

/**
 * @param {Exhibit.Set} items
 * @returns {Object}
 */
Exhibit.HierarchicalFacet.prototype._computeFacet = function(items) {
    var database, sorter, othersLabel, selectionMap, i, s, processNode, nodes;

    this._buildCache();
    
    database = this.getUIContext().getDatabase();
    sorter = this._getValueSorter();
    othersLabel = typeof this._settings.othersLabel !== "undefined" ? this._settings.othersLabel : Exhibit._("%facets.hierarchical.othersLabel");
    
    selectionMap = {};
    for (i = 0; i < this._selections.length; i++) {
        s = this._selections[i];
        selectionMap[s.value] = s.selectOthers;
    }
    
    processNode = function(node, resultNodes, superset) {
        var selected, resultNode, superset2, i, childNode, othersSelected, subset;
        selected = (node.value in selectionMap && !selectionMap[node.value]);
        if (typeof node.children !== "undefined") {
            resultNode = {
                "value":      node.value,
                "label":      node.label,
                "children":   [],
                "selected":   selected,
                "areOthers":  false
            };
            
            superset2 = new Exhibit.Set();
            
            for (i = 0; i < node.children.length; i++) {
                childNode = node.children[i];
                processNode(childNode, resultNode.children, superset2);
            }
            resultNode.children.sort(sorter);
            
            if (node.others.size() > 0) {
                othersSelected = (node.value in selectionMap && selectionMap[node.value]);
                subset = Exhibit.Set.createIntersection(items, node.others);
                if (subset.size() > 0 || othersSelected) {
                    resultNode.children.push({
                        "value":      node.value,
                        "label":      othersLabel,
                        "count":      subset.size(),
                        "selected":   othersSelected,
                        "areOthers":  true
                    });
                    superset2.addSet(subset);
                }
            }
            
            resultNode.count = superset2.size();
            if (selected || resultNode.count > 0 || resultNode.children.length > 0) {
                resultNodes.push(resultNode);
                
                if (superset != null && superset2.size() > 0) {
                    superset.addSet(superset2);
                }
            }
        } else {
            subset = Exhibit.Set.createIntersection(items, node.items);
            if (subset.size() > 0 || selected) {
                resultNodes.push({
                    "value":      node.value,
                    "label":      node.label,
                    "count":      subset.size(),
                    "selected":   selected,
                    "areOthers":  false
                });
                
                if (superset != null && subset.size() > 0) {
                    superset.addSet(subset);
                }
            }
        }
    };
    
    nodes = [];
    processNode(this._cache.tree, nodes, null);
    
    return nodes[0];
};

/**
 * @returns {Function}
 */
Exhibit.HierarchicalFacet.prototype._getValueSorter = function() {
    var sortValueFunction, orderMap, sortFunction, sortDirectionFunction;
    sortValueFunction = function(a, b) {
        return a.label.localeCompare(b.label);
    };
    
    if (typeof this._orderMap !== "undefined") {
        orderMap = this._orderMap;
        
        sortValueFunction = function(a, b) {
            if (typeof orderMap[a.label] !== "undefined") {
                if (typeof orderMap[b.label] !== "undefined") {
                    return orderMap[a.label] - orderMap[b.label];
                } else {
                    return -1;
                }
            } else if (typeof orderMap[b.label] !== "undefined") {
                return 1;
            } else {
                return a.label.localeCompare(b.label);
            }
        };
    } else if (this._cache.valueType === "number") {
        sortValueFunction = function(a, b) {
            a = parseFloat(a.value);
            b = parseFloat(b.value);
            return a < b ? -1 : a > b ? 1 : 0;
        };
    }
    
    sortFunction = sortValueFunction;
    if (this._settings.sortMode === "count") {
        sortFunction = function(a, b) {
            var c = b.count - a.count;
            return c != 0 ? c : sortValueFunction(a, b);
        };
    }

    sortDirectionFunction = sortFunction;
    if (this._settings.sortDirection === "reverse"){
        sortDirectionFunction = function(a, b) {
            return sortFunction(b, a);
        };
    }

    return sortDirectionFunction;
};

/**
 *
 */
Exhibit.HierarchicalFacet.prototype._notifyCollection = function() {
    this.getUIContext().getCollection().onFacetUpdated(this);
};

/**
 *
 */
Exhibit.HierarchicalFacet.prototype._initializeUI = function() {
    var self = this;
    this._dom = Exhibit.FacetUtilities[this._settings.scroll ? "constructFacetFrame" : "constructFlowingFacetFrame"](
		this,
        this.getContainer(),
        this.getLabel(),
        function(elmt, evt, target) { self._clearSelections(); },
        this.getUIContext(),
        this._settings.collapsible,
        this._settings.collapsed
    );
    
    if (typeof this._settings.height !== "undefined" && this._settings.height !== null && this._settings.scroll) {
        $(this._dom.valuesContainer).css("height", this._settings.height);
    }
};

/**
 * @param {Object} tree
 */
Exhibit.HierarchicalFacet.prototype._constructBody = function(tree) {
    var self, containerDiv, constructFacetItemFunction, facetHasSelection, processNode, processChildNodes;
    self = this;
    containerDiv = this._dom.valuesContainer;
    
    $(containerDiv).hide();
    
    constructFacetItemFunction = Exhibit.FacetUtilities[this._settings.scroll ? "constructHierarchicalFacetItem" : "constructFlowingHierarchicalFacetItem"];
    facetHasSelection = this._selections.length > 0;
    
    processNode = function(node, div) {
        var hasChildren, onSelect, onSelectOnly, onToggleChildren, dom;
        hasChildren = typeof node.children !== "undefined";
        onSelect = function(evt) {
            if (hasChildren) {
                if (node.selected) {
                    if (typeof self._expanded[node.value] !== "undefined") {
                        delete self._expanded[node.value];
                        dom.showChildren(false);
                    }
                } else if (typeof self._expanded[node.value] === "undefined") {
                    self._expanded[node.value] = true;
                    dom.showChildren(true);
                }
            }
            self._filter(node.value, node.areOthers, node.label, node.selected, false);
            evt.preventDefault();
            evt.stopPropagation();
        };
        onSelectOnly = function(evt) {
            if (hasChildren) {
                if (node.selected) {
                    if (typeof self._expanded[node.value] !== "undefined") {
                        delete self._expanded[node.value];
                        dom.showChildren(false);
                    }
                } else if (typeof self._expanded[node.value] === "undefined") {
                    self._expanded[node.value] = true;
                    dom.showChildren(true);
                }
            }
            self._filter(node.value, node.areOthers, node.label, node.selected, !(evt.ctrlKey || evt.metaKey));
            evt.preventDefault();
            evt.stopPropagation();
        };
        onToggleChildren = function(evt) {
            var show;
            if (typeof self._expanded[node.value] !== "undefined") {
                delete self._expanded[node.value];
                show = false;
            } else {
                self._expanded[node.value] = true;
                show = true;
            }
            dom.showChildren(show);
            evt.preventDefault();
            evt.stopPropagation();
        };
        dom = constructFacetItemFunction(
            node.label,
            node.count,
            (self._colorCoder != null) ? self._colorCoder.translate(node.value) : null,
            node.selected,
            hasChildren,
            typeof self._expanded[node.value] !== "undefined",
            facetHasSelection,
            onSelect,
            onSelectOnly,
            onToggleChildren,
            self.getUIContext()
        );
        $(div).append(dom.elmt);
        
        if (hasChildren) {
            processChildNodes(node.children, dom.childrenContainer);
        }
    };
    processChildNodes = function(childNodes, div) {
        var i;
        for (i = 0; i < childNodes.length; i++) {
            processNode(childNodes[i], div);
        }
    };
    
    processChildNodes(tree.children, containerDiv);
    
    $(containerDiv).show();
    
    this._dom.setSelectionCount(this._selections.length);
};

/**
 * @param {String} value
 * @param {Boolean} areOthers
 * @param {String} label
 * @param {Boolean} wasSelected
 * @param {Boolean} selectOnly
 */
Exhibit.HierarchicalFacet.prototype._filter = function(value, areOthers, label, wasSelected, selectOnly) {
    var self, wasSelectedAlone, selection, newRestrictions;
    self = this;
    wasSelectedAlone = wasSelected && this._selections.length == 1;
    
    selection = {
        "value":         value,
        "selectOthers":  areOthers
    };
    
    if (wasSelected) {
        if (selectOnly) {
            if (wasSelectedAlone) {
                // deselect
                newRestrictions = [];
            } else {
                // clear all other selections
                newRestrictions = [ selection ];
            }
        } else {
            // toggle
            newRestrictions = this._internalRemoveSelection(selection);
        }
    } else {
        if (selectOnly) {
            newRestrictions = [ selection ];
        } else {
            newRestrictions = this._internalAddSelection(selection);
        }
    }
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        { "selections": newRestrictions },
        (selectOnly && !wasSelectedAlone) ?
            Exhibit._("%facets.facetSelectOnlyActionTitle", label, this.getLabel()) :
            Exhibit._(wasSelected ? "%facets.facetUnselectActionTitle" : "%facets.facetSelectActionTitle", label, this.getLabel()),
        true
    );
};

/**
 * @private
 */
Exhibit.HierarchicalFacet.prototype._clearSelections = function() {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        this.exportEmptyState(),
        Exhibit._("%facets.facetClearSelectionsActionTitle", this.getLabel()),
        true
    );
};

/**
 * @private
 */
Exhibit.HierarchicalFacet.prototype._buildCache = function() {
    var valueToItem, valueType, valueToChildren, valueToParent, valueToPath, values, insert, database, tree, expression, groupingExpression, rootValues, getParentChildRelationships, processValue, index;
    if (typeof this._cache === "undefined") {
        valueToItem = {};
        valueType = "text";
        
        valueToChildren = {};
        valueToParent = {};
        valueToPath = {};
        values = new Exhibit.Set();
        
        insert = function(x, y, map) {
            if (typeof map[x] !== "undefined") {
                map[x].push(y);
            } else {
                map[x] = [ y ];
            }
        };
        
        database = this.getUIContext().getDatabase();
        tree = {
            "value":      null,
            "label":      Exhibit._("%facets.hierarchical.rootLabel"),
            "others":     new Exhibit.Set(),
            "children":   []
        };
        
        expression = this.getExpression();
        this.getUIContext().getCollection().getAllItems().visit(function(item) {
            var results;
            results = expression.evaluateOnItem(item, database);
            if (results.values.size() > 0) {
                valueType = results.valueType;
                results.values.visit(function(value) {
                    values.add(value);
                    insert(value, item, valueToItem);
                });
            } else {
                tree.others.add(item);
            }
        });
        
        groupingExpression = this._uniformGroupingExpression;
        rootValues = new Exhibit.Set();
        getParentChildRelationships = function(valueSet) {
            var newValueSet;
            newValueSet = new Exhibit.Set();
            valueSet.visit(function(value) {
                var results;
                results = groupingExpression.evaluateOnItem(value, database);
                if (results.values.size() > 0) {
                    results.values.visit(function(parentValue) {
                        insert(value, parentValue, valueToParent);
                        insert(parentValue, value, valueToChildren);
                        if (!valueSet.contains(parentValue)) {
                            newValueSet.add(parentValue);
                        }
                        return true;
                    });
                } else {
                    rootValues.add(value);
                }
            });
            
            if (newValueSet.size() > 0) {
                getParentChildRelationships(newValueSet);
            }
        };
        getParentChildRelationships(values);
        
        processValue = function(value, nodes, valueSet, path) {
            var label, node, valueSet2, childrenValue, i, items, item;
            label = database.getObject(value, "label");
            node = {
                "value":  value,
                "label":  label != null ? label : value
            };
            nodes.push(node);
            valueToPath[value] = path;
            
            if (typeof valueToChildren[value] !== "undefined") {
                node.children = [];
                
                valueSet2 = new Exhibit.Set();
                childrenValue = valueToChildren[value];
                for (i = 0; i < childrenValue.length; i++) {
                    processValue(childrenValue[i], node.children, valueSet2, path.concat(i));
                };
                
                node.others = new Exhibit.Set();
                if (typeof valueToItem[value] !== "undefined") {
                    items = valueToItem[value];
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        if (!valueSet2.contains(item)) {
                            node.others.add(item);
                            valueSet.add(item);
                        }
                    }
                }
                
                valueSet.addSet(valueSet2);
            } else {
                node.items = new Exhibit.Set();
                if (value in valueToItem) {
                    items = valueToItem[value];
                    for (i = 0; i < items.length; i++) {
                        item = items[i];
                        node.items.add(item);
                        valueSet.add(item);
                    }
                }
            }
        };
        
        index = 0;
        rootValues.visit(function (value) {
            processValue(value, tree.children, new Exhibit.Set(), [index++]);
        });
        
        this._cache = {
            "tree":               tree,
            "valueToChildren":    valueToChildren,
            "valueToParent":      valueToParent,
            "valueToPath":        valueToPath,
            "valueType":          valueType
        };
    }
};

/**
 * @param {String} value
 * @returns {Object}
 */
Exhibit.HierarchicalFacet.prototype._getTreeNode = function(value) {
    var path, trace;
    if (value === null) {
        return this._cache.tree;
    }
    
    path = this._cache.valueToPath[value];
    trace = function(node, path, index) {
        var node2;
        node2 = node.children[path[index]];
        if (++index < path.length) {
            return trace(node2, path, index);
        } else {
            return node2;
        }
    };
    return (path) ? trace(this._cache.tree, path, 0) : null;
};

/**
 *
 */
Exhibit.HierarchicalFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

/**
 *
 */
Exhibit.HierarchicalFacet.prototype.exportState = function() {
    return this._exportState(false);
};

/**
 * @param {Boolean} empty
 * @returns {Object}
 */
Exhibit.HierarchicalFacet.prototype._exportState = function(empty) {
    var s = [];

    if (!empty) {
        s = this._selections;
    }

    return {
        "selections": s
    };
};

/**
 * @param {Object} state
 * @param {Array} state.selections
 */
Exhibit.HierarchicalFacet.prototype.importState = function(state) {
    if (this.stateDiffers(state)) {
        if (state.selections.length === 0) {
            this.clearAllRestrictions();
        } else {
            this.applyRestrictions(state.selections);
        }
    }
};

/**
 * @param {Object} state
 * @param {Array} state.selections
 */
Exhibit.HierarchicalFacet.prototype.stateDiffers = function(state) {
    var selectionStartCount, stateStartCount, stateSet;

    stateStartCount = state.selections.length;
    selectionStartCount = this._selections.length;

    if (stateStartCount !== selectionStartCount) {
        return true;
    } else {
        stateSet = new Exhibit.Set(state.selections);
        stateSet.addSet(this._selections);
        if (stateSet.size() !== stateStartCount) {
            return true;
        }
    }

    return false;
};
