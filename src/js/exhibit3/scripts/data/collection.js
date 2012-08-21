/**
 * @fileOverview Represents subsets of a database.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * Creates a new object with an identifier and the database it draws from. 
 * 
 * @class
 * @constructor
 * @param {String} id Collection identifier.
 * @param {Exhibit.Database} database Database associated with the collection.
 */
Exhibit.Collection = function(id, database) {
    this._id = id;
    this._database = database;
    this._elmt = null;
    
    this._facets = [];
    this._updating = false;
    
    this._items = null;
    this._restrictedItems = null;
};

/**
 * Generator, includes all items in the database.
 *
 * @static
 * @param {String} id Collection identifier.
 * @param {Exhibit.Database} database Database associated with the collection.
 * @returns {Exhibit.Collection} Newly created collection.
 */
Exhibit.Collection.createAllItemsCollection = function(id, database) {
    var collection = new Exhibit.Collection(id, database);
    collection._update = Exhibit.Collection._allItemsCollection_update;
    
    Exhibit.Collection._initializeBasicCollection(collection, database);
    collection._setElement();
    
    return collection;
};

/**
 * Generator, includes all items of certain type given in the
 * configuration, or all items if not configured. 
 * 
 * @static
 * @param {String} id Collection identifier.
 * @param {Object} configuration A hash of configuration options.
 * @param {Exhibit.Database} database Database associated with the collection.
 * @returns {Exhibit.Collection} Newly created collection.
 */
Exhibit.Collection.create = function(id, configuration, database) {
    var collection = new Exhibit.Collection(id, database);
    collection._setElement();
   
    if (typeof configuration["itemTypes"] !== "undefined") {
        collection._itemTypes = configuration.itemTypes;
        collection._update = Exhibit.Collection._typeBasedCollection_update;
    } else {
        collection._update = Exhibit.Collection._allItemsCollection_update;
    }
    
    Exhibit.Collection._initializeBasicCollection(collection, database);
    
    return collection;
};
/**
 * Generator, like create, but reads configuration from the DOM.
 *
 * @static
 * @param {String} id Collection identifier.
 * @param {Element} elmt DOM element configuring the collection.
 * @param {Exhibit.Database} database Database associated with the collection.
 * @returns {Exhibit.Collection} Newly created collection.
 */
Exhibit.Collection.createFromDOM = function(id, elmt, database) {
    var collection, itemTypes;

    collection = new Exhibit.Collection(id, database);
    collection._setElement(elmt);

    itemTypes = Exhibit.getAttribute(elmt, "itemTypes", ",");
    if (typeof itemTypes !== "undefined" && itemTypes !== null && itemTypes.length > 0) {
        collection._itemTypes = itemTypes;
        collection._update = Exhibit.Collection._typeBasedCollection_update;
    } else {
        collection._update = Exhibit.Collection._allItemsCollection_update;
    }
    
    Exhibit.Collection._initializeBasicCollection(collection, database);
    
    return collection;
};

/**
 * Generator, like create, but locate the database from the UI context.
 *
 * @static
 * @param {String} id Collection identifier.
 * @param {Object} configuration Hash with configuration options.
 * @param {Exhibit.UIContext} uiContext UI context for the collection.
 * @returns {Exhibit.Collection} Newly created collection.
 */
Exhibit.Collection.create2 = function(id, configuration, uiContext) {
    var database, collection;

    database = uiContext.getDatabase();
    
    if (typeof configuration["expression"] !== "undefined") {
        collection = new Exhibit.Collection(id, database);
        collection._setElement();
        
        collection._expression = Exhibit.ExpressionParser.parse(configuration.expression);
        collection._baseCollection = (typeof configuration["baseCollectionID"] !== "undefined") ? 
            uiContext.getMain().getCollection(configuration.baseCollectionID) : 
            uiContext.getCollection();
            
        collection._restrictBaseCollection = (typeof configuration["restrictBaseCollection"] !== "undefined") ? 
            configuration.restrictBaseCollection : false;
            
        if (collection._restrictBaseCollection) {
            Exhibit.Collection._initializeRestrictingBasedCollection(collection);
        } else {
            Exhibit.Collection._initializeBasedCollection(collection);
        }
        
        return collection;
    } else {
        return Exhibit.Collection.create(id, configuration, database);
    }
};

/**
 * Generator, like createFromDOM, but locate the database from the UI context.
 *
 * @static
 * @param {String} id Collection identifier.
 * @param {Element} elmt DOM element configuring the collection.
 * @param {Exhibit.UIContext} uiContext UI context for the collection.
 * @returns {Exhibit.Collection} Newly created collection.
 */
