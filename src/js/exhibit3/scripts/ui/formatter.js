/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Formatter = {
    /**
     * @constant
     */
    "_lessThanRegex": /</g,
    /**
     * @constant
     */
    "_greaterThanRegex": />/g
};


/**
 * @static
 * @param {jQuery} parentElmt
 * @param {Number} count
 * @param {Exhibit.UIContext} uiContext
 * @returns {Function}
 */
Exhibit.Formatter.createListDelimiter = function(parentElmt, count, uiContext) {
    var separator, lastSeparator, pairSeparator, f;
    separator = uiContext.getSetting("format/list/separator");
    lastSeparator = uiContext.getSetting("format/list/last-separator");
    pairSeparator = uiContext.getSetting("format/list/pair-separator");
    
    if (typeof separator !== "string") {
        separator = Exhibit._("%formatter.listSeparator");
    }
    if (typeof lastSeparator !== "string") {
        lastSeparator = Exhibit._("%formatter.listLastSeparator");
    }
    if (typeof pairSeparator !== "string") {
        pairSeparator = Exhibit._("%formatter.listPairSeparator");
    }

    f = function() {
        if (f.index > 0 && f.index < count) {
            if (count > 2) {
                $(parentElmt).append(document.createTextNode(
                (f.index === count - 1) ? lastSeparator : separator));
            } else {
                $(parentElmt).append(document.createTextNode(pairSeparator));
            }
        }
        f.index++;
    };
    f.index = 0;
    
    return f;
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Formatter.encodeAngleBrackets = function(s) {
    return s.replace(Exhibit.Formatter._lessThanRegex, "&lt;").
        replace(Exhibit.Formatter._greaterThanRegex, "&gt;");
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._ListFormatter = function(uiContext) {
    this._uiContext = uiContext;
    this._separator = uiContext.getSetting("format/list/separator");
    this._lastSeparator = uiContext.getSetting("format/list/last-separator");
    this._pairSeparator = uiContext.getSetting("format/list/pair-separator");
    this._emptyText = uiContext.getSetting("format/list/empty-text");
    
    if (typeof this._separator !== "string") {
        this._separator = Exhibit._("%formatter.listSeparator");
    }
    if (typeof this._lastSeparator !== "string") {
        this._lastSeparator = Exhibit._("%formatter.listLastSeparator");
    }
    if (typeof this._pairSeparator !== "string") {
        this._pairSeparator = Exhibit._("%formatter.listPairSeparator");
    }
};

/**
 * @param {Exhibit.Set} values
 * @param {Number} count
 * @param {String} valueType
 * @param {Function} appender
 */
Exhibit.Formatter._ListFormatter.prototype.formatList = function(values, count, valueType, appender) {
    var uiContext, self, index;
    uiContext = this._uiContext;
    self = this;
    if (count === 0) {
        if (typeof this._emptyText !== "undefined" && this._emptyText !== null && this._emptyText.length > 0) {
            appender(document.createTextNode(this._emptyText));
        }
    } else if (count === 1) {
        values.visit(function(v) {
            uiContext.format(v, valueType, appender);
        });
    } else {
        index = 0;
        if (count === 2) {
            values.visit(function(v) {
                uiContext.format(v, valueType, appender);
                index++;
                
                if (index === 1) {
                    appender(document.createTextNode(self._pairSeparator));
                }
            });
        } else {
            values.visit(function(v) {
                uiContext.format(v, valueType, appender);
                index++;
                
                if (index < count) {
                    appender(document.createTextNode(
                        (index === count - 1) ? self._lastSeparator : self._separator));
                }
            });
        }
    }
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._TextFormatter = function(uiContext) {
    this._maxLength = uiContext.getSetting("format/text/max-length");
    
    if (typeof this._maxLength === "number") {
        this._maxLength = Math.max(3, Math.round(this._maxLength));
    } else {
        this._maxLength = 0; // zero means no limit
    }
};

/**
 * @param {String} value
 * @param {Function} appender
 */
Exhibit.Formatter._TextFormatter.prototype.format = function(value, appender) {
    var span = $("<span>").html(this.formatText(value));
    appender(span);
};

/**
 * @param {String} value
 * @returns {String}
 */
Exhibit.Formatter._TextFormatter.prototype.formatText = function(value) {
    if (Exhibit.params.safe) {
        value = Exhibit.Formatter.encodeAngleBrackets(value);
    }
    
    if (this._maxLength === 0 || value.length <= this._maxLength) {
        return value;
    } else {
        return Exhibit._("%formatter.textEllipsis", value.substr(0, this._maxLength));
    }
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._BooleanFormatter = function(uiContext) {
};

/**
 * @param {String|Boolean} value
 * @param {Function} appender
 */
Exhibit.Formatter._BooleanFormatter.prototype.format = function(value, appender) {
    var span = $("<span>").html(this.formatText(value));
    appender(span);
};

/**
 * @param {String|Boolean} value
 * @returns {String}
 */
Exhibit.Formatter._BooleanFormatter.prototype.formatText = function(value) {
    return (typeof value === "boolean" ? value : (typeof value === "string" ? (value === "true") : false)) ? 
        Exhibit._("%formatter.booleanTrue") : Exhibit._("%formatter.booleanFalse");
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._NumberFormatter = function(uiContext) {
    this._decimalDigits = uiContext.getSetting("format/number/decimal-digits");
    
    if (typeof this._decimalDigits === "number") {
        this._decimalDigits = Math.max(-1, Math.round(this._decimalDigits));
    } else {
        this._decimalDigits = -1; // -1 means no limit
    }
};

/**
 * @param {Number} value
 * @param {Function} appender
 */
Exhibit.Formatter._NumberFormatter.prototype.format = function(value, appender) {
    appender(document.createTextNode(this.formatText(value)));
};

/**
 * @param {Number} value
 * @returns {String}
 */
Exhibit.Formatter._NumberFormatter.prototype.formatText = function(value) {
    if (this._decimalDigits === -1) {
        return value.toString();
    } else {
        return value.toFixed(this._decimalDigits);
    }
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._ImageFormatter = function(uiContext) {
    this._uiContext = uiContext;
    
    this._maxWidth = uiContext.getSetting("format/image/max-width");
    if (typeof this._maxWidth === "number") {
        this._maxWidth = Math.max(-1, Math.round(this._maxWidth));
    } else {
        this._maxWidth = -1; // -1 means no limit
    }
    
    this._maxHeight = uiContext.getSetting("format/image/max-height");
    if (typeof this._maxHeight === "number") {
        this._maxHeight = Math.max(-1, Math.round(this._maxHeight));
    } else {
        this._maxHeight = -1; // -1 means no limit
    }
    
    this._tooltip = uiContext.getSetting("format/image/tooltip");
};

/**
 * @param {String} value
 * @param {Function} appender
 */
Exhibit.Formatter._ImageFormatter.prototype.format = function(value, appender) {
    if (Exhibit.params.safe) {
        value = value.trim().startsWith("javascript:") ? "" : value;
    }
    
    var img = $("<img>").attr("src", value);
    
    if (this._tooltip !== null) {
        if (typeof this._tooltip === "string") {
            img.attr("title", this._tootlip);
        } else {
            img.attr("title",
                     this._tooltip.evaluateSingleOnItem(
                         this._uiContext.getSetting("itemID"),
                         this._uiContext.getDatabase()
                     ).value);
        }
    }
    appender(img);
};

/**
 * @param {String} value
 * @returns {String}
 */
Exhibit.Formatter._ImageFormatter.prototype.formatText = function(value) {
    return value;
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._URLFormatter = function(uiContext) {
    this._target = uiContext.getSetting("format/url/target");
    this._externalIcon = uiContext.getSetting("format/url/external-icon");
};

/**
 * @param {String} value
 * @param {Function} appender
 */
Exhibit.Formatter._URLFormatter.prototype.format = function(value, appender) {
    var a = $("a").attr("href", value).html(value);
    
    if (this._target !== null) {
        a.attr("target", this._target);
    }
    // Unused
    //if (this._externalIcon !== null) {
    //
    //}
    appender(a);
};

/**
 * @param {String} value
 * @returns {String}
 */
Exhibit.Formatter._URLFormatter.prototype.formatText = function(value) {
    if (Exhibit.params.safe) {
        value = value.trim().startsWith("javascript:") ? "" : value;
    }
    return value;
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._CurrencyFormatter = function(uiContext) {
    this._decimalDigits = uiContext.getSetting("format/currency/decimal-digits");
    if (typeof this._decimalDigits === "number") {
        this._decimalDigits = Math.max(-1, Math.round(this._decimalDigits)); // -1 means no limit
    } else {
        this._decimalDigits = 2;
    }
    
    this._symbol = uiContext.getSetting("format/currency/symbol");
    if (typeof this._symbol === "undefined" || this._symbol === null) {
        this._symbol = Exhibit._("%formatter.currencySymbol");
    }
    
    this._symbolPlacement = uiContext.getSetting("format/currency/symbol-placement");
    if (typeof this._symbolPlacement === "undefined" || this._symbolPlacement === null) {
        this._symbol = Exhibit._("%formatter.currencySymbolPlacement");
    }
    
    this._negativeFormat = {
        signed :      uiContext.getBooleanSetting("format/currency/negative-format/signed", Exhibit._("%formatter.currencyShowSign")),
        red :         uiContext.getBooleanSetting("format/currency/negative-format/red", Exhibit._("%formatter.currencyShowRed")),
        parentheses : uiContext.getBooleanSetting("format/currency/negative-format/parentheses", Exhibit._("%formatter.currencyShowParentheses"))
    };
};

/**
 * @param {Number} value
 * @param {Function} appender
 */
Exhibit.Formatter._CurrencyFormatter.prototype.format = function(value, appender) {
    var text, span;
    text = this.formatText(value);
    if (value < 0 && this._negativeFormat.red) {
        span = $("<span>").html(text).css("color", "red");
        appender(span);
    } else {
        appender(document.createTextNode(text));
    }
};

/**
 * @param {Number} value
 * @returns {String}
 */
Exhibit.Formatter._CurrencyFormatter.prototype.formatText = function(value) {
    var negative, text, sign;
    negative = value < 0;
    if (this._decimalDigits === -1) {
        text = Math.abs(value);
    } else {
        text = Math.abs(value).toFixed(this._decimalDigits);
    }
    
    sign = (negative && this._negativeFormat.signed) ? "-" : "";
    if (negative && this._negativeFormat.parentheses) {
        text = "(" + text + ")";
    }
    
    switch (this._negativeFormat) {
    case "first":       text = this._symbol + sign + text; break;
    case "after-sign":  text = sign + this._symbol + text; break;
    case "last":        text = sign + text + this._symbol; break;
    }
    return text;
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._ItemFormatter = function(uiContext) {
    this._uiContext = uiContext;
    this._title = uiContext.getSetting("format/item/title");
};

/**
 * @param {String} value
 * @param {Function} appender
 */
Exhibit.Formatter._ItemFormatter.prototype.format = function(value, appender) {
    var self, title, a, handler;
    self = this;
    title = this.formatText(value);
    
    a = $("<a href=\"" + Exhibit.Persistence.getItemLink(value) + "\" class=\"exhibit-item\">" + title + "</a>");

    handler = function(evt) {
        Exhibit.UI.showItemInPopup(value, a.get(0), self._uiContext);
        evt.preventDefault();
        evt.stopPropagation();
    };

    a.bind("click", handler);
    
    appender(a);
};

/**
 * @param {String} value
 * @returns {String}
 */
Exhibit.Formatter._ItemFormatter.prototype.formatText = function(value) {
    var database, title;
    database = this._uiContext.getDatabase();
    title = null;
    
    if (typeof this._title === "undefined" || this._title === null) {
        title = database.getObject(value, "label");
    } else {
        title = this._title.evaluateSingleOnItem(value, database).value;
    }
    
    if (typeof title === "undefined" || title === null) {
        title = value;
    }
    
    return title;
};

/**
 * @class
 * @constructor
 * @public
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Formatter._DateFormatter = function(uiContext) {
    var mode, show, template, segments, placeholders, startIndex, p, placeholder, index, retriever;

    this._timeZone = uiContext.getSetting("format/date/time-zone");
    if (typeof this._timeZone !== "number") {
        this._timeZone = -(new Date().getTimezoneOffset()) / 60;
    }
    this._timeZoneOffset = this._timeZone * 3600000;
    
    mode = uiContext.getSetting("format/date/mode");
    show = uiContext.getSetting("format/date/show");
    template = null;
    
    switch (mode) {
    case "short":
        template = 
            show === "date" ?  Exhibit._("%formatter.dateShortFormat") :
            (show === "time" ? Exhibit._("%formatter.timeShortFormat") : 
                              Exhibit._("%formatter.dateTimeShortFormat"));
        break;
    case "medium":
        template = 
            show === "date" ?  Exhibit._("%formatter.dateMediumFormat") :
            (show === "time" ? Exhibit._("%formatter.timeMediumFormat") : 
                              Exhibit._("%formatter.dateTimeMediumFormat"));
        break;
    case "long":
        template = 
            show === "date" ?  Exhibit._("%formatter.dateLongFormat") :
            (show === "time" ? Exhibit._("%formatter.timeLongFormat") : 
                              Exhibit._("%formatter.dateTimeLongFormat"));
        break;
    case "full":
        template = 
            show === "date" ?  Exhibit._("%formatter.dateFullFormat") :
            (show === "time" ? Exhibit._("%formatter.timeFullFormat") : 
                              Exhibit._("%formatter.dateTimeFullFormat"));
        break;
    default:
        template = uiContext.getSetting("format/date/template");
    }
    
    if (typeof template !== "string") {
        template = Exhibit._("%formatter.dateTimeDefaultFormat");
    }
    
    segments = [];
    
    placeholders = template.match(/\b\w+\b/g);
    startIndex = 0;
    for (p = 0; p < placeholders.length; p++) {
        placeholder = placeholders[p];
        index = template.indexOf(placeholder, startIndex);
        if (index > startIndex) {
            segments.push(template.substring(startIndex, index));
        }
        
        retriever = Exhibit.Formatter._DateFormatter._retrievers[placeholder];
        if (typeof retriever === "function") {
            segments.push(retriever);
        } else {
            segments.push(placeholder);
        }
        
        startIndex = index + placeholder.length;
    }
    
    if (startIndex < template.length) {
        segments.push(template.substr(startIndex));
    }
    
    this._segments = segments;
};

/**
 * @param {Date|String} value
 * @param {Function} appender
 */
Exhibit.Formatter._DateFormatter.prototype.format = function(value, appender) {
    appender(document.createTextNode(this.formatText(value)));
};

/**
 * @param {Date|String} value
 * @returns {String}
 */
Exhibit.Formatter._DateFormatter.prototype.formatText = function(value) {
    var date, text, segments, i, segment;
    date = (value instanceof Date) ? value : Exhibit.DateTime.parseIso8601DateTime(value);
    if (typeof date === "undefined" || date === null) {
        return value;
    }
    
    date.setTime(date.getTime() + this._timeZoneOffset);
    
    text = "";
    segments = this._segments;
    for (i = 0; i < segments.length; i++) {
        segment = segments[i];
        if (typeof segment === "string") {
            text += segment;
        } else {
            text += segment(date);
        }
    }
    return text;
};

/**
 * @param {Number} n
 * @returns {String}
 */
Exhibit.Formatter._DateFormatter._pad = function(n) {
    return n < 10 ? ("0" + n) : n.toString();
};

/**
 * @param {Number} n
 * @returns {String}
 */
Exhibit.Formatter._DateFormatter._pad3 = function(n) {
    return n < 10 ? ("00" + n) : (n < 100 ? ("0" + n) : n.toString());
};

Exhibit.Formatter._DateFormatter._retrievers = {
    // day of month
    /**
     * @param {Date} date
     * @returns {String}
     */
    "d": function(date) {
        return date.getUTCDate().toString();
    },
    /**
     * @param {Date} date
     * @returns {String}
     */
    "dd": function(date) {
        return Exhibit.Formatter._DateFormatter._pad(date.getUTCDate());
    },
    
    // day of week
    /**
     * @param {Date} date
     * @returns {String}
     */
    "EEE": function(date) {
        return Exhibit._("%formatter.shortDaysOfWeek")[date.getUTCDay()];
    },
    /**
     * @param {Date} date
     * @returns {String}
     */
    "EEEE": function(date) {
        return Exhibit._("%formatter.daysOfWeek")[date.getUTCDay()];
    },
    
    // month
    /**
     * @param {Date} date
     * @returns {String}
     */
    "MM": function(date) {
        return Exhibit.Formatter._DateFormatter._pad(date.getUTCMonth() + 1);
    },
    /**
     * @param {Date} date
     * @returns {String}
     */
    "MMM": function(date) {
        return Exhibit._("%formatter.shortMonths")[date.getUTCMonth()];
    },
    /**
     * @param {Date} date
     * @returns {String}
     */
    "MMMM": function(date) {
        return Exhibit._("%formatter.months")[date.getUTCMonth()];
    },
    
    // year
    /**
     * @param {Date} date
     * @returns {String}
     */
    "yy": function(date) {
        return Exhibit.Formatter._DateFormatter._pad(date.getUTCFullYear() % 100);
    },
    /**
     * @param {Date} date
     * @returns {String}
     */
    "yyyy": function(date) {
        var y = date.getUTCFullYear();
        return y > 0 ? y.toString() : (1 - y);
    },
    
    // era
    /**
     * @param {Date} date
     * @returns {String}
     */
    "G": function(date) {
        var y = date.getUTCYear();
        return y > 0 ? Exhibit._("%formatter.commonEra") : Exhibit._("%formatter.beforeCommonEra");
    },
    
    // hours of day
    /**
     * @param {Date} date
     * @returns {String}
     */
    "HH": function(date) {
        return Exhibit.Formatter._DateFormatter._pad(date.getUTCHours());
    },
    /**
     * @param {Date} date
     * @returns {String}
     */
    "hh": function(date) {
        var h = date.getUTCHours();
        return Exhibit.Formatter._DateFormatter._pad(h === 0 ? 12 : (h > 12 ? h - 12 : h));
    },
    /**
     * @param {Date} date
     * @returns {String}
     */
    "h": function(date) {
        var h = date.getUTCHours();
        return (h === 0 ? 12 : (h > 12 ? h - 12 : h)).toString();
    },
    
    // am/pm
    /**
     * @param {Date} date
     * @returns {String}
     */
    "a": function(date) {
        return date.getUTCHours() < 12 ? Exhibit._("%formatter.beforeNoon") : Exhibit._("%formatter.afterNoon");
    },
    /**
     * @param {Date} date
     * @returns {String}
     */
    "A": function(date) {
        return date.getUTCHours() < 12 ? Exhibit._("%formatter.BeforeNoon") : Exhibit._("%formatter.AfterNoon");
    },
    
    // minutes of hour
    /**
     * @param {Date} date
     * @returns {String}
     */
    "mm": function(date) {
        return Exhibit.Formatter._DateFormatter._pad(date.getUTCMinutes());
    },
    
    // seconds of minute
    /**
     * @param {Date} date
     * @returns {String}
     */
    "ss": function(date) {
        return Exhibit.Formatter._DateFormatter._pad(date.getUTCSeconds());
    },
    
    // milliseconds of minute
    /**
     * @param {Date} date
     * @returns {String}
     */
    "S": function(date) {
        return Exhibit.Formatter._DateFormatter._pad3(date.getUTCMilliseconds());
    }
    
};

/**
 * @constant
 */
Exhibit.Formatter._constructors = {
    "number" : Exhibit.Formatter._NumberFormatter,
    "date" : Exhibit.Formatter._DateFormatter,
    "text" : Exhibit.Formatter._TextFormatter,
    "boolean" : Exhibit.Formatter._BooleanFormatter,
    "image" : Exhibit.Formatter._ImageFormatter,
    "url" : Exhibit.Formatter._URLFormatter,
    "item" : Exhibit.Formatter._ItemFormatter,
    "currency" : Exhibit.Formatter._CurrencyFormatter
};
