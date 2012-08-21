/**
 * @fileOverview Utilities for various parts of Exhibit to collect
 *    their settings.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.SettingsUtilities = {};

/**
 * @param {Object} config
 * @param {Object} specs
 * @param {Object} settings
 */
Exhibit.SettingsUtilities.collectSettings = function(config, specs, settings) {
    Exhibit.SettingsUtilities._internalCollectSettings(
        function(field) { return config[field]; },
        specs,
        settings
    );
};

/**
 * @param {Element} configElmt
 * @param {Object} specs
 * @param {Object} settings
 */
Exhibit.SettingsUtilities.collectSettingsFromDOM = function(configElmt, specs, settings) {
    Exhibit.SettingsUtilities._internalCollectSettings(
        function(field) { return Exhibit.getAttribute(configElmt, field); },
        specs,
        settings
    );
};

/**
 * @param {Function} f
 * @param {Object} specs
 * @param {Object} settings
 */
Exhibit.SettingsUtilities._internalCollectSettings = function(f, specs, settings) {
    var field, spec, name, value, type, dimensions, separator, a, i;

    for (field in specs) {
        if (specs.hasOwnProperty(field)) {
            spec = specs[field];
            name = field;
            if (typeof spec.name !== "undefined") {
                name = spec.name;
            }
            if (typeof settings[name] === "undefined" &&
                typeof spec.defaultValue !== "undefined") {
                settings[name] = spec.defaultValue;
            }
        
            value = f(field);
            if (typeof value !== "undefined" && value !== null) {
                if (typeof value === "string") {
                    value = value.trim();
                }
            }

            if (typeof value !== "undefined" && value !== null && ((typeof value === "string" && value.length > 0) || typeof value !== "string")) {
                type = "text";
                if (typeof spec.type !== "undefined") {
                    type = spec.type;
                }
                
                dimensions = 1;
                if (typeof spec.dimensions !== "undefined") {
                    dimensions = spec.dimensions;
                }
                
                try {
                    if (dimensions > 1) {
                        separator = ",";
                        if (typeof spec.separator !== "undefined") {
                            separator = spec.separator;
                        }

                        a = value.split(separator);
                        if (a.length !== dimensions) {
                            throw new Error(Exhibit._("%settings.error.inconsistentDimensions", dimensions, separator, value));
                        } else {
                            for (i = 0; i < a.length; i++) {
                                a[i] = Exhibit.SettingsUtilities._parseSetting(a[i].trim(), type, spec);
                            }
                            settings[name] = a;
                        }
                    } else {
                        settings[name] = Exhibit.SettingsUtilities._parseSetting(value, type, spec);
                    }
                } catch (e) {
                    Exhibit.Debug.exception(e);
                }
            }
        }
    }
};

/**
 * @param {String|Number|Boolean|Function} s
 * @param {String} type
 * @param {Object} spec
 * @param {Array} spec.choices
 * @throws Error
 */
Exhibit.SettingsUtilities._parseSetting = function(s, type, spec) {
    var sType, f, n, choices, i;
    sType = typeof s;
    if (type === "text") {
        return s;
    } else if (type === "float") {
        if (sType === "number") {
            return s;
        } else if (sType === "string") {
            f = parseFloat(s);
            if (!isNaN(f)) {
                return f;
            }
        }
        throw new Error(Exhibit._("%settings.error.notFloatingPoint", s));
    } else if (type === "int") {
        if (sType === "number") {
            return Math.round(s);
        } else if (sType === "string") {
            n = parseInt(s, 10);
            if (!isNaN(n)) {
                return n;
            }
        }
        throw new Error(Exhibit._("%settings.error.notInteger", s));
    } else if (type === "boolean") {
        if (sType === "boolean") {
            return s;
        } else if (sType === "string") {
            s = s.toLowerCase();
            if (s === "true") {
                return true;
            } else if (s === "false") {
                return false;
            }
        }
        throw new Error(Exhibit._("%settings.error.notBoolean", s));
    } else if (type === "function") {
        if (sType === "function") {
            return s;
        } else if (sType === "string") {
            try {
                f = eval(s);
                if (typeof f === "function") {
                    return f;
                }
            } catch (e) {
                // silent
            }
        }
        throw new Error(Exhibit._("%settings.error.notFunction", s));
    } else if (type === "enum") {
        choices = spec.choices;
        for (i = 0; i < choices.length; i++) {
            if (choices[i] === s) {
                return s;
            }
        }
        throw new Error(Exhibit._("%settings.error.notEnumerated", choices.join(", "), s));
    } else {
        throw new Error(Exhibit._("%settings.error.unknownSetting", type));
    }
};

/**
 * @param {Object} config
 * @param {Object} specs
 * @param {Object} accessors
 */
