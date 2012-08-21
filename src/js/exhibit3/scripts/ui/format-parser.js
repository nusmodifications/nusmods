/**
 * @fileOverview Format parsing
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.FormatParser = {};

/**
 * @constant
 */
Exhibit.FormatParser._valueTypes = {
    "list" : true,
    "number" : true,
    "date" : true,
    "item" : true,
    "text" : true,
    "url" : true,
    "image" : true,
    "currency" : true
};

/**
 * @static
 * @param {Exhibit.UIContext} uiContext
 * @param {String} s
 * @param {Number} startIndex
 * @param {Object} results
 * @returns {Number}
 */
Exhibit.FormatParser.parse = function(uiContext, s, startIndex, results) {
    startIndex = startIndex || 0;
    results = results || {};
    
    var scanner = new Exhibit.FormatScanner(s, startIndex);
    try {
        return Exhibit.FormatParser._internalParse(uiContext, scanner, results, false);
    } finally {
        results.index = scanner.token() !== null ? scanner.token().start : scanner.index();
    }
};

/**
 * @param {Exhibit.UIContext} uiContext
 * @param {String} s
 * @param {Number} startIndex
 * @param {Object} results
 * @returns {Number}
 */ 
Exhibit.FormatParser.parseSeveral = function(uiContext, s, startIndex, results) {
    startIndex = startIndex || 0;
    results = results || {};
    
    var scanner = new Exhibit.FormatScanner(s, startIndex);
    try {
        return Exhibit.FormatParser._internalParse(uiContext, scanner, results, true);
    } finally {
        results.index = scanner.token() !== null ? scanner.token().start : scanner.index();
    }
};

/**
 * @param {Exhibit.UIContext} uiContext
 * @param {Exhibit.FormatScanner} scanner
 * @param {Object} results
 * @param {Boolean} several
 * @returns {}
 */
