/**
 * Local in-memory implementation of the Exhibit Database.  Other
 * implementations should fully implement the interface described by
 * this class.
 *
 * @public
 * @constructor
 * @class
 */
Exhibit.Database._LocalImpl = function() {
    this._types = {};
    this._properties = {};
    this._propertyArray = {};
    
    this._spo = {};
    this._ops = {};
    this._items = new Exhibit.Set();
    
    /*
     *  Predefined types and properties
     */
    var itemType, labelProperty, typeProperty, uriProperty;
     
    itemType = new Exhibit.Database.Type("Item");
    itemType._custom = {
        "label":       Exhibit._("%database.itemType.label"),
        "pluralLabel": Exhibit._("%database.itemType.pluralLabel"),
        "uri":         Exhibit.namespace + "Item"
    };
    this._types.Item = itemType;

    labelProperty = new Exhibit.Database.Property("label", this);
    labelProperty._uri = "http://www.w3.org/2000/01/rdf-schema#label";
    labelProperty._valueType            = "text";
    labelProperty._label                = Exhibit._("%database.labelProperty.label");
    labelProperty._pluralLabel          = Exhibit._("%database.labelProperty.pluralLabel");
    labelProperty._reverseLabel         = Exhibit._("%database.labelProperty.reverseLabel");
    labelProperty._reversePluralLabel   = Exhibit._("%database.labelProperty.reversePluralLabel");
    labelProperty._groupingLabel        = Exhibit._("%database.labelProperty.groupingLabel");
    labelProperty._reverseGroupingLabel = Exhibit._("%database.labelProperty.reverseGroupingLabel");
    this._properties.label              = labelProperty;
    
    typeProperty = new Exhibit.Database.Property("type", this);
    typeProperty._uri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    typeProperty._valueType             = "text";
    typeProperty._label                 = Exhibit._("%database.typeProperty.label");
    typeProperty._pluralLabel           = Exhibit._("%database.typeProperty.pluralLabel");
    typeProperty._reverseLabel          = Exhibit._("%database.typeProperty.reverseLabel");
    typeProperty._reversePluralLabel    = Exhibit._("%database.typeProperty.reversePluralLabel");
    typeProperty._groupingLabel         = Exhibit._("%database.typeProperty.groupingLabel");
    typeProperty._reverseGroupingLabel  = Exhibit._("%database.typeProperty.reverseGroupingLabel");
    this._properties.type               = typeProperty;
    
    uriProperty = new Exhibit.Database.Property("uri", this);
    uriProperty._uri = "http://simile.mit.edu/2006/11/exhibit#uri";
    uriProperty._valueType              = "url";
    uriProperty._label                  = Exhibit._("%database.uriProperty.label");
    uriProperty._pluralLabel            = Exhibit._("%database.uriProperty.pluralLabel");
    uriProperty._reverseLabel           = Exhibit._("%database.uriProperty.reverseLabel");
    uriProperty._reversePluralLabel     = Exhibit._("%database.uriProperty.reversePluralLabel");
    uriProperty._groupingLabel          = Exhibit._("%database.uriProperty.groupingLabel");
    uriProperty._reverseGroupingLabel   = Exhibit._("%database.uriProperty.reverseGroupingLabel");
    this._properties.uri                = uriProperty;
};

/**
 * Creates a new database.
 *
 * @returns {Exhibit.Database} The new database.
 */
Exhibit.Database._LocalImpl.prototype.createDatabase = function() {
    return Exhibit.Database.create();
};

/**
 * Load an array of data links using registered importers into the database.
 *
 * @param {Function} fDone A function to call when finished.
 */
Exhibit.Database._LocalImpl.prototype.loadLinks = function(fDone) {
    var links = $("head > link[rel='exhibit-data']")
        .add("head > link[rel='exhibit/data']");
    this._loadLinks(links.toArray(), this, fDone);
};

/**
 * Load data from the given object into the database.
 *
 * @param {Object} o An object that reflects the Exhibit JSON form.
 * @param {String} baseURI The base URI for normalizing URIs in the object.
 */
Exhibit.Database._LocalImpl.prototype.loadData = function(o, baseURI) {
    if (typeof o === "undefined" || o === null) {
        throw Error(Exhibit._("%database.error.unloadable"));
    }
    if (typeof baseURI === "undefined") {
        baseURI = location.href;
    }
    if (typeof o.types !== "undefined") {
        this.loadTypes(o.types, baseURI);
    }
    if (typeof o.properties !== "undefined") {
        this.loadProperties(o.properties, baseURI);
    }
    if (typeof o.items !== "undefined") {
        this.loadItems(o.items, baseURI);
    }
};