Exhibit.Collection.createFromDOM2 = function(id, elmt, uiContext) {
    var database, collection, expressionString, baseCollectionID;

    database = uiContext.getDatabase();

    expressionString = Exhibit.getAttribute(elmt, "expression");
    if (typeof expressionString !== "undefined" && expressionString !== null && expressionString.length > 0) {
        collection = new Exhibit.Collection(id, database);
        collection._setElement(elmt);
    
        collection._expression = Exhibit.ExpressionParser.parse(expressionString);
        
        baseCollectionID = Exhibit.getAttribute(elmt, "baseCollectionID");
        collection._baseCollection = (typeof baseCollectionID !== "undefined" && baseCollectionID !== null && baseCollectionID.length > 0) ? 
            uiContext.getMain().getCollection(baseCollectionID) : 
            uiContext.getCollection();
            
        collection._restrictBaseCollection = Exhibit.getAttribute(elmt, "restrictBaseCollection") === "true";
        if (collection._restrictBaseCollection) {
            Exhibit.Collection._initializeRestrictingBasedCollection(collection, database);
        } else {
            Exhibit.Collection._initializeBasedCollection(collection);
        }
    } else {
        collection = Exhibit.Collection.createFromDOM(id, elmt, database);
    }
    return collection;
};

/**
 * Method called by most generators to fill the collection and add database
 * listeners for its benefit. 
 *
 * @static
 * @private
 * @param {Exhibit.Collection} collection Collection to initialize.
 * @param {Exhibit.Database} database Source of data.
 */
Exhibit.Collection._initializeBasicCollection = function(collection, database) {
    var update = function() { collection._update(); };

    $(document).bind('onAfterLoadingItems.exhibit', update);
    $(document).bind('onAfterRemovingAllStatements.exhibit', update);
        
    collection._update();
};

/**
 * Method called by a generator where a collection on which this collection
 * is based exists. 
 * 
 * @static
 * @private
 * @param {Exhibit.Collection} collection Collection to initialize.
 */
Exhibit.Collection._initializeBasedCollection = function(collection) {
    collection._update = Exhibit.Collection._basedCollection_update;
    
    $(this._elmt).bind('onItemsChanged.exhibit', function(evt) {
        collection._update();
    });
    
    collection._update();
};

/**
 * Used to initialize a collection based on another collection where
 * updates to this collection should affect the base collection (they do
 * not by default). 
 *
 * @static
 * @private
 * @param {Exhibit.Collection} collection Collection to initialize.
 * @param {Exhibit.Database} database Source of data.
 */
Exhibit.Collection._initializeRestrictingBasedCollection = function(collection, database) {
    collection._cache = new Exhibit.FacetUtilities.Cache(
        database,
        collection._baseCollection,
        collection._expression
    );
    collection._isUpdatingBaseCollection = false;
    
    collection.onFacetUpdated = Exhibit.Collection._restrictingBasedCollection_onFacetUpdated;
    collection.restrict = Exhibit.Collection._restrictingBasedCollection_restrict;
    collection.update = Exhibit.Collection._restrictingBasedCollection_update;
    collection.hasRestrictions = Exhibit.Collection._restrictingBasedCollection_hasRestrictions;
    
    collection._baseCollection.addFacet(collection);
};

/**
 * Assigned as a collection's update method when the collection is based
 * on all items in the database.  Not a static method.
 */
Exhibit.Collection._allItemsCollection_update = function() {
    this.setItems(this._database.getAllItems());
    this._onRootItemsChanged();
};

/**
 * Assigned as a collection's update method when the collection is based
 * on a set of item types.  Not a static method.
 */
Exhibit.Collection._typeBasedCollection_update = function() {
    var i, newItems = new Exhibit.Set();
    for (i = 0; i < this._itemTypes.length; i++) {
        this._database.getSubjects(this._itemTypes[i], "type", newItems);
    }
    
    this.setItems(newItems);
    this._onRootItemsChanged();
};

/**
 * Assigned as a collection's update method when the collection is based
 * on another collection.  Not a static method.
 */
Exhibit.Collection._basedCollection_update = function() {
    this.setItems(this._expression.evaluate(
        { "value" : this._baseCollection.getRestrictedItems() }, 
        { "value" : "item" }, 
        "value",
        this._database
    ).values);
    
    this._onRootItemsChanged();
};