Exhibit.FormatParser._internalParse = function(uiContext, scanner, results, several) {
    var Scanner, token, next, makePosition, enterSetting, checkKeywords, parseNumber, parseInteger, parseNonnegativeInteger, parseString, parseURL, parseExpression, parseExpressionOrString, parseChoices, parseFlags, parseSetting, parseSettingList, parseRule, parseRuleList;
    Scanner = Exhibit.FormatScanner;
    token = scanner.token();
    next = function() { scanner.next(); token = scanner.token(); };
    makePosition = function() {
        return token !== null ?
            token.start :
            scanner.index();
    };
    enterSetting = function(valueType, settingName, value) {
        uiContext.putSetting("format/" + valueType + "/" + settingName, value);
    };
    checkKeywords = function(valueType, settingName, keywords) {
        if (token !== null &&
            token.type !== Scanner.IDENTIFIER &&
            typeof keywords[token.value] !== "undefined") {
            enterSetting(valueType, settingName, keywords[token.value]);
            next();
            return false;
        }
        return true;
    };
    
    parseNumber = function(valueType, settingName, keywords) {
        if (checkKeywords(valueType, settingName, keywords)) {
            if (typeof token === "undefined" || token === null || token.type !== Scanner.NUMBER) {
                throw new Error(Exhibit._("%format.error.missingNumber", makePosition()));
            }
            enterSetting(valueType, settingName, token.value);
            next();
        }
    };
    parseInteger = function(valueType, settingName, keywords) {
        if (checkKeywords(valueType, settingName, keywords)) {
            if (typeof token === "undefined" || token === null || token.type !== Scanner.NUMBER) {
                throw new Error(Exhibit._("%format.error.missingInteger", makePosition()));
            }
            enterSetting(valueType, settingName, Math.round(token.value));
            next();
        }
    };
    parseNonnegativeInteger = function(valueType, settingName, keywords) {
        if (checkKeywords(valueType, settingName, keywords)) {
            if (typeof token === "undefined" || token === null || token.type !== Scanner.NUMBER || token.value < 0) {
                throw new Error(Exhibit._("%format.error.missingNonNegativeInteger",  makePosition()));
            }
            enterSetting(valueType, settingName, Math.round(token.value));
            next();
        }
    };
    parseString = function(valueType, settingName, keywords) {
        if (checkKeywords(valueType, settingName, keywords)) {
            if (typeof token === "undefined" || token === null || token.type !== Scanner.STRING) {
                throw new Error(Exhibit._("%format.error.missingString", makePosition()));
            }
            enterSetting(valueType, settingName, token.value);
            next();
        }
    };
    parseURL = function(valueType, settingName, keywords) {
        if (checkKeywords(valueType, settingName, keywords)) {
            if (typeof token === "undefined" || token === null || token.type !== Scanner.URL) {
                throw new Error(Exhibit._("%format.error.missingURL", makePosition()));
            }
            enterSetting(valueType, settingName, token.value);
            next();
        }
    };
    parseExpression = function(valueType, settingName, keywords) {
        if (checkKeywords(valueType, settingName, keywords)) {
            if (typeof token === "undefined" || token === null || token.type !== Scanner.EXPRESSION) {
                throw new Error(Exhibit._("%format.error.missingExpression", makePosition()));
            }
            enterSetting(valueType, settingName, token.value);
            next();
        }
    };
    parseExpressionOrString = function(valueType, settingName, keywords) {
        if (checkKeywords(valueType, settingName, keywords)) {
            if (typeof token === "undefined" || token === null || (token.type !== Scanner.EXPRESSION && token.type !== Scanner.STRING)) {
                throw new Error(Exhibit._("%format.error.missingExpressionOrString", makePosition()));
            }
            enterSetting(valueType, settingName, token.value);
            next();
        }
    };
    parseChoices = function(valueType, settingName, choices) {
        var i;
        if (typeof token === "undefined" || token === null || token.type !== Scanner.IDENTIFIER) {
            throw new Error(Exhibit._("%format.error.missingOption", makePosition()));
        }
        for (i = 0; i < choices.length; i++) {
            if (token.value === choices[i]) {
                enterSetting(valueType, settingName, token.value);
                next();
                return;
            }
        }
        throw new Error(Exhibit._("%format.error.unsupportedOption", token.value, settingName, valueType, makePosition()));
    };
    parseFlags = function(valueType, settingName, flags, counterFlags) {
        var i, flagSet, counterFlagSet;
        while (token !== null && token.type === Scanner.IDENTIFIER) {
            flagSet = false;
            counterFlagSet = false;
            for (i = 0; i < flags.length && !flagSet; i++) {
                if (token.value === flags[i]) {
                    enterSetting(valueType, settingName + "/" + token.value, true);
                    next();
                    flagSet = true;
                }
            }
            if (!flagSet && typeof counterFlags[token.value] !== "undefined") {
                enterSetting(valueType, settingName + "/" + counterFlags[token.value], false);
                next();
                counterFlagSet = true;
            }
            if (!counterFlagSet) {
                throw new Error(Exhibit._("%format.error.unsupportedFlag", token.value, settingName, valueType, makePosition()));
            }
        }
    };
    
    parseSetting = function(valueType, settingName) {
        switch (valueType) {
        case "number":
            switch (settingName) {
            case "decimal-digits":
                parseNonnegativeInteger(valueType, settingName, { "default": -1 });
                return;
            }
            break;
        case "date":
            switch (settingName) {
            case "time-zone":
                parseNumber(valueType, settingName, { "default" : null });
                return;
            case "show":
                parseChoices(valueType, settingName, [ "date", "time", "date-time" ]);
                return;
            case "mode":
                parseChoices(valueType, settingName, [ "short", "medium", "long", "full" ]);
                enterSetting(valueType, "template", null); // mode and template are exclusive
                return;
            case "template":
                parseString(valueType, settingName, {});
                enterSetting(valueType, "mode", null); // mode and template are exclusive
                return;
            }
            break;
        case "boolean":
            break;
        case "text":
            switch (settingName) {
            case "max-length":
                parseInteger(valueType, settingName, { "none" : 0 });
                return;
            }
            break;
        case "image":
            switch (settingName) {
            case "tooltip":
                parseExpressionOrString(valueType, settingName, { "none" : null });
                return;
            case "max-width":
            case "max-height":
                parseInteger(valueType, settingName, { "none" : -1 });
                return;
            }
            break;
        case "url":
            switch (settingName) {
            case "target":
                parseString(valueType, settingName, { "none" : null });
                return;
            case "external-icon":
                parseURL(valueType, settingName, { "none" : null });
                return;
            }
            break;
        case "item":
            switch (settingName) {
            case "title":
                parseExpression(valueType, settingName, { "default" : null });
                return;
            }
            break;
        case "currency":
            switch (settingName) {
            case "negative-format":
                parseFlags(valueType, settingName, 
                    [ "red", "parentheses", "signed" ], 
                    { "unsigned" : "signed", "no-parenthesis" : "parentheses", "black" : "red" }
                );
                return;
            case "symbol":
                parseString(valueType, settingName, { "default" : "$", "none" : null });
                return;
            case "symbol-placement":
                parseChoices(valueType, settingName, [ "first", "last", "after-sign" ]);
                return;
            case "decimal-digits":
                parseNonnegativeInteger(valueType, settingName, { "default" : -1 });
                return;
            }
            break;
        case "list":
            switch (settingName) {
            case "separator":
            case "last-separator":
            case "pair-separator":
            case "empty-text":
                parseString(valueType, settingName, {});
                return;
            }
            break;
        }
        throw new Error(Exhibit._("%format.error.unsupportedSetting", settingName, valueType, makePosition()));
    };
    parseSettingList = function(valueType) {

        while (token !== null && token.type === Scanner.IDENTIFIER) {
            var settingName = token.value;

            next();
            

            if (typeof token === "undefined" || token === null || token.type !== Scanner.DELIMITER || token.value !== ":") {
                throw new Error(Exhibit._("%format.error.missingColon", makePosition()));
            }
            next();
            
            parseSetting(valueType, settingName);
            

            if (typeof token === "undefined" || token === null || token.type !== Scanner.DELIMITER || token.value !== ";") {
                break;
            } else {
                next();
            }
        }

    };
    parseRule = function() {
        if (typeof token === "undefined" || token === null || token.type !== Scanner.IDENTIFIER) {
            throw new Error(Exhibit._("%format.error.missingValueType", makePosition()));
        }
        
        var valueType = token.value;
        if (typeof Exhibit.FormatParser._valueTypes[valueType] === "undefined") {
            throw new Error(Exhibit._("%format.error.unsupportedValueType", valueType, makePosition()));
        }
        next();
        
        if (token !== null && token.type === Scanner.DELIMITER && token.value === "{") {
            next();
            parseSettingList(valueType);
            
            if (typeof token === "undefined" || token === null || token.type !== Scanner.DELIMITER || token.value !== "}") {
                throw new Error(Exhibit._("%format.error.missingBrace", makePosition()));
            }
            next();
        }
        return valueType;
    };
    parseRuleList = function() {
        var valueType = "text";
        while (token !== null && token.type === Scanner.IDENTIFIER) {
            valueType = parseRule();
        }
        return valueType;
    };
    
    if (several) {
        return parseRuleList();
    } else {
        return parseRule();
    }
};