Exhibit.SettingsUtilities.createAccessors = function(config, specs, accessors) {
    Exhibit.SettingsUtilities._internalCreateAccessors(
        function(field) { return config[field]; },
        specs,
        accessors
    );
};

/**
 * @param {Element} configElmt
 * @param {Object} specs
 * @param {Object} accessors
 */
Exhibit.SettingsUtilities.createAccessorsFromDOM = function(configElmt, specs, accessors) {
    Exhibit.SettingsUtilities._internalCreateAccessors(
        function(field) { return Exhibit.getAttribute(configElmt, field); },
        specs,
        accessors
    );
};

/**
 * @param {Function} f
 * @param {Object} specs
 * @param {Object} accessors
 */ 
Exhibit.SettingsUtilities._internalCreateAccessors = function(f, specs, accessors) {
    var field, spec, accessorName, acessor, isTuple, createOneAccessor, alternatives, i, noop;

    noop = function(value, database, visitor) {};

    createOneAccessor = function(spec2) {
        isTuple = false;
        if (typeof spec2["bindings"] !== "undefined") {
            return Exhibit.SettingsUtilities._createBindingsAccessor(f, spec2.bindings);
        } else if (typeof spec2["bindingNames"] !== "undefined") {
            isTuple = true;
            return Exhibit.SettingsUtilities._createTupleAccessor(f, spec2);
        } else {
            return Exhibit.SettingsUtilities._createElementalAccessor(f, spec2);
        }
    };

    for (field in specs) {
        if (specs.hasOwnProperty(field)) {
            spec = specs[field];
            accessorName = spec.accessorName;
            accessor = null;
            isTuple = false;

            if (typeof spec["alternatives"] !== "undefined") {
                alternatives = spec.alternatives;
                for (i = 0; i < alternatives.length; i++) {
                    accessor = createOneAccessor(alternatives[i]);
                    if (accessor !== null) {
                        break;
                    }
                }
            } else {
                accessor = createOneAccessor(spec);
            }
        
            if (accessor !== null) {
                accessors[accessorName] = accessor;
            } else if (typeof accessors[accessorName] === "undefined") {
                accessors[accessorName] = noop;
            }
        }
    }
};

/**
 * @param {Function} f
 * @param {Array} bindingSpecs
 * @returns {Function}
 */
Exhibit.SettingsUtilities._createBindingsAccessor = function(f, bindingSpecs) {
    var bindings, i, bindingSpec, accessor, isTuple;
    bindings = [];
    for (i = 0; i < bindingSpecs.length; i++) {
        bindingSpec = bindingSpecs[i];
        accessor = null;
        isTuple = false;
        
        if (typeof bindingSpec["bindingNames"] !== "undefined") {
            isTuple = true;
            accessor = Exhibit.SettingsUtilities._createTupleAccessor(f, bindingSpec);
        } else {
            accessor = Exhibit.SettingsUtilities._createElementalAccessor(f, bindingSpec);
        }
        
        if (typeof accessor === "undefined" || accessor === null) {
            if (typeof bindingSpec["optional"] === "undefined" || !bindingSpec.optional) {
                return null;
            }
        } else {
            bindings.push({
                bindingName:    bindingSpec.bindingName, 
                accessor:       accessor, 
                isTuple:        isTuple
            });
        }
    }
    
    return function(value, database, visitor) {
        Exhibit.SettingsUtilities._evaluateBindings(value, database, visitor, bindings);
    };
};

/**
 * @param {Function} f
 * @param {Object} spec
 * @returns {Function}
 */
Exhibit.SettingsUtilities._createTupleAccessor = function(f, spec) {
    var value, expression, parsers, bindingTypes, bindingNames, separator, i;
    value = f(spec.attributeName);

    if (typeof value === "undefined" || value === null) {
        return null;
    }
    
    if (typeof value === "string") {
        value = value.trim();
        if (value.length === 0) {
            return null;
        }
    }
    
    try {
        expression = Exhibit.ExpressionParser.parse(value);
        
        parsers = [];
        bindingTypes = spec.types;
        for (i = 0; i < bindingTypes.length; i++) {
            parsers.push(Exhibit.SettingsUtilities._typeToParser(bindingTypes[i]));
        }
        
        bindingNames = spec.bindingNames;
        separator = ",";

        if (typeof spec["separator"] !== "undefined") {
            separator = spec.separator;
        }
        
        return function(itemID, database, visitor, tuple) {
            expression.evaluateOnItem(itemID, database).values.visit(
                function(v) {
                    var a, tuple2, n, j;
                    a = v.split(separator);
                    if (a.length === parsers.length) {
                        tuple2 = {};
                        if (tuple) {
                            for (n in tuple) {
                                if (tuple.hasOwnProperty(n)) {
                                    tuple2[n] = tuple[n];
                                }
                            }
                        }

                        for (j = 0; j < bindingNames.length; j++) {
                            tuple2[bindingNames[j]] = null;
                            parsers[j](a[j], function(v) { tuple2[bindingNames[j]] = v; });
                        }
                        visitor(tuple2);
                    }
                }
            );
        };

    } catch (e) {
        Exhibit.Debug.exception(e);
        return null;
    }
};

