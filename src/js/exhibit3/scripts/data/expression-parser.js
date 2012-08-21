/**
 * @fileOverview All classes and support methods for parsing queries.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.ExpressionParser = {};

/**
 * @static
 * @param {String} s
 * @param {Number} startIndex
 * @param {Object} results
 * @returns {Exhibit.Expression._Impl}
 */
Exhibit.ExpressionParser.parse = function(s, startIndex, results) {
    startIndex = startIndex || 0;
    results = results || {};
    
    var scanner = new Exhibit.ExpressionScanner(s, startIndex);
    try {
        return Exhibit.ExpressionParser._internalParse(scanner, false);
    } finally {
        results.index = scanner.token() !== null ? scanner.token().start : scanner.index();
    }
};

/**
 * @static
 * @param {String} s
 * @param {Number} startIndex
 * @param {Object} results
 * @returns {Array}
 */
Exhibit.ExpressionParser.parseSeveral = function(s, startIndex, results) {
    startIndex = startIndex || 0;
    results = results || {};
    
    var scanner = new Exhibit.ExpressionScanner(s, startIndex);
    try {
        return Exhibit.ExpressionParser._internalParse(scanner, true);
    } finally {
        results.index = scanner.token() !== null ? scanner.token().start : scanner.index();
    }
};

/**
 * @static
 * @param {Exhibit.ExpressionScanner} scanner
 * @param {Boolean} several
 * @returns {Exhibit.Expression._Impl|Array}
 */
Exhibit.ExpressionParser._internalParse = function(scanner, several) {
    var Scanner, token, next, makePosition, parsePath, parseFactor, parseTerm, parseSubExpression, parseExpresion, parseExpressionList, roots, expressions, r;
    Scanner = Exhibit.ExpressionScanner;
    token = scanner.token();
    next = function() { scanner.next(); token = scanner.token(); };
    makePosition = function() { return token !== null ? token.start : scanner.index(); };
    
    parsePath = function() {
        var path = new Exhibit.Expression.Path(), hopOperator;
        while (token !== null && token.type === Scanner.PATH_OPERATOR) {
            hopOperator = token.value;
            next();
            
            if (token !== null && token.type === Scanner.IDENTIFIER) {
                path.appendSegment(token.value, hopOperator);
                next();

            } else {
                throw new Error(Exhibit._("%expression.error.missingPropertyID", makePosition()));
            }
        }
        return path;
    };
    parseFactor = function() {
        var result = null, identifier, args;
        if (typeof token === "undefined" || token === null) {
            throw new Error(Exhibit._("%expression.error.missingFactor"));
        }
        
        switch (token.type) {
        case Scanner.NUMBER:
            result = new Exhibit.Expression._Constant(token.value, "number");
            next();
            break;
        case Scanner.STRING:
            result = new Exhibit.Expression._Constant(token.value, "text");
            next();
            break;
        case Scanner.PATH_OPERATOR:
            result = parsePath();
            break;
        case Scanner.IDENTIFIER:
            identifier = token.value;
            next();
            
            if (typeof Exhibit.Controls[identifier] !== "undefined") {
                if (token !== null && token.type === Scanner.DELIMITER && token.value === "(") {
                    next();
                    
                    args = (token !== null && token.type === Scanner.DELIMITER && token.value === ")") ? 
                        [] :
                        parseExpressionList();
                        
                    result = new Exhibit.Expression._ControlCall(identifier, args);
                    
                    if (token !== null && token.type === Scanner.DELIMITER && token.value === ")") {
                        next();
                    } else {
                        throw new Error(Exhibit._("%expression.error.missingParenEnd", identifier, makePosition()));
                    }
                } else {
                    throw new Error(Exhibit._("%expression.error.missingParenStart", identifier, makePosition()));
                }
            } else {
                if (token !== null && token.type === Scanner.DELIMITER && token.value === "(") {
                    next();
                    
                    args = (token !== null && token.type === Scanner.DELIMITER && token.value === ")") ? 
                        [] :
                        parseExpressionList();
                        
                    result = new Exhibit.Expression._FunctionCall(identifier, args);
                    
                    if (token !== null && token.type === Scanner.DELIMITER && token.value === ")") {
                        next();
                    } else {
                        throw new Error(Exhibit._("%expression.error.missingParenFunction", identifier, makePosition()));
                    }
                } else {
                    result = parsePath();
                    result.setRootName(identifier);
                }
            }
            break;
        case Scanner.DELIMITER:
            if (token.value === "(") {
                next();
                
                result = parseExpression();
                if (token !== null && token.type === Scanner.DELIMITER && token.value === ")") {
                    next();
                    break;
                } else {
                    throw new Error(Exhibit._("%expression.error.missingParen", + makePosition()));
                }
            } else {
                throw new Error(Exhibit._("%expression.error.unexpectedSyntax", token.value, makePosition()));
            }
        default:
            throw new Error(Exhibit._("%expression.error.unexpectedSyntax", token.value, makePosition()));
        }
        
        return result;
    };
    parseTerm = function() {
        var term = parseFactor(), operator;
        while (token !== null && token.type === Scanner.OPERATOR && 
            (token.value === "*" || token.value === "/")) {
            operator = token.value;
            next();
            
            term = new Exhibit.Expression._Operator(operator, [ term, parseFactor() ]);
        }
        return term;
    };
    parseSubExpression = function() {
        var subExpression = parseTerm(), operator;
        while (token !== null && token.type === Scanner.OPERATOR && 
            (token.value === "+" || token.value === "-")) {
            
            operator = token.value;
            next();
            
            subExpression = new Exhibit.Expression._Operator(operator, [ subExpression, parseTerm() ]);
        }
        return subExpression;
    };
    parseExpression = function() {
        var expression = parseSubExpression(), operator;
        while (token !== null && token.type === Scanner.OPERATOR && 
            (token.value === "=" || token.value === "<>" || 
             token.value === "<" || token.value === "<=" || 
             token.value === ">" || token.value === ">=")) {
            
            operator = token.value;
            next();
            
            expression = new Exhibit.Expression._Operator(operator, [ expression, parseSubExpression() ]);
        }
        return expression;
    };
    parseExpressionList = function() {
        var expressions = [ parseExpression() ];
        while (token !== null && token.type === Scanner.DELIMITER && token.value === ",") {
            next();
            expressions.push(parseExpression());
        }
        return expressions;
    };
    
    if (several) {
        roots = parseExpressionList();
        expressions = [];
        for (r = 0; r < roots.length; r++) {
            expressions.push(new Exhibit.Expression._Impl(roots[r]));
        }
        return expressions;
    } else {
        return new Exhibit.Expression._Impl(parseExpression());
    }
};

