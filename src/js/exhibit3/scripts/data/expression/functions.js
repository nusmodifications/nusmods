/**
 * @fileOverview Implementation of query language function features.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Functions = {};

/**
 * @namespace
 */
Exhibit.FunctionUtilities = {};

/**
 * @static
 * @param {String} name
 * @param {Function} f
 * @param {String} valueType
 */
Exhibit.FunctionUtilities.registerSimpleMappingFunction = function(name, f, valueType) {
    Exhibit.Functions[name] = {
        f: function(args) {
            var set = new Exhibit.Set(), i, fn;
            fn = function() {
                return function(v) {
                    var v2 = f(v);
                    if (typeof v2 !== "undefined") {
                        set.add(v2);
                    }
                };
            };
            for (i = 0; i < args.length; i++) {
                args[i].forEachValue(fn());
            }
            return new Exhibit.Expression._Collection(set, valueType);
        }
    };
};

Exhibit.Functions["union"] = {
    f: function(args) {
        var set, valueType, i, arg;
        set = new Exhibit.Set();
        valueType = null;
        
        if (args.length > 0) {
            valueType = args[0].valueType;
            for (i = 0; i < args.length; i++) {
                arg = args[i];
                if (arg.size > 0) {
                    if (typeof valueType === "undefined" || valueType === null) {
                        valueType = arg.valueType;
                    }
                    set.addSet(arg.getSet());
                }
            }
        }
        return new Exhibit.Expression._Collection(set, (typeof valueType !== "undefined" && valueType !== null) ? valueType : "text");
    }
};

Exhibit.Functions["contains"] = {
    f: function(args) {
        var result, set;
        result = args[0].size > 0;
        set = args[0].getSet();
        
        args[1].forEachValue(function(v) {
            if (!set.contains(v)) {
                result = false;
                return true;
            }
        });
        
        return new Exhibit.Expression._Collection([ result ], "boolean");
    }
};

Exhibit.Functions["exists"] = {
    f: function(args) {
        return new Exhibit.Expression._Collection([ args[0].size > 0 ], "boolean");
    }
};

Exhibit.Functions["count"] = {
    f: function(args) {
        return new Exhibit.Expression._Collection([ args[0].size ], "number");
    }
};

Exhibit.Functions["not"] = {
    f: function(args) {
        return new Exhibit.Expression._Collection([ !args[0].contains(true) ], "boolean");
    }
};

Exhibit.Functions["and"] = {
    f: function(args) {
        var r = true, i;
        for (i = 0; r && i < args.length; i++) {
            r = r && args[i].contains(true);
        }
        return new Exhibit.Expression._Collection([ r ], "boolean");
    }
};

Exhibit.Functions["or"] = {
    f: function(args) {
        var r = false, i;
        for (i = 0; !r && i < args.length; i++) {
            r = r || args[i].contains(true);
        }
        return new Exhibit.Expression._Collection([ r ], "boolean");
    }
};

Exhibit.Functions["add"] = {
    f: function(args) {
        var total, i, fn;
        total = 0;
        fn = function() {
            return function(v) {
                if (typeof v !== "undefined" && v !== null) {
                    if (typeof v === "number") {
                        total += v;
                    } else {
                        var n = parseFloat(v);
                        if (!isNaN(n)) {
                            total += n;
                        }
                    }
                }
            };
        };
        for (i = 0; i < args.length; i++) {
            args[i].forEachValue(fn());
        }
        
        return new Exhibit.Expression._Collection([ total ], "number");
    }
};

// Note: arguments expanding to multiple items get concatenated in random order
Exhibit.Functions["concat"] = {
    f: function(args) {
        var result = [], i, fn;
        fn = function() {
            return function(v) {
                if (typeof v !== "undefined" && v !== null) {
                    result.push(v);
                }
            };
        };
        for (i = 0; i < args.length; i++) {
            args[i].forEachValue(fn());
        }

        return new Exhibit.Expression._Collection([ result.join('') ], "text");
    }
};

Exhibit.Functions["multiply"] = {
    f: function(args) {
        var product = 1, i, fn;
        fn = function() {
            return function(v) {
                var n;
                if (typeof v !== "undefined" && v !== null) {
                    if (typeof v === "number") {
                        product *= v;
                    } else {
                        n = parseFloat(v);
                        if (!isNaN(n)) {
                            product *= n;
                        }
                    }
                }
            };
        };
        for (i = 0; i < args.length; i++) {
            args[i].forEachValue(fn());
        }
        
        return new Exhibit.Expression._Collection([ product ], "number");
    }
};