/**
 * Load just the types from a data object.
 * 
 * @param {Object} typeEntries The "types" subsection of Exhibit JSON.
 * @param {String} baseURI The base URI for normalizing URIs in the object.
 */
Exhibit.Database._LocalImpl.prototype.loadTypes = function(typeEntries, baseURI) {
    $(document).trigger('onBeforeLoadingTypes.exhibit');
    var lastChar, typeID, typeEntry, type, p;
    try {
        lastChar = baseURI.substr(baseURI.length - 1);
        if (lastChar === "#") {
            baseURI = baseURI.substr(0, baseURI.length - 1) + "/";
        } else if (lastChar !== "/" && lastChar !== ":") {
            baseURI += "/";
        }
    
        for (typeID in typeEntries) {
            if (typeEntries.hasOwnProperty(typeID)) {
                if (typeof typeID === "string") {
                    typeEntry = typeEntries[typeID];
                    if (typeof typeEntry === "object") {
                        if (typeof this._types[typeID] !== "undefined") {
                            type = this._types[typeID];
                        } else {
                            type = new Exhibit.Database.Type(typeID);
                            this._types[typeID] = type;
                        }
            
                        for (p in typeEntry) {
                            if (typeEntry.hasOwnProperty(p)) {
                                type._custom[p] = typeEntry[p];
                            }
                        }
                        
                        if (typeof type._custom.uri === "undefined") {
                            type._custom.uri = baseURI + "type#" + encodeURIComponent(typeID);
                        }
                        
                        if (typeof type._custom.label === "undefined") {
                            type._custom.label = typeID;
                        }
                    }
                }
            }
        }
        
        $(document).trigger('onAfterLoadingTypes.exhibit');
    } catch(e) {
        Exhibit.Debug.exception(e, Exhibit._("%database.error.loadTypesFailure"));
    }
};

/**
 * Load just the properties from the data.  The valid valueType values can be:
 * text, html, number, date, boolean, item, url.
 *
 * @param {Object} propertyEntries The "properties" subsection of Exhibit JSON.
 * @param {String} baseURI The base URI for normalizing URIs in the object.
 */
Exhibit.Database._LocalImpl.prototype.loadProperties = function(propertyEntries, baseURI) {
    $(document).trigger("onBeforeLoadingProperties.exhibit");
    var lastChar, propertyID, prpoertyEntry, property;
    try {
        lastChar = baseURI.substr(baseURI.length - 1);
        if (lastChar === "#") {
            baseURI = baseURI.substr(0, baseURI.length - 1) + "/";
        } else if (lastChar !== "/" && lastChar !== ":") {
            baseURI += "/";
        }
    
        for (propertyID in propertyEntries) {
            if (propertyEntries.hasOwnProperty(propertyID)) {
                if (typeof propertyID === "string") {
                    propertyEntry = propertyEntries[propertyID];
                    if (typeof propertyEntry === "object") {
                        if (typeof this._properties[propertyID] !== "undefined") {
                            property = this._properties[propertyID];
                        } else {
                            property = new Exhibit.Database.Property(propertyID, this);
                            this._properties[propertyID] = property;
                        }
            
                        property._uri = typeof propertyEntry.uri !== "undefined" ?
                            propertyEntry.uri :
                            (baseURI + "property#" + encodeURIComponent(propertyID));

                        property._valueType = typeof propertyEntry.valueType !== "undefined" ?
                            propertyEntry.valueType :
                            "text";
            
                        property._label = typeof propertyEntry.label !== "undefined" ?
                            propertyEntry.label :
                            propertyID;

                        property._pluralLabel = typeof propertyEntry.pluralLabel !== "undefined" ?
                            propertyEntry.pluralLabel :
                            property._label;
            
                        property._reverseLabel = typeof propertyEntry.reverseLabel !== "undefined" ?
                            propertyEntry.reverseLabel :
                            ("!" + property._label);

                        property._reversePluralLabel = typeof propertyEntry.reversePluralLabel !== "undefined" ?
                            propertyEntry.reversePluralLabel :
                            ("!" + property._pluralLabel);
            
                        property._groupingLabel = typeof propertyEntry.groupingLabel !== "undefined" ?
                            propertyEntry.groupingLabel :
                            property._label;

                        property._reverseGroupingLabel = typeof propertyEntry.reverseGroupingLabel !== "undefined" ?
                            propertyEntry.reverseGroupingLabel :
                            property._reverseLabel;
            
                        if (typeof propertyEntry.origin !== "undefined") {
                            property._origin = propertyEntry.origin;
                        }
                    }
                }
            }
        }

        this._propertyArray = null;
        
        $(document).trigger("onAfterLoadingProperties.exhibit");
    } catch(e) {
        Exhibit.Debug.exception(e, Exhibit._("%database.error.loadPropertiesFailure"));
    }
};