/**
 * Substitutes for the common implementation of onFacetUpdated to deal with
 * the base collection.  Not a static method.
 */
Exhibit.Collection._restrictingBasedCollection_onFacetUpdated = function() {
    if (!this._updating) {
        /*
         *  This is called when one of our own facets is changed.
         */
        Exhibit.Collection.prototype.onFacetUpdated.call(this);
        
        /*
         *  We need to restrict the base collection.
         */
        this._isUpdatingBaseCollection = true;
        this._baseCollection.onFacetUpdated();
        this._isUpdatingBaseCollection = false;
    }
};

/**
 * Substitutes for the common restrict method to restrict the base
 * collection.  Not a static method.
 *
 * @param {Exhibit.Set} items Viable items.
 * @returns {Exhibit.Set} Possibly further constrained set of items.
 */
Exhibit.Collection._restrictingBasedCollection_restrict = function(items) {
    if (this._restrictedItems.size() === this._items.size()) {
        return items;
    }
    
    return this._cache.getItemsFromValues(this._restrictedItems, items);
};

/**
 * Assigned as the update method when a collection is based on another
 * collection and restricts it.  Not a static method.
 *
 * @param {Exhibit.Set} items Used to locate new items for the collection.
 */
Exhibit.Collection._restrictingBasedCollection_update = function(items) {
    if (!this._isUpdatingBaseCollection) {
        this.setItems(this._cache.getValuesFromItems(items));
        this._onRootItemsChanged();
    }
};

/**
 * Adds a hasRestrictions method to the collection, like a Exhibit.Facet has.
 * Not a static method.
 *
 * @returns {Boolean} True if this collection has restrictions.
 */
Exhibit.Collection._restrictingBasedCollection_hasRestrictions = function() {
    return (this._items !== null) && (this._restrictedItems !== null) && 
        (this._restrictedItems.size() !== this._items.size());
};

/**
 * Getter for the collection identifier.
 *
 * @returns {String} Collection identifier.
 */
Exhibit.Collection.prototype.getID = function() {
    return this._id;
};

/**
 * Create an element to associate with the collection if none
 * exists.
 *
 * @param {Element} el
 */
Exhibit.Collection.prototype._setElement = function(el) {
    if (typeof el === "undefined" || el === null) {
        if (this.getID() !== "default") {
            this._elmt = $("<div>")
                .attr("id", this.getID())
                .attr(Exhibit.makeExhibitAttribute("role"), "exhibit-collection")
                .css("display", "none")
                .appendTo(document.body)
                .get(0);
        } else {
            this._elmt = document;
        }
    } else {
        this._elmt = el;
    }
};

/**
 * Returns the element, commonly used to bind against, associated with
 * the collection.
 * 
 * @returns {Element}
 */
Exhibit.Collection.prototype.getElement = function() {
    return this._elmt;
};

/**
 * Explicitly set which items are in this collection.
 *
 * @param {Exhibit.Set} items The collection's items.
 */ 
Exhibit.Collection.prototype.setItems = function(items) {
    this._items = items;
};

/**
 * Compare collections for equality.
 *
 * @param {Exhibit.Collection} collection
 * @returns {Boolean} True if collection is equal to this one.
 */
Exhibit.Collection.prototype.equals = function(collection) {
    return (this.getID() === collection.getID());
};

/**
 * Handle removing the collection from the local context.
 */
Exhibit.Collection.prototype.dispose = function() {
    if (typeof this["_baseCollection"] !== "undefined") {
        this._baseCollection = null;
        this._expression = null;
    }

    this._database = null;
    this._elmt = null;
    this._items = null;
    this._restrictedItems = null;
};

/**
 * Register a facet with a collection.
 * 
 * @param {Exhibit.Facet} facet The new facet.
 */
Exhibit.Collection.prototype.addFacet = function(facet) {
    this._facets.push(facet);
    
    if (facet.hasRestrictions()) {
        this._computeRestrictedItems();
        this._updateFacets();
        $(this._elmt).trigger("onItemsChanged.exhibit");
    } else {
        facet.update(this.getRestrictedItems());
    }
};

/**
 * Remove a previously registered facet from the collection. Generally
 * called by the facet itself when it is disposed. 
 *
 * @param {Exhibit.Facet} facet The facet to be removed.
 */
Exhibit.Collection.prototype.removeFacet = function(facet) {
    var i;
    for (i = 0; i < this._facets.length; i++) {
        if (facet === this._facets[i]) {
            this._facets.splice(i, 1);
            if (facet.hasRestrictions()) {
                this._computeRestrictedItems();
                this._updateFacets();
                $(this._elmt).trigger("onItemsChanged.exhibit");
            }
            break;
        }
    }
};