Exhibit.Functions["date-range"] = {
    _parseDate: function (v) {
        if (typeof v === "undefined" || v === null) {
            return Number.NEGATIVE_INFINITY;
        } else if (v instanceof Date) {
            return v.getTime();
        } else {
            try {
                return Exhibit.DateTime.parseIso8601DateTime(v).getTime();
            } catch (e) {
                return Number.NEGATIVE_INFINITY;
            }
        }
    },
    _computeRange: function(from, to, interval) {
        var range = to - from;
        if (isFinite(range)) {
            if (typeof Exhibit.DateTime[interval.toUpperCase()] !== "undefined") {
                range = Math.round(range / Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime[interval.toUpperCase()]]);
            }
            return range;
        }
        return null;
    },
    f: function(args) {
        var self = this, from, to, interval, range;
        
        from = Number.POSITIVE_INFINITY;
        args[0].forEachValue(function(v) {
            from = Math.min(from, self._parseDate(v));
        });
        
        to = Number.NEGATIVE_INFINITY;
        args[1].forEachValue(function(v) {
            to = Math.max(to, self._parseDate(v));
        });
        
        interval = "day";
        args[2].forEachValue(function(v) {
            interval = v;
        });
            
        range = this._computeRange(from, to, interval);
        return new Exhibit.Expression._Collection((typeof range !== "undefined" && range !== null) ? [ range ] : [], "number");
    }
};

Exhibit.Functions["distance"] = {
    _units: {
        km:         1e3,
        mile:       1609.344
    },
    _computeDistance: function(from, to, unit, roundTo) {
        var range = from.distanceFrom(to);
        if (!roundTo) {
            roundTo = 1;
        }
        if (isFinite(range)) {
            if (typeof this._units[unit] !== "undefined") {
                range = range / this._units[unit];
            }
            return Exhibit.Util.round(range, roundTo);
        }
        return null;
    },
    f: function(args) {
        var self = this, data, name, i, latlng, from, to, range, fn;
        data = {};
        name = ["origo", "lat", "lng", "unit", "round"];
        fn = function(nm) {
            return function(v) {
                data[nm] = v;
            };
        };
        for (i = 0, n = name[i]; i < name.length; i++) {
            args[i].forEachValue(fn(n));
        }

        latlng = data.origo.split(",");
        from = new GLatLng( latlng[0], latlng[1] );
        to = new GLatLng( data.lat, data.lng );
        
        range = this._computeDistance(from, to, data.unit, data.round);
        return new Exhibit.Expression._Collection((typeof range !== "undefined" && range !== null) ? [ range ] : [], "number");
    }
};

Exhibit.Functions["min"] = {
    f: function(args) {
        /** @ignore */
        var returnMe = function (val) { return val; }, min, valueType, i, arg, currentValueType, parser, fn;
        min = Number.POSITIVE_INFINITY;
        valueType = null;
        fn = function(p, c) {
            return function(v) {
                var parsedV = p(v, returnMe);
                if (parsedV < min || min === Number.POSITIVE_INFINITY) {
                    min = parsedV;
                    valueType = (valueType === null) ? c : 
                        (valueType === c ? valueType : "text") ;
                }
            };
        };
        for (i = 0; i < args.length; i++) {
            arg = args[i];
            currentValueType = arg.valueType ? arg.valueType : 'text';
            parser = Exhibit.SettingsUtilities._typeToParser(currentValueType);
                
            arg.forEachValue(fn(parser, currentValueType));
        }
        
        return new Exhibit.Expression._Collection([ min ], (typeof valueType !== "undefined" && valueType !== null) ? valueType : "text");
    }
};

Exhibit.Functions["max"] = {
    f: function(args) {
        var returnMe = function (val) { return val; }, max, valueType, i, arg, currentValueType, parser, fn;
        max = Number.NEGATIVE_INFINITY;
        valueType = null;
        fn = function(p, c) {
            return function(v) {
                var parsedV = p(v, returnMe);
                if (parsedV > max || max === Number.NEGATIVE_INFINITY) {
                    max = parsedV;
                    valueType = (valueType === null) ? c : 
                        (valueType === c ? valueType : "text") ;
                }
            };
        };
        
        for (i = 0; i < args.length; i++) {
            arg = args[i];
            currentValueType = arg.valueType ? arg.valueType : 'text';
            parser = Exhibit.SettingsUtilities._typeToParser(currentValueType);
            
            arg.forEachValue(fn(parser, c));
        }
        return new Exhibit.Expression._Collection([ max ], (typeof valueType !== "undefined" && valueType !== null) ? valueType : "text");
    }
};

Exhibit.Functions["remove"] = {
    f: function(args) {
        var set, valueType, i, arg;
        set = args[0].getSet();
        valueType = args[0].valueType;
        for (i = 1; i < args.length; i++) {
            arg = args[i];
            if (arg.size > 0) {
                set.removeSet(arg.getSet());
            }
        }
        return new Exhibit.Expression._Collection(set, valueType);
    }
};

Exhibit.Functions["now"] = {
    f: function(args) {
        return new Exhibit.Expression._Collection([ new Date() ], "date");
    }
};