/**
 * Load just the items from the data.
 * 
 * @param {Object} itemEntries The "items" subsection of Exhibit JSON.
 * @param {String} baseURI The base URI for normalizing URIs in the object.
 */
Exhibit.Database._LocalImpl.prototype.loadItems = function(itemEntries, baseURI) {
    $(document).trigger("onBeforeLoadingItems.exhibit");
    var lastChar, spo, ops, indexPut, indexTriple, i, entry;
    try {
        lastChar = baseURI.substr(baseURI.length - 1);
        if (lastChar === "#") {
            baseURI = baseURI.substr(0, baseURI.length - 1) + "/";
        } else if (lastChar !== "/" && lastChar !== ":") {
            baseURI += "/";
        }
        
        spo = this._spo;
        ops = this._ops;
        indexPut = Exhibit.Database._indexPut;
        indexTriple = function(s, p, o) {
            indexPut(spo, s, p, o);
            indexPut(ops, o, p, s);
        };
        
        for (i = 0; i < itemEntries.length; i++) {
            entry = itemEntries[i];
            if (typeof entry === "object") {
                this._loadItem(entry, indexTriple, baseURI);
            }
        }
        
        this._propertyArray = null;
        
        $(document).trigger("onAfterLoadingItems.exhibit");
    } catch(e) {
        Exhibit.Debug.exception(e, Exhibit._("%database.error.loadItemsFailure"));
    }
};

/**
 * Retrieve a database type given the type identifier, or null if the
 * type does not exist.
 *
 * @param {String} typeID The type identifier.
 * @returns {Exhibit.Database.Type} The corresponding database type.
 */
Exhibit.Database._LocalImpl.prototype.getType = function(typeID) {
    return typeof this._types[typeID] ?
        this._types[typeID] :
        null;
};

/**
 * Retrieve a database property given an identifier, or null if no such
 * property exists. 
 *
 * @param {String} propertyID The property identifier.
 * @returns {Exhibit.Database._Property} The corresponding database property.
 */
Exhibit.Database._LocalImpl.prototype.getProperty = function(propertyID) {
    return typeof this._properties[propertyID] !== "undefined" ?
        this._properties[propertyID] :
        null;
};

/**
 * Retrieve all database property identifiers in an array. 
 *
 * @returns {Array} The array of property identifiers.
 */
Exhibit.Database._LocalImpl.prototype.getAllProperties = function() {
    var propertyID;

    if (this._propertyArray === null) {
        this._propertyArray = [];
        for (propertyID in this._properties) {
            if (this._properties.hasOwnProperty(propertyID)) {
                this._propertyArray.push(propertyID);
            }
        }
    }
    
    return [].concat(this._propertyArray);
};

/**
 * Retrieve all items in the database.
 *
 * @returns {Exhibit.Set} The set of all items.
 */
Exhibit.Database._LocalImpl.prototype.getAllItems = function() {
    var items = new Exhibit.Set();
    items.addSet(this._items);

    return items;
};

/**
 * Count the number of items in the database.
 *
 * @returns {Number} The number of items in the database.
 */
Exhibit.Database._LocalImpl.prototype.getAllItemsCount = function() {
    return this._items.size();
};

/**
 * Returns true if an item identifier exists in the database, false otherwise.
 *
 * @param {String} itemID The item identifier.
 * @returns {Boolean} True if the item ID is in the database.
 */
Exhibit.Database._LocalImpl.prototype.containsItem = function(itemID) {
    return this._items.contains(itemID);
};

/**
 * Work through URIs of database properties and algorithmically extract
 * the best guess at all URI namespaces used in the data.  Modifies its
 * arguments, does not return anything.  idToQualifiedName is a hash for
 * helping translate a full URI into a QName (prefix:localName), where
 * idToQualifiedName[ID] = { base: baseURI, localName: localName, prefix:
 * baseNickname }.  prefixToBase maps the base nickname back to the prefix,
 * where prefixToBase[prefix] = baseURI.
 *
 * @param {Object} idToQualifiedName Maps URIs to QNames.
 * @param {Object} prefixToBase Maps prefixes to full base URIs.
 */