/**
 * Signal all registered facets to clear any currently set restrictions.
 * 
 * @returns {Array} A list of objects returned by clearing restrictions.
 */
Exhibit.Collection.prototype.clearAllRestrictions = function() {
    var i, state;
    state = Exhibit.History.getState();
    
    this._updating = true;
    for (i = 0; i < this._facets.length; i++) {
        Exhibit.History.setComponentState(
            state,
            this._facets[i],
            Exhibit.Facet._registryKey,
            this._facets[i].exportEmptyState(),
            true
        );
    }
    this._updating = false;
    
    this.onFacetUpdated();

    return state;
};

/**
 * Given an array of restrictions, signal each registered facets to
 * implement any applicable restriction.
 *
 * @param {Array} restrictions List of objects used for applying restrictions.
 */
Exhibit.Collection.prototype.applyRestrictions = function(restrictions) {
    var i;
    this._updating = true;
    for (i = 0; i < this._facets.length; i++) {
        this._facets[i].applyRestrictions(restrictions[i]);
    }
    this._updating = false;
    
    this.onFacetUpdated();
};

/**
 * Return all items in the collection regardless of restrictions.
 *
 * @returns {Exhibit.Set} All collection items.
 */
Exhibit.Collection.prototype.getAllItems = function() {
    return new Exhibit.Set(this._items);
};

/**
 * Return the count of all items in the collection regardless of restrictions. 
 *
 * @returns {Number} The count of all collection items.
 */
Exhibit.Collection.prototype.countAllItems = function() {
    return this._items.size();
};

/**
 * Return only the items that match current restrictions.
 *
 * @returns {Exhibit.Set} Restricted items.
 */
Exhibit.Collection.prototype.getRestrictedItems = function() {
    return new Exhibit.Set(this._restrictedItems);
};


/**
 * Return the count of only the items that match current restrictions. 
 *
 * @returns {Number} The count of restricted items.
 */
Exhibit.Collection.prototype.countRestrictedItems = function() {
    return this._restrictedItems.size();
};

/**
 * Modifies the set of items matching the restriction based on changes
 * to a facet, sending the signal onItemsChanged when finished.
 */
Exhibit.Collection.prototype.onFacetUpdated = function() {
    if (!this._updating) {
        this._computeRestrictedItems();
        this._updateFacets();
        $(this._elmt).trigger("onItemsChanged.exhibit");
    }
};

/**
 * Called when the base set of items the collection includes have changed,
 * called by the update methods. Fires onRootItemsChanged and onItemsChanged
 * during execution.
 *
 * @private
 */
Exhibit.Collection.prototype._onRootItemsChanged = function() {
    $(this._elmt).trigger("onRootItemsChanged.exhibit");
    
    this._computeRestrictedItems();
    this._updateFacets();
    
    $(this._elmt).trigger("onItemsChanged.exhibit");
};

/**
 * Signals registered facets to make updates based on one facet's
 * restrictions changing, called by onFacetUpdated.
 *
 * @private
 */ 
Exhibit.Collection.prototype._updateFacets = function() {
    var restrictedFacetCount, i, facet, items, j;
    restrictedFacetCount = 0;
    for (i = 0; i < this._facets.length; i++) {
        if (this._facets[i].hasRestrictions()) {
            restrictedFacetCount++;
        }
    }
    
    for (i = 0; i < this._facets.length; i++) {
        facet = this._facets[i];
        if (facet.hasRestrictions()) {
            if (restrictedFacetCount <= 1) {
                facet.update(this.getAllItems());
            } else {
                items = this.getAllItems();
                for (j = 0; j < this._facets.length; j++) {
                    if (i !== j) {
                        items = this._facets[j].restrict(items);
                    }
                }
                facet.update(items);
            }
        } else {
            facet.update(this.getRestrictedItems());
        }
    }
};

/**
 * Calculates the new set of items based on restrictions, caching the
 * result for later use.
 * 
 * @private
 */
Exhibit.Collection.prototype._computeRestrictedItems = function() {
    var i, facet;
    this._restrictedItems = this._items;
    for (i = 0; i < this._facets.length; i++) {
        facet = this._facets[i];
        if (facet.hasRestrictions()) {
            this._restrictedItems = facet.restrict(this._restrictedItems);
        }
    }
};