/**
 * @param {Function} f
 * @param {Object} spec
 * @param {String} spec.attributeName
 * @returns {Function}
 */
Exhibit.SettingsUtilities._createElementalAccessor = function(f, spec) {
    var value, bindingType, expression, parser;

    value = f(spec.attributeName);

    if (typeof value === "undefined" || value === null) {
        return null;
    }
    
    if (typeof value === "string") {
        value = value.trim();
        if (value.length === 0) {
            return null;
        }
    }
    
    bindingType = "text";

    if (typeof spec["type"] !== "undefined") {
        bindingType = spec.type;
    }

    try {
        expression = Exhibit.ExpressionParser.parse(value);
        parser = Exhibit.SettingsUtilities._typeToParser(bindingType);
        return function(itemID, database, visitor) {
            expression.evaluateOnItem(itemID, database).values.visit(
                function(v) { return parser(v, visitor); }
            );
        };
    } catch (e) {
        Exhibit.Debug.exception(e);
        return null;
    }
};

/**
 * @param {String} type
 * @returns {Function}
 * @throws Error
 */
Exhibit.SettingsUtilities._typeToParser = function(type) {
    switch (type) {
    case "text":    return Exhibit.SettingsUtilities._textParser;
    case "url":     return Exhibit.SettingsUtilities._urlParser;
    case "float":   return Exhibit.SettingsUtilities._floatParser;
    case "int":     return Exhibit.SettingsUtilities._intParser;
    case "date":    return Exhibit.SettingsUtilities._dateParser;
    case "boolean": return Exhibit.SettingsUtilities._booleanParser;
    default:
        throw new Error(Exhibit._("%settings.error.unknownSetting", type));

    }
};

/**
 * @param {String} v
 * @param {Function} f
 */
Exhibit.SettingsUtilities._textParser = function(v, f) {
    return f(v);
};

/**
 * @param {String} v
 * @param {Function} f
 */
Exhibit.SettingsUtilities._floatParser = function(v, f) {
    var n = parseFloat(v);
    if (!isNaN(n)) {
        return f(n);
    }
    return false;
};

/**
 * @param {String} v
 * @param {Function} f
 */
Exhibit.SettingsUtilities._intParser = function(v, f) {
    var n = parseInt(v, 10);
    if (!isNaN(n)) {
        return f(n);
    }
    return false;
};

/**
 * @param {String} v
 * @param {Function} f
 */
Exhibit.SettingsUtilities._dateParser = function(v, f) {
    var d;
    if (v instanceof Date) {
        return f(v);
    } else if (typeof v === "number") {
        d = new Date(0);
        d.setUTCFullYear(v);
        return f(d);
    } else {
        d = Exhibit.DateTime.parseIso8601DateTime(v.toString());
        if (d !== null) {
            return f(d);
        }
    }
    return false;
};

/**
 * @param {String} v
 * @param {Function} f
 */
Exhibit.SettingsUtilities._booleanParser = function(v, f) {
    v = v.toString().toLowerCase();
    if (v === "true") {
        return f(true);
    } else if (v === "false") {
        return f(false);
    }
    return false;
};

/**
 * @param {String} v
 * @param {Function} f
 */
Exhibit.SettingsUtilities._urlParser = function(v, f) {
    return f(Exhibit.Persistence.resolveURL(v.toString()));
};

/**
 * @param {String} value
 * @param {Exhibit.Database}  database
 * @param {Function} visitor
 * @param {Array} bindings
 */
Exhibit.SettingsUtilities._evaluateBindings = function(value, database, visitor, bindings) {
    var f, maxIndex;
    maxIndex = bindings.length - 1;
    f = function(tuple, index) {
        var binding, visited, recurse, bindingName;
        binding = bindings[index];
        visited = false;
        recurse = (index === maxIndex) ?
            function() { visitor(tuple); } :
            function() { f(tuple, index + 1); };
        if (binding.isTuple) {
            /*
                The tuple accessor will copy existing fields out of "tuple" into a new
                object and then injects new fields into it before calling the visitor.
                This is so that the same tuple object is not reused for different
                tuple values, which would cause old tuples to be overwritten by new ones.
             */
            binding.accessor(
                value, 
                database, 
                function(tuple2) { visited = true; tuple = tuple2; recurse(); }, 
                tuple
            );
        } else {
            bindingName = binding.bindingName;
            binding.accessor(
                value, 
                database, 
                function(v) { visited = true; tuple[bindingName] = v; recurse(); }
            );
        }
        
        if (!visited) { recurse(); }
    };
    f({}, 0);
};