Exhibit.Database._LocalImpl.prototype.getNamespaces = function(idToQualifiedName, prefixToBase) {
    var bases = {}, propertyID, property, uri, hash, base, slash,
        baseToPrefix, letters, i, prefix, qname;
    for (propertyID in this._properties) {
        if (this._properties.hasOwnProperty(propertyID)) {
            property = this._properties[propertyID];
            uri = property.getURI();
        
            hash = uri.indexOf("#");
            slash = uri.lastIndexOf("/");
            if (hash > 0) {
                base = uri.substr(0, hash + 1);
                bases[base] = true;
            
                idToQualifiedName[propertyID] = {
                    base:       base,
                    localName:  uri.substr(hash + 1)
                };
            } else if (slash > 0) {
                base = uri.substr(0, slash + 1);
                bases[base] = true;
                
                idToQualifiedName[propertyID] = {
                    base:       base,
                    localName:  uri.substr(slash + 1)
                };
            }
        }
    }
    
    baseToPrefix = {};
    letters = "abcdefghijklmnopqrstuvwxyz";
    i = 0;
    
    for (base in bases) {
        if (bases.hasOwnProperty(base)) {
            prefix = letters.substr(i++,1);
            prefixToBase[prefix] = base;
            baseToPrefix[base] = prefix;
        }
    }
    
    for (propertyID in idToQualifiedName) {
        if (idToQualifiedName.hasOwnProperty(propertyID)) {
            qname = idToQualifiedName[propertyID];
            qname.prefix = baseToPrefix[qname.base];
        }
    }
};

/**
 * Fill a set with all objects for a given subject-predicate pair.
 * 
 * @param {String} s The subject identifier.
 * @param {String} p The predicate identifier.
 * @param {Exhibit.Set} [set] The set to fill.
 * @param {Exhibit.Set} [filter] Only include objects in this set.
 * @returns {Exhibit.Set} The filled set of objects.
 */
Exhibit.Database._LocalImpl.prototype.getObjects = function(s, p, set, filter) {
    return this._get(this._spo, s, p, set, filter);
};

/**
 * Count the distinct, unique objects (any repeated objects count as one)
 * for a subject-predicate pair. 
 *
 * @param {String} s The subject identifier.
 * @param {String} p The prediate identifier.
 * @param {Exhibit.Set} [filter] Only include objects in this filter.
 * @returns {Number} The count of distinct objects.
 */
Exhibit.Database._LocalImpl.prototype.countDistinctObjects = function(s, p, filter) {
    return this._countDistinct(this._spo, s, p, filter);
};

/**
 * Fill a set with all objects for all subject-predicate pairs from a set
 * of subjects. 
 *
 * @param {Exhibit.Set} subjects A set of subject identifiers.
 * @param {String} p The predicate identifier.
 * @param {Exhibit.Set} [set] The set to fill.
 * @param {Exhibit.Set} [filter] Only include objects in this filter.
 * @returns {Exhibit.Set} The filled set of objects.
 */
Exhibit.Database._LocalImpl.prototype.getObjectsUnion = function(subjects, p, set, filter) {
    return this._getUnion(this._spo, subjects, p, set, filter);
};

/**
 * Count the distinct, unique objects for subject-predicate pairs for all
 * subjects in a set.  Objects that repeat across subject-predicate pairs
 * are counted for each appearance. 
 *
 * @param {Exhibit.Set} subjects A set of subject identifiers.
 * @param {String} p The predicate identifier.
 * @param {Exhibit.Set} [filter] Only include objects in this filter.
 * @returns {Number} The count of distinct matching objects.
 */
Exhibit.Database._LocalImpl.prototype.countDistinctObjectsUnion = function(subjects, p, filter) {
    return this._countDistinctUnion(this._spo, subjects, p, filter);
};

/**
 * Fill a set with all the subjects with the matching object-predicate pair.
 *
 * @param {String} o The object.
 * @param {String} p The predicate identifier.
 * @param {Exhibit.Set} [set] The set to fill.
 * @param {Exhibit.Set} [filter] Only include subjects in this filter.
 * @returns {Exhibit.Set} The filled set of matching subject identifiers.
 */
Exhibit.Database._LocalImpl.prototype.getSubjects = function(o, p, set, filter) {
    return this._get(this._ops, o, p, set, filter);
};

/**
 * Count the distinct, unique subjects (any repeated subjects count as one)
 * for an object-predicate pair.
 *
 * @param {String} o The object.
 * @param {String} p The predicate identifier.
 * @param {Exhibit.Set} [filter] Only include subjects in this filter.
 * @returns {Number} The count of matching, distinct subjects.
 */
Exhibit.Database._LocalImpl.prototype.countDistinctSubjects = function(o, p, filter) {
    return this._countDistinct(this._ops, o, p, filter);
};

/**
 * Fill a set with all subjects for all object-predicate pairs from a set
 * of objects. 
 *
 * @param {Exhibit.Set} objects The set of objects.
 * @param {String} p The predicate identifier.
 * @param {Exhibit.Set} [set] The set to fill.
 * @param {Exhibit.Set} [filter] Only include subjects in this filter.
 * @returns {Exhibit.Set} The filled set of subjects.
 */
Exhibit.Database._LocalImpl.prototype.getSubjectsUnion = function(objects, p, set, filter) {
    return this._getUnion(this._ops, objects, p, set, filter);
};