/**
 * @class
 * @constructor
 * @param {String} text
 * @param {Number} startIndex
 */
Exhibit.FormatScanner = function(text, startIndex) {
    this._text = text + " "; // make it easier to parse
    this._maxIndex = text.length;
    this._index = startIndex;
    this.next();
};

/**
 * @constant
 */
Exhibit.FormatScanner.DELIMITER     = 0;
/**
 * @constant
 */
Exhibit.FormatScanner.NUMBER        = 1;
/**
 * @constant
 */
Exhibit.FormatScanner.STRING        = 2;
/**
 * @constant
 */
Exhibit.FormatScanner.IDENTIFIER    = 3;
/**
 * @constant
 */
Exhibit.FormatScanner.URL           = 4;
/**
 * @constant
 */
Exhibit.FormatScanner.EXPRESSION    = 5;
/**
 * @constant
 */
Exhibit.FormatScanner.COLOR         = 6;

/**
 * @returns {Object}
 */
Exhibit.FormatScanner.prototype.token = function() {
    return this._token;
};

/**
 * @returns {Number}
 */
Exhibit.FormatScanner.prototype.index = function() {
    return this._index;
};

/**
 *
 */
Exhibit.FormatScanner.prototype.next = function() {
    this._token = null;

    var self, skipSpaces, i, c1, c2, identifier, openParen, closeParen, j, o, expression;
    
    self = this;
    skipSpaces = function(x) {
        while (x < self._maxIndex &&
            " \t\r\n".indexOf(self._text.charAt(x)) >= 0) {
            
            x++;
        }
        return x;
    };
    this._index = skipSpaces(this._index);
    
    if (this._index < this._maxIndex) {
        c1 = this._text.charAt(this._index);
        c2 = this._text.charAt(this._index + 1);
        
        if ("{}(),:;".indexOf(c1) >= 0) {
            this._token = {
                type:   Exhibit.FormatScanner.DELIMITER,
                value:  c1,
                start:  this._index,
                end:    this._index + 1
            };
            this._index++;
        } else if ("\"'".indexOf(c1) >= 0) { // quoted strings
            i = this._index + 1;
            while (i < this._maxIndex) {
                if (this._text.charAt(i) === c1 && this._text.charAt(i - 1) !== "\\") {
                    break;
                }
                i++;
            }
            
            if (i < this._maxIndex) {
                this._token = {
                    type:   Exhibit.FormatScanner.STRING,
                    value:  this._text.substring(this._index + 1, i).replace(/\\'/g, "'").replace(/\\"/g, '"'),
                    start:  this._index,
                    end:    i + 1
                };
                this._index = i + 1;
            } else {
                throw new Error(Exhibit._("%format.error.unterminatedString", this._index));
            }
        } else if (c1 === "#") { // color
            i = this._index + 1;
            while (i < this._maxIndex && this._isHexDigit(this._text.charAt(i))) {
                i++;
            }
            
            this._token = {
                type:   Exhibit.FormatScanner.COLOR,
                value:  this._text.substring(this._index, i),
                start:  this._index,
                end:    i
            };
            this._index = i;
        } else if (this._isDigit(c1)) { // number
            i = this._index;
            while (i < this._maxIndex && this._isDigit(this._text.charAt(i))) {
                i++;
            }
            
            if (i < this._maxIndex && this._text.charAt(i) === ".") {
                i++;
                while (i < this._maxIndex && this._isDigit(this._text.charAt(i))) {
                    i++;
                }
            }
            
            this._token = {
                type:   Exhibit.FormatScanner.NUMBER,
                value:  parseFloat(this._text.substring(this._index, i)),
                start:  this._index,
                end:    i
            };
            this._index = i;
        } else { // identifier
            i = this._index;
            while (i < this._maxIndex) {
                j = this._text.substr(i).search(/\W/);
                if (j > 0) {
                    i += j;
                } else if ("-".indexOf(this._text.charAt(i)) >= 0) {
                    i++;
                } else {
                    break;
                }
            }
            
            identifier = this._text.substring(this._index, i);
            if (identifier === "url") {
                openParen = skipSpaces(i);
                if (this._text.charAt(openParen) === "(") {
                    closeParen = this._text.indexOf(")", openParen);
                    if (closeParen > 0) {
                        this._token = {
                            type:   Exhibit.FormatScanner.URL,
                            value:  this._text.substring(openParen + 1, closeParen),
                            start:  this._index,
                            end:    closeParen + 1
                        };
                        this._index = closeParen + 1;
                    } else {
                        throw new Error(Exhibit._("%format.error.missingCloseURL", this._index));
                    }
                }
            } else if (identifier === "expression") {
                openParen = skipSpaces(i);
                if (this._text.charAt(openParen) === "(") {
                    o = {};
                    expression = Exhibit.ExpressionParser.parse(this._text, openParen + 1, o);
                    
                    closeParen = skipSpaces(o.index);
                    if (this._text.charAt(closeParen) === ")") {
                        this._token = {
                            type:   Exhibit.FormatScanner.EXPRESSION,
                            value:  expression,
                            start:  this._index,
                            end:    closeParen + 1
                        };
                        this._index = closeParen + 1;
                    } else {
                        throw new Error("Missing ) to close expression at " + o.index);
                    }
                }
            } else {
                this._token = {
                    type:   Exhibit.FormatScanner.IDENTIFIER,
                    value:  identifier,
                    start:  this._index,
                    end:    i
                };
                this._index = i;
            }
        }
    }
};

/**
 * @param {String} c
 * @returns {Boolean}
 */
Exhibit.FormatScanner.prototype._isDigit = function(c) {
    return "0123456789".indexOf(c) >= 0;
};

/**
 * @param {String} c
 * @returns {Boolean}
 */
Exhibit.FormatScanner.prototype._isHexDigit = function(c) {
    return "0123456789abcdefABCDEF".indexOf(c) >= 0;
};