/**
 * @class 
 * @constructor
 * @param {String} text
 * @param {Number} startIndex
 */
Exhibit.ExpressionScanner = function(text, startIndex) {
    this._text = text + " "; // make it easier to parse
    this._maxIndex = text.length;
    this._index = startIndex;
    this.next();
};

/** @constant */
Exhibit.ExpressionScanner.DELIMITER     = 0;
/** @constant */
Exhibit.ExpressionScanner.NUMBER        = 1;
/** @constant */
Exhibit.ExpressionScanner.STRING        = 2;
/** @constant */
Exhibit.ExpressionScanner.IDENTIFIER    = 3;
/** @constant */
Exhibit.ExpressionScanner.OPERATOR      = 4;
/** @constant */
Exhibit.ExpressionScanner.PATH_OPERATOR = 5;

/**
 * @returns {Object}
 */
Exhibit.ExpressionScanner.prototype.token = function() {
    return this._token;
};

/**
 * @returns {Number}
 */
Exhibit.ExpressionScanner.prototype.index = function() {
    return this._index;
};

/**
 * @throws Error
 */
Exhibit.ExpressionScanner.prototype.next = function() {
    var c1, c2, i, c;
    this._token = null;
    
    while (this._index < this._maxIndex &&
        " \t\r\n".indexOf(this._text.charAt(this._index)) >= 0) {
        this._index++;
    }
    
    if (this._index < this._maxIndex) {
        c1 = this._text.charAt(this._index);
        c2 = this._text.charAt(this._index + 1);
        
        if (".!".indexOf(c1) >= 0) {
            if (c2 === "@") {
                this._token = {
                    type:   Exhibit.ExpressionScanner.PATH_OPERATOR,
                    value:  c1 + c2,
                    start:  this._index,
                    end:    this._index + 2
                };
                this._index += 2;
            } else {
                this._token = {
                    type:   Exhibit.ExpressionScanner.PATH_OPERATOR,
                    value:  c1,
                    start:  this._index,
                    end:    this._index + 1
                };
                this._index++;
            }
        } else if ("<>".indexOf(c1) >= 0) {
            if ((c2 === "=") || ("<>".indexOf(c2) >= 0 && c1 !== c2)) {
                this._token = {
                    type:   Exhibit.ExpressionScanner.OPERATOR,
                    value:  c1 + c2,
                    start:  this._index,
                    end:    this._index + 2
                };
                this._index += 2;
            } else {
                this._token = {
                    type:   Exhibit.ExpressionScanner.OPERATOR,
                    value:  c1,
                    start:  this._index,
                    end:    this._index + 1
                };
                this._index++;
            }
        } else if ("+-*/=".indexOf(c1) >= 0) {
            this._token = {
                type:   Exhibit.ExpressionScanner.OPERATOR,
                value:  c1,
                start:  this._index,
                end:    this._index + 1
            };
            this._index++;
        } else if ("(),".indexOf(c1) >= 0) {
            this._token = {
                type:   Exhibit.ExpressionScanner.DELIMITER,
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
                    type:   Exhibit.ExpressionScanner.STRING,
                    value:  this._text.substring(this._index + 1, i).replace(/\\'/g, "'").replace(/\\"/g, '"'),
                    start:  this._index,
                    end:    i + 1
                };
                this._index = i + 1;
            } else {
                throw new Error(Exhibit._("%expression.error.unterminatedString", + this._index));
            }
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
                type:   Exhibit.ExpressionScanner.NUMBER,
                value:  parseFloat(this._text.substring(this._index, i)),
                start:  this._index,
                end:    i
            };
            this._index = i;
        } else { // identifier
            i = this._index;
            while (i < this._maxIndex) {
                c = this._text.charAt(i);
                if ("(),.!@ \t".indexOf(c) < 0) {
                    i++;
                } else {
                    break;
                }
            }
            this._token = {
                type:   Exhibit.ExpressionScanner.IDENTIFIER,
                value:  this._text.substring(this._index, i),
                start:  this._index,
                end:    i
            };
            this._index = i;
        }
    }
};

/**
 * @private
 * @static
 * @param {String} c
 * @returns {Boolean}
 */
Exhibit.ExpressionScanner.prototype._isDigit = function(c) {
    return "0123456789".indexOf(c) >= 0;
};