/**
 * Count the distinct, unique subjects for object-predicate pairs for all
 * objects in a set. 
 * 
 * @param {Exhibit.Set} objects The set of objects.
 * @param {String} p The predicate identifier.
 * @param {Exhibit.Set} [filter] Only include subjects in this filter.
 * @returns {Number} The count of matching subjects.
 */
Exhibit.Database._LocalImpl.prototype.countDistinctSubjectsUnion = function(objects, p, filter) {
    return this._countDistinctUnion(this._ops, objects, p, filter);
};

/**
 * Return one (and only one) object given a subject-predicate pair, or null
 * if no such object exists.
 *
 * @param {String} s The subject identifier.
 * @param {String} p The predicate identifier.
 * @returns {String} One matching object.
 */
Exhibit.Database._LocalImpl.prototype.getObject = function(s, p) {
    var hash, array;

    hash = this._spo[s];
    if (hash) {
        array = hash[p];
        if (array) {
            return array[0];
        }
    }
    return null;
};

/**
 * Return one (and only one) subject from an object-predicate pair, or null
 * if no such subject exists.
 *
 * @param {String} o The object.
 * @param {String} p The predicate identifier.
 * @returns {String} One matching subject identifier.
 */
Exhibit.Database._LocalImpl.prototype.getSubject = function(o, p) {
    var hash, array;

    hash = this._ops[o];
    if (hash) {
        array = hash[p];
        if (array) {
            return array[0];
        }
    }
    return null;
};

/**
 * Return an array of predicates from triples with the given subject. 
 *
 * @param {String} s The subject identifier.
 * @returns {Array} The predicate identifiers.
 */
Exhibit.Database._LocalImpl.prototype.getForwardProperties = function(s) {
    return this._getProperties(this._spo, s);
};

/**
 * Return an array of predicates from triples for the given object. 
 *
 * @param {String} o The object identifier.
 * @returns {Array} The predicate identifiers.
 */
Exhibit.Database._LocalImpl.prototype.getBackwardProperties = function(o) {
    return this._getProperties(this._ops, o);
};

/**
 * Fill a set with subjects whose property values for the given property
 * fall within the min, max range.
 *
 * @param {String} p The predicate identifier.
 * @param {Number} min The minimum value for the range.
 * @param {Number} max The maximum value for the range.
 * @param {Boolean} inclusive Whether the maximum is a limit or included.
 * @param {Exhibit.Set} [set] The set to fill.
 * @param {Exhibit.Set} [filter] Only include subjects in this filter.
 * @returns {Exhibit.Set} The filled set of matching subject identifiers.
 */
Exhibit.Database._LocalImpl.prototype.getSubjectsInRange = function(p, min, max, inclusive, set, filter) {
    var property, rangeIndex;
    property = this.getProperty(p);
    if (property !== null) {
        rangeIndex = property.getRangeIndex();
        if (rangeIndex !== null) {
            return rangeIndex.getSubjectsInRange(min, max, inclusive, set, filter);
        }
    }
    return (!set) ? new Exhibit.Set() : set;
};

/**
 * Fill a set with all objects in the database of property "type" for
 * the given set of subjects.
 *
 * @param {Exhibit.Set} set A set of subject identifiers.
 * @returns {Exhibit.Set} A set of type identifiers.
 */
Exhibit.Database._LocalImpl.prototype.getTypeIDs = function(set) {
    return this.getObjectsUnion(set, "type", null, null);
};


/**
 * Add a triple to the database.
 *
 * @param {String} s The subject identifier.
 * @param {String} p The predicate identifier.
 * @param {String} o The object.
 */
Exhibit.Database._LocalImpl.prototype.addStatement = function(s, p, o) {
    var indexPut = Exhibit.Database._indexPut;
    indexPut(this._spo, s, p, o);
    indexPut(this._ops, o, p, s);
};

/**
 * Remove a triple from the database, returning either the object or the
 * subject that was removed.
 *
 * @param {String} s The subject identifier.
 * @param {String} p The predicate identifier.
 * @param {String} o The object.
 * @returns {String} Either the object or the subject.
 */
Exhibit.Database._LocalImpl.prototype.removeStatement = function(s, p, o) {
    var indexRemove, removedObject, removedSubject;
    indexRemove = Exhibit.Database._indexRemove;
    removedObject = indexRemove(this._spo, s, p, o);
    removedSubject = indexRemove(this._ops, o, p, s);
    return removedObject || removedSubject;
};

/**
 * Remove all objects associated with a subject-predicate pair,
 * returning a boolean for success. 
 * 
 * @param {String} s The subject identifier.
 * @param {String} p The predicate identifier.
 * @returns {Boolean} True if removed.
 */
Exhibit.Database._LocalImpl.prototype.removeObjects = function(s, p) {
    var indexRemove, indexRemoveList, objects, i;
    indexRemove = Exhibit.Database._indexRemove;
    indexRemoveList = Exhibit.Database._indexRemoveList;
    objects = indexRemoveList(this._spo, s, p);
    if (objects === null) {
        return false;
    } else {
        for (i = 0; i < objects.length; i++) {
            indexRemove(this._ops, objects[i], p, s);
        }
        return true;
    }
};

/**
 * Remove all subjects associated with an object-predicate pair,
 * returning a boolean for success.
 *
 * @param {String} o The object.
 * @param {String} p The predicate identifier.
 * @returns {Boolean} True if removed.
 */
Exhibit.Database._LocalImpl.prototype.removeSubjects = function(o, p) {
    var indexRemove, indexRemoveList, subjects, i;
    indexRemove = Exhibit.Database._indexRemove;
    indexRemoveList = Exhibit.Database._indexRemoveList;
    subjects = indexRemoveList(this._ops, o, p);
    if (subjects === null) {
        return false;
    } else {
        for (i = 0; i < subjects.length; i++) {
            indexRemove(this._spo, subjects[i], p, o);
        }
        return true;
    }
};

/**
 * Reset the entire database to its empty state.
 */
Exhibit.Database._LocalImpl.prototype.removeAllStatements = function() {
    $(document).trigger("onBeforeRemovingAllStatements.exhibit");
    var propertyID;
    try {
        this._spo = {};
        this._ops = {};
        this._items = new Exhibit.Set();
    
        for (propertyID in this._properties) {
            if (this._properties.hasOwnProperty(propertyID)) {
                this._properties[propertyID]._onNewData();
            }
        }
        this._propertyArray = null;
        
        $(document).trigger("onAfterRemovingAllStatements.exhibit");
    } catch(e) {
        Exhibit.Debug.exception(e, Exhibit._("%database.error.removeAllStatementsFailure"));
    }
};

/**
 * Use registered importers to load a link based on its stated MIME type.
 *
 * @param {Array} links An array of DOM link elements.
 * @param {Exhibit.Database} database The database to load into.
 * @param {Function} fDone The function to call when finished loading.
 */
Exhibit.Database._LocalImpl.prototype._loadLinks = function(links, database, fDone) {
    var fNext, link, type, importer;
    links = [].concat(links);
    fNext = function() {
        while (links.length > 0) {
            link = links.shift();
            type = $(link).attr("type");
            if (typeof type === "undefined" || type === null || type.length === 0) {
                type = "application/json";
            }

            importer = Exhibit.Importer.getImporter(type);
            if (typeof importer !== "undefined" && importer !== null) {
                importer.load(link, database, fNext);
                return;
            } else {
                Exhibit.Debug.log(Exhibit._("%database.error.noImporterFailure", type));
            }
        }

        if (typeof fDone !== "undefined" && fDone !== null) {
            fDone();
        }
    };
    fNext();
};

/**
 * Called by data loading methods for each item being loaded.  Checks
 * viability and indexes when adding the item's triples to the database.
 *
 * @param {Object} itemEntry An object representing the item and its triples.
 * @param {Function} indexFunction A function that indexes new triples.
 * @param {String} baseURI The base URI to resolve URI fragments against.
 */
Exhibit.Database._LocalImpl.prototype._loadItem = function(itemEntry, indexFunction, baseURI) {
    var id, label, uri, type, isArray, p, v, j;

    if (typeof itemEntry.label === "undefined" &&
        typeof itemEntry.id === "undefined") {
        Exhibit.Debug.warn(Exhibit._("%database.error.itemSyntaxError",
                                     JSON.stringify(itemEntry)));
	    itemEntry.label = "item" + Math.ceil(Math.random()*1000000);
    }
    
    if (typeof itemEntry.label === "undefined") {
        id = itemEntry.id;
        if (!this._items.contains(id)) {
            Exhibit.Debug.warn(
                Exhibit._("%database.error.itemMissingLabelFailure",
                          JSON.stringify(itemEntry))
            );
        }
    } else {
        label = itemEntry.label;
        id = typeof itemEntry.id !== "undefined" ?
            itemEntry.id :
            label;
        uri = typeof itemEntry.uri !== "undefined" ?
            itemEntry.uri :
            (baseURI + "item#" + encodeURIComponent(id));
        type = typeof itemEntry.type !== "undefined" ?
            itemEntry.type :
            "Item";
                
        isArray = function(obj) {
            if (obj.constructor.toString().indexOf("Array") === -1) {
                return false;
            } else {
                return true;
            }
        };

        if (isArray(label)) {
            label = label[0];
        }

        if (isArray(id)) {
            id = id[0];
        }

        if (isArray(uri)) {
            uri = uri[0];
        }

        if (isArray(type)) {
            type = type[0];
        }
        
        this._items.add(id);
        
        indexFunction(id, "uri", uri);
        indexFunction(id, "label", label);
        indexFunction(id, "type", type);
        
        this._ensureTypeExists(type, baseURI);
    }
    
    for (p in itemEntry) {
        if (itemEntry.hasOwnProperty(p)) {
            if (typeof p === "string") {
                if (p !== "uri" && p !== "label" && p !== "id" && p !== "type") {
                    this._ensurePropertyExists(p, baseURI)._onNewData();
                                    
                    v = itemEntry[p];
                    if (v instanceof Array) {
                        for (j = 0; j < v.length; j++) {
                            indexFunction(id, p, v[j]);
                        }
                    } else if (v !== undefined && v !== null) {
                        indexFunction(id, p, v);
                    }
                }
            }
        }
    }
};

/**
 * Called during data load to make sure the schema for any types being added
 * exists, adding it if not. 
 *
 * @param {String} typeID The type identifier.
 * @param {String} baseURI The base URI to resolve URI fragments against.
 */
Exhibit.Database._LocalImpl.prototype._ensureTypeExists = function(typeID, baseURI) {
    var type;
    if (typeof this._types[typeID] === "undefined") {
        type = new Exhibit.Database.Type(typeID);
        
        type._custom.uri = baseURI + "type#" + encodeURIComponent(typeID);
        type._custom.label = typeID;
        
        this._types[typeID] = type;
    }
};

/**
 * Called during data load to make sure the schema for any property
 * being added exists, adding it if not. 
 *
 * @param {String} propertyID The property identifier.
 * @param {String} baseURI The base URI to resolve URI fragments against.
 * @returns {Exhibit.Database.Property} The corresponding database property.
 */
Exhibit.Database._LocalImpl.prototype._ensurePropertyExists = function(propertyID, baseURI) {
    var property;
    if (typeof this._properties[propertyID] === "undefined") {
        property = new Exhibit.Database.Property(propertyID, this);
        
        property._uri = baseURI + "property#" + encodeURIComponent(propertyID);
        property._valueType = "text";
        
        property._label = propertyID;
        property._pluralLabel = property._label;
        
        property._reverseLabel = Exhibit._("%database.reverseLabel", property._label);
        property._reversePluralLabel = Exhibit._("%database.reversePluralLabel", property._pluralLabel);
        
        property._groupingLabel = property._label;
        property._reverseGroupingLabel = property._reverseLabel;
        
        this._properties[propertyID] = property;
        
        this._propertyArray = null;
        return property;
    } else {
        return this._properties[propertyID];
    }
};

/**
 * Fills a set with any values that are contained in the two-level index,
 * index[x][y], only including those in the filter if the filter is provided. 
 *
 * @param {Object} index The two-level index.
 * @param {String} x The first level key.
 * @param {String} y The second level key.
 * @param {Exhibit.Set} set The set to fill.
 * @param {Exhibit.Set} [filter] Only include values in this filter.
 */
Exhibit.Database._LocalImpl.prototype._indexFillSet = function(index, x, y, set, filter) {
    var hash, array, i, z;
    hash = index[x];
    if (typeof hash !== "undefined") {
        array = hash[y];
        if (typeof array !== "undefined") {
            if (filter) {
                for (i = 0; i < array.length; i++) {
                    z = array[i];
                    if (filter.contains(z)) {
                        set.add(z);
                    }
                }
            } else {
                for (i = 0; i < array.length; i++) {
                    set.add(array[i]);
                }
            }
        }
    }
};

/**
 * Returns a count of the number of objects that would be returned from
 * _indexFillSet.
 *
 * @param {Object} index The two-level index.
 * @param {String} x The first-level key.
 * @param {String} y The second-level key.
 * @param {Exhibit.Set} [filter] Only include values in this filter.
 * @returns {Number} The count of values.
 */
Exhibit.Database._LocalImpl.prototype._indexCountDistinct = function(index, x, y, filter) {
    var count, hash, array, i;
    count = 0;
    hash = index[x];
    if (hash) {
        array = hash[y];
        if (array) {
            if (filter) {
                for (i = 0; i < array.length; i++) {
                    if (filter.contains(array[i])) {
                        count++;
                    }
                }
            } else {
                count = array.length;
            }
        }
    }
    return count;
};

/**
 * Passes through to _indexFillSet, providing an empty set if no set is
 * passed in as an argument.
 *
 * @param {Object} index The two-level index.
 * @param {String} x The first-level key.
 * @param {String} y The second-level key.
 * @param {Exhibit.Set} [set] The set to fill.
 * @param {Exhibit.Set} [filter] Only include values in this filter.
 * @returns {Exhibit.Set}
 */
Exhibit.Database._LocalImpl.prototype._get = function(index, x, y, set, filter) {
    if (typeof set === "undefined" || set === null) {
        set = new Exhibit.Set();
    }
    this._indexFillSet(index, x, y, set, filter);
    return set;
};

/**
 * Given a set of items, return values of index[x][y] for all values
 * of x in the set.
 *
 * @param {Object} index The two-level index.
 * @param {Exhibit.Set} xSet A set of first-level keys.
 * @param {String} y The second-level key.
 * @param {Exhibit.Set} [set] The set to fill.
 * @param {Exhibit.Set} [filter] Only include values in this filter.
 * @returns {Exhibit.Set} The filled set.
 */
Exhibit.Database._LocalImpl.prototype._getUnion = function(index, xSet, y, set, filter) {
    var database;
    if (typeof set === "undefined" || set === null) {
        set = new Exhibit.Set();
    }
    
    database = this;
    xSet.visit(function(x) {
        database._indexFillSet(index, x, y, set, filter);
    });
    return set;
};

/**
 * Counts all distinct values in index[x][y] for all x in a set.  Uniqueness
 * is for x-y-value triples; common values across triples will still be
 * counted.
 *
 * @param {Object} index The two-level index.
 * @param {Exhibit.Set} xSet The set of first-level keys.
 * @param {String} y the second-level key.
 * @param {Exhibit.Set} [filter] Only include values in this filter.
 * @returns {Number} The count of matching values.
 */
Exhibit.Database._LocalImpl.prototype._countDistinctUnion = function(index, xSet, y, filter) {
    var count, database;
    count = 0;
    database = this;
    xSet.visit(function(x) {
        count += database._indexCountDistinct(index, x, y, filter);
    });
    return count;
};

/**
 * Passed through to _indexCountDistinct.
 *
 * @param {Object} index The two-level index.
 * @param {String} x The first-level key.
 * @param {String} y The second-level key.
 * @param {Exhibit.Set} [filter] Only include values in this filter.
 * @returns {Number} The count of matching values.
 */
Exhibit.Database._LocalImpl.prototype._countDistinct = function(index, x, y, filter) {
    return this._indexCountDistinct(index, x, y, filter);
};

/**
 * Given an index, return all properties associated with index[x].
 *
 * @param {Object} index The two-level index.
 * @param {String} x The first-level key.
 * @returns {Array} An array of second-level keys, property identifiers.
 */
Exhibit.Database._LocalImpl.prototype._getProperties = function(index, x) {
    var hash, properties, p;
    hash = index[x];
    properties = [];
    if (typeof hash !== "undefined") {
        for (p in hash) {
            if (hash.hasOwnProperty(p)) {
                properties.push(p);
            }
        }
    }
    return properties;
};

/**
 * @param {Number} count
 * @param {String} typeID
 * @param {String} countStyleClass
 * @returns {jQuery}
 */
Exhibit.Database._LocalImpl.prototype.labelItemsOfType = function(count, typeID, countStyleClass) {
    var label, type, pluralLabel, span;
    label = Exhibit._((count === 1) ? "" : "");
    type = this.getType(typeID);
    if (typeof type !== "undefined" && type !== null) {
        label = type.getLabel();
        if (count !== 1) {
            pluralLabel = type.getProperty("pluralLabel");
            if (typeof pluralLabel !== "undefined" && pluralLabel !== null) {
                label = pluralLabel
            }
        }
    }

    span = $("<span>").html(
        $("<span>")
            .attr("class", countStyleClass)
            .html(count)
    ).append(" " + label);
    
    return span;
};

/**
 * Extension point, a no-op by default.  Clones and returns an item and
 * the graph immediately surrounding it.
 *
 * @param {String} id Identifier of database item to clone and return.
 */
Exhibit.Database._LocalImpl.prototype.getItem = function(id) {
};

/**
 * Extension point, a no-op by default.  Clones the argument and inserts
 * it into the database.
 *
 * @param {Object} item An object representing the item to add.
 */
Exhibit.Database._LocalImpl.prototype.addItem = function(item) {
};

/**
 * Extension point, a no-op by default.  Edit the object of a statement
 * given the subject and property.
 *
 * @param {String} id The identifier of the subject.
 * @param {String} prop The property identifier.
 * @param {String} value The new value for the object.
 */
Exhibit.Database._LocalImpl.prototype.editItem = function(id, prop, value) {
};

/**
 * Extension point, a no-op by default.  Remove the item identified by
 * identifier and all links in the graph from and to it.
 *
 * @param {String} id The identifier of the item to remove.
 */
Exhibit.Database._LocalImpl.prototype.removeItem = function(id) {
};
