/**
 * @fileOverview Lens class
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 */
Exhibit.Lens = function() {
};

Exhibit.Lens._commonProperties = null;

/**
 * @param {String} itemID
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Lens.prototype._constructDefaultUI = function(itemID, div, uiContext) {
    var database, properties, label, template, dom, pairs, j, pair, tr, tdValues, m;

    database = uiContext.getDatabase();
    
    if (typeof Exhibit.Lens._commonProperties === "undefined" || Exhibit.Lens._commonProperties === null) {
        Exhibit.Lens._commonProperties = database.getAllProperties();
    }
    properties = Exhibit.Lens._commonProperties;
    
    label = database.getObject(itemID, "label");
    label = (typeof label !== "undefined" && label !== null) ? label : itemID;
    
    if (Exhibit.params.safe) {
        label = Exhibit.Formatter.encodeAngleBrackets(label);
    }
    
    template = {
        elmt:       div,
        className:  "exhibit-lens",
        children: [
            {   tag:        "div",
                className:  "exhibit-lens-title",
                title:      label,
                children:   [ 
                    label + " (",
                    {   tag:        "a",
                        href:       Exhibit.Persistence.getItemLink(itemID),
                        target:     "_blank",
                        children:   [ Exhibit._("%general.itemLinkLabel") ]
                    },
                    ")"
                ]
            },
            {   tag:        "div",
                className:  "exhibit-lens-body",
                children: [
                    {   tag:        "table",
                        className:  "exhibit-lens-properties",
                        field:      "propertiesTable"
                    }
                ]
            }
        ]
    };
    dom = $.simileDOM("template", template);
    
    $(div).attr(Exhibit.makeExhibitAttribute("itemID"), itemID);
    
    pairs = Exhibit.ViewPanel.getPropertyValuesPairs(
        itemID, properties, database);
        
    for (j = 0; j < pairs.length; j++) {
        pair = pairs[j];

        tr = $("<tr>")
            .appendTo(dom.propertiesTable);
        tr = $(dom.propertiesTable.get(0).insertRow(j))
            .attr("class", "exhibit-lens-property");
        
        $("<td>")
            .appendTo(tr)
            .attr("class", "exhibit-lens-property-name")
            .html(pair.propertyLabel + ": ");
        
        tdValues = $("<td>");
        tr.append(tdValues);
        $(tdValues).attr("class", "exhibit-lens-property-values");
        
        if (pair.valueType === "item") {
            for (m = 0; m < pair.values.length; m++) {
                if (m > 0) {
                    $(tdValues).append(document.createTextNode(", "));
                }
                $(tdValues).append(Exhibit.UI.makeItemSpan(pair.values[m], null, uiContext));
            }
        } else {
            for (m = 0; m < pair.values.length; m++) {
                if (m > 0) {
                    $(tdValues).append(document.createTextNode(", "));
                }
                $(tdValues).append(Exhibit.UI.makeValueSpan(pair.values[m], pair.valueType));
            }
        }
    }
};

/**
 * @param {String} itemID
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Lens.prototype._constructDefaultEditingUI = function(itemID, div, uiContext) {
    // TODO
};

Exhibit.Lens._compiledTemplates = {};
/**
 * @constant
 */
Exhibit.Lens._handlers = [
    "onblur", "onfocus", 
    "onkeydown", "onkeypress", "onkeyup", 
    "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onclick",
    "onresize", "onscroll"
];

/**
 * @param {String} itemID
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @param {String} lensTemplateURL
 */
Exhibit.Lens.prototype._constructFromLensTemplateURL = function(itemID, div, uiContext, lensTemplateURL) {
    var job, compiledTemplate;
    
    job = {
        lens:           this,
        itemID:         itemID,
        div:            div,
        uiContext:      uiContext,
        opts:           opts
    };
    
    compiledTemplate = Exhibit.Lens._compiledTemplates[lensTemplateURL];
    if (typeof compiledTemplate === "undefined" || compiledTemplate === null) {
        Exhibit.Lens._startCompilingTemplate(lensTemplateURL, job);
    } else if (!compiledTemplate.compiled) {
        compiledTemplate.jobs.push(job);
    } else {
        job.template = compiledTemplate;
        Exhibit.Lens._performConstructFromLensTemplateJob(job);
    }
};

/**
 * @param {String} itemID
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @param {Element} lensTemplateNode
 * @param {Object} opts
 */
Exhibit.Lens.prototype._constructFromLensTemplateDOM = function(itemID, div, uiContext, lensTemplateNode, opts) {
    var job, id, compiledTemplate;

    job = {
        lens:           this,
        itemID:         itemID,
        div:            div,
        uiContext:      uiContext,
        opts:           opts
    };
    
    id = lensTemplateNode.id;
    if (typeof id === "undefined" || id === null || id.length === 0) {
        id = "exhibitLensTemplate" + Math.floor(Math.random() * 10000);
        lensTemplateNode.id = id;
    }
    
    compiledTemplate = Exhibit.Lens._compiledTemplates[id];
    if (typeof compiledTemplate === "undefined" || compiledTemplate === null) {
        compiledTemplate = {
            url:        id,
            template:   Exhibit.Lens.compileTemplate(lensTemplateNode, false, uiContext),
            compiled:   true,
            jobs:       []
        };
        Exhibit.Lens._compiledTemplates[id] = compiledTemplate;
    }
    job.template = compiledTemplate;
    Exhibit.Lens._performConstructFromLensTemplateJob(job);
};

/**
 * @param {String} lensTemplateURL
 * @param {Object} job
 */
Exhibit.Lens._startCompilingTemplate = function(lensTemplateURL, job) {
    var compiledTemplate, fError, fDone;
    compiledTemplate = {
        url:        lensTemplateURL,
        template:   null,
        compiled:   false,
        jobs:       [ job ]
    };
    Exhibit.Lens._compiledTemplates[lensTemplateURL] = compiledTemplate;
    
    fError = function(jqxhr, textStatus, e) {
        Exhibit.Debug.log(Exhibit._("%lens.error.failedToLoad", lensTemplateURL, textStatus));
    };
    fDone = function(data, textStatus, jqxhr) {
        var i, job2;
        try {
            compiledTemplate.template = Exhibit.Lens.compileTemplate(
                data.documentElement, true, job.uiContext);
                
            compiledTemplate.compiled = true;
            
            for (i = 0; i < compiledTemplate.jobs.length; i++) {
                try {
                    job2 = compiledTemplate.jobs[i];
                    job2.template = compiledTemplate;
                    Exhibit.Lens._performConstructFromLensTemplateJob(job2);
                } catch (e1) {
                    Exhibit.Debug.exception(e1, Exhibit._("%lens.error.constructing"));
                }
            }
            compiledTemplate.jobs = null;
        } catch (e2) {
            Exhibit.Debug.exception(e2, Exhibit._("%lens.error.compilingTemplate"));
        }
    };
    
    $.ajax({
        "dataType": "xml",
        "url": lensTemplateURL,
        "error": fError,
        "success": fDone
    });

    return compiledTemplate;
};

/**
 * @param {Element} rootNode
 * @param {Boolean} isXML
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Lens.compileTemplate = function(rootNode, isXML, uiContext) {
    return Exhibit.Lens._processTemplateNode(rootNode, isXML, uiContext);
};

/**
 * @param {Element} rootNode
 * @param {Boolean} isXML
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Lens._processTemplateNode = function(node, isXML, uiContext) {
    if (node.nodeType === 1) {
        return Exhibit.Lens._processTemplateElement(node, isXML, uiContext);
    } else {
        return node.nodeValue;
    }
};

/**
 * @param {Element} elmt
 * @param {Boolean} isXML
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Lens._processTemplateElement = function(elmt, isXML, uiContext) {
    var templateNode, settings, attributes, i, attribute, name, value, style, handlers, h, handler, code, childNode;

    templateNode = {
        tag:                    elmt.tagName.toLowerCase(),
        uiContext:              uiContext,
        control:                null,
        condition:              null,
        content:                null,
        contentAttributes:      null,
        subcontentAttributes:   null,
        attributes:             [],
        styles:                 [],
        handlers:               [],
        children:               null
    };
    
    settings = {
        parseChildTextNodes: true
    };
    
    // Oddly enough, there is no jQuery substitute for this
    attributes = elmt.attributes;
    for (i = 0; i < attributes.length; i++) {    
        attribute = attributes[i];
        name = attribute.nodeName;
        value = attribute.nodeValue;
        Exhibit.Lens._processTemplateAttribute(uiContext, templateNode, settings, name, value);
    }
    
    if (!isXML && jQuery.support.noCloneEvent) {
        /*
         *  Some browsers swallow style and event handler attributes of
         *  HTML elements.  So our loop above will not catch them.
         */
         
        style = elmt.cssText;
        if (typeof style !== "undefined" && style !== null && style.length > 0) {
            Exhibit.Lens._processStyle(templateNode, value);
        }
        
        handlers = Exhibit.Lens._handlers;
        for (h = 0; h < handlers.length; h++) {
            handler = handlers[h];
            code = elmt[handler];
            if (typeof code !== "undefined" && code !== null) {
                templateNode.handlers.push({ name: handler, code: code });
            }
        }
    }
    
    childNode = elmt.firstChild;
    if (typeof childNode !== "undefined" && childNode !== null) {
        templateNode.children = [];
        while (childNode !== null) {
            if ((settings.parseChildTextNodes && childNode.nodeType === 3) || childNode.nodeType === 1) {
                templateNode.children.push(Exhibit.Lens._processTemplateNode(childNode, isXML, templateNode.uiContext));
            }
            childNode = childNode.nextSibling;
        }
    }
    return templateNode;
};

/**
 * @param {Exhibit.UIContext} uiContext
 * @param {Element} rootNode
 * @param {Object} settings
 * @param {String} name
 * @param {String} value
 */
Exhibit.Lens._processTemplateAttribute = function(uiContext, templateNode, settings, name, value) {
    var isStyle, x;

    if (typeof value === "undefined" || value === null || typeof value !== "string" || value.length === 0 || name === "contentEditable") {
        return;
    }
    if (Exhibit.isExhibitAttribute(name)) {
        name = Exhibit.extractAttributeName(name);
        if (name === "formats") {
            templateNode.uiContext = Exhibit.UIContext._createWithParent(uiContext);
            
            Exhibit.FormatParser.parseSeveral(templateNode.uiContext, value, 0, {});
        } else if (name === "onshow") {
            templateNode.attributes.push({
                name:   name,
                value:  value
            });
        } else if (name === "control") {
            templateNode.control = value;
        } else if (name === "content") {
            templateNode.content = Exhibit.ExpressionParser.parse(value);
            templateNode.attributes.push({
                name:   Exhibit.makeExhibitAttribute("content"),
                value:  value
            });
        } else if (name === "editor") {
            templateNode.attributes.push({
                name:   Exhibit.makeExhibitAttribute("editor"),
                value:  value
            });
        } else if (name === "edit") {
            templateNode.edit = value;
        } else if (name === "options") {
            templateNode.options = value;
        } else if (name === "editvalues") {
            templateNode.editValues = value;
        } else if (name === "tag") {
            /*
                This is a hack for 2 cases:
                1.  See http://simile.mit.edu/mail/ReadMsg?listName=General&msgId=22328
                2.  IE7 throws a "Not enough storage is available to complete this operation" 
                    exception if we try to access elmt.attributes on <embed> elements
            */
            templateNode.tag = value;
        } else if (name === "if-exists") {
            templateNode.condition = {
                test:       "if-exists",
                expression: Exhibit.ExpressionParser.parse(value)
            };
        } else if (name === "if") {
            templateNode.condition = {
                test:       "if",
                expression: Exhibit.ExpressionParser.parse(value)
            };
            settings.parseChildTextNodes = false;
        } else if (name === "select") {
            templateNode.condition = {
                test:       "select",
                expression: Exhibit.ExpressionParser.parse(value)
            };
        } else if (name === "case") {
            templateNode.condition = {
                test:   "case",
                value:  value
            };
            settings.parseChildTextNodes = false;
        } else {
            isStyle = false;
            x = name.indexOf("-style-content");
            if (x > 0) {
                isStyle = true;
            } else {
                x = name.indexOf("-content");
            }
            
            if (x > 0) {
                if (typeof templateNode.contentAttributes === "undefined" || templateNode.contentAttributes === null) {
                    templateNode.contentAttributes = [];
                }
                templateNode.contentAttributes.push({
                    name:       name.substr(0, x),
                    expression: Exhibit.ExpressionParser.parse(value),
                    isStyle:    isStyle
                });
            } else {
                x = name.indexOf("-style-subcontent");
                if (x > 0) {
                    isStyle = true;
                } else {
                    x = name.indexOf("-subcontent");
                }
                
                if (x > 0) {
                    if (typeof templateNode.subcontentAttributes === "undefined" || templateNode.subcontentAttributes === null) {
                        templateNode.subcontentAttributes = [];
                    }
                    templateNode.subcontentAttributes.push({
                        name:       name.substr(0, x),
                        fragments:  Exhibit.Lens._parseSubcontentAttribute(value),
                        isStyle:    isStyle
                    });
                }
            }
        }
    } else {
        if (name === "style") {
            Exhibit.Lens._processStyle(templateNode, value);
        } else if (name !== "id") {
            // Modifications to attribute names for odd casing are
            // removed, jQuery should be able to deal with it.
            // Leaving bgcolor, jQuery does not handle it - it
            // should really be a CSS style, but leaving it here
            // since CSS overrides the bgcolor attribute, and it's
            // not clear what should happen if bgcolor were moved
            // to CSS and conflicted with an existing style / not
            // worth the extra code.
            if (name === "bgcolor") {
                name = "bgColor";
            }
            
            templateNode.attributes.push({
                name:   name,
                value:  value
            });
        }
    }
};

/**
 * @param {Object} templateNode
 * @param {String} styleValue
 */
Exhibit.Lens._processStyle = function(templateNode, styleValue) {
    var styles, s, pair, n, v;
    styles = styleValue.split(";");
    for (s = 0; s < styles.length; s++) {
        pair = styles[s].split(":");
        if (pair.length > 1) {
            n = pair[0].trim();
            v = pair[1].trim();
            // Methods of dealing with cross browser style handling used
            // to live here but should be made obsolte by jQuery.
            templateNode.styles.push({ name: n, value: v });
        }
    }
};

/**
 * @param {String} value
 * @returns {Array}
 */
Exhibit.Lens._parseSubcontentAttribute = function(value) {
    var fragments, current, open, close;
    fragments = [];
    current = 0;
    while (current < value.length && (open = value.indexOf("{{", current)) >= 0) {
        close = value.indexOf("}}", open);
        if (close < 0) {
            break;
        }
        
        fragments.push(value.substring(current, open));
        fragments.push(Exhibit.ExpressionParser.parse(value.substring(open + 2, close)));
        
        current = close + 2;
    }
    if (current < value.length) {
        fragments.push(value.substr(current));
    }
    return fragments;
};

/**
 * @param {String} itemID
 * @param {Object} templateNode
 * @param {Element} parentElement
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} opts
 */
Exhibit.Lens.constructFromLensTemplate = function(itemID, templateNode, parentElmt, uiContext, opts) {
    return Exhibit.Lens._performConstructFromLensTemplateJob({
        itemID:     itemID,
        template:   { template: templateNode },
        div:        parentElmt,
        uiContext:  uiContext,
        opts:       opts
    });
};

/**
 * @param {Object} job
 * @returns {Element}
 */
Exhibit.Lens._performConstructFromLensTemplateJob = function(job) {
    var node, onshow;

    Exhibit.Lens._constructFromLensTemplateNode(
        {   "value" :   job.itemID
        },
        {   "value" :   "item"
        },
        job.template.template, 
        job.div,
        job.opts
    );

    node = $(job.div).get(0).tagName.toLowerCase() === "table" ? $(job.div).get(0).rows[$(job.div).get(0).rows.length - 1] : $(job.div).get(0).lastChild;
    $(document).trigger("onItemShow.exhibit", [job.itemID, node]);
    $(node).show();
    node.setAttribute(Exhibit.makeExhibitAttribute("itemID"), job.itemID);
    
    if (!Exhibit.params.safe) {
        onshow = Exhibit.getAttribute(node, "onshow");
        if (typeof onshow !== "undefined" && onshow !== null && onshow.length > 0) {
            try {
                (new Function(onshow)).call(node);
            } catch (e) {
                Exhibit.Debug.log(e);
            }
        }
    }
    
    //Exhibit.ToolboxWidget.createFromDOM(job.div, job.div, job.uiContext);
    return node;
};

/**
 * @param {Object} roots
 * @param {Object} rootValueTypes
 * @param {Object} templateNode
 * @param {Element} parentElmt
 * @param {Object} opts
 */
Exhibit.Lens._constructFromLensTemplateNode = function(
    roots, rootValueTypes, templateNode, parentElmt, opts
) {    
    var uiContext, database, children, i, values, lastChildTemplateNode, c, childTemplateNode, elmt, contentAttributes, attribute, value, subcontentAttributes, fragments, results, r, fragment, handlers, h, handler, itemID, a, rootValueTypes2, index, processOneValue, makeAppender;

    if (typeof templateNode === "string") {
        $(parentElmt).append(document.createTextNode(templateNode));
        return;
    }
    uiContext = templateNode.uiContext;
    database = uiContext.getDatabase();
    children = templateNode.children;
    
    function processChildren() {
        if (typeof children !== "undefined" && children !== null) {
            for (i = 0; i < children.length; i++) {
                Exhibit.Lens._constructFromLensTemplateNode(roots, rootValueTypes, children[i], elmt, opts);
            }
        }
    }
    
    if (typeof templateNode.condition !== "undefined" &&
        templateNode.condition !== null) {
        if (templateNode.condition.test === "if-exists") {
            if (!templateNode.condition.expression.testExists(
                    roots,
                    rootValueTypes,
                    "value",
                    database
                )) {
                return;
            }
        } else if (templateNode.condition.test === "if") {
            if (templateNode.condition.expression.evaluate(
                    roots,
                    rootValueTypes,
                    "value",
                    database
                ).values.contains(true)) {
                
                if (typeof children !== "undefined" && children !== null && children.length > 0) {
                    Exhibit.Lens._constructFromLensTemplateNode(
                        roots, rootValueTypes, children[0], parentElmt, opts);
                }
            } else {
                if (typeof children !== "undefined" && children !== null && children.length > 1) {
                    Exhibit.Lens._constructFromLensTemplateNode(
                        roots, rootValueTypes, children[1], parentElmt, opts);
                }
            }
            return;
        } else if (templateNode.condition.test === "select") {
            values = templateNode.condition.expression.evaluate(
                roots,
                rootValueTypes,
                "value",
                database
            ).values;
            
            if (typeof children !== "undefined" && children !== null) {
                lastChildTemplateNode = null;
                for (c = 0; c < children.length; c++) {
                    childTemplateNode = children[c];
                    if (typeof childTemplateNode.condition !== "undefined" &&
                        childTemplateNode.condition !== null && 
                        childTemplateNode.condition.test === "case") {
                        
                        if (values.contains(childTemplateNode.condition.value)) {
                            Exhibit.Lens._constructFromLensTemplateNode(
                                roots, rootValueTypes, childTemplateNode, parentElmt, opts);
                                
                            return;
                        }
                    } else if (typeof childTemplateNode !== "string") {
                        lastChildTemplateNode = childTemplateNode;
                    }
                }
            }
            
            if (typeof lastChildTemplateNode !== "undefined" &&
                lastChildTemplateNode !== null) {
                Exhibit.Lens._constructFromLensTemplateNode(
                    roots, rootValueTypes, lastChildTemplateNode, parentElmt, opts);
            }
            return;
        }
    }
    
    elmt = Exhibit.Lens._constructElmtWithAttributes(templateNode, parentElmt, database);
    if (typeof templateNode.contentAttributes !== "undefined" &&
        templateNode.contentAttributes !== null) {
        contentAttributes = templateNode.contentAttributes;
        makeAppender = function(vs) {
            return function(v) {
                vs.push(v);
            };
        };
        for (i = 0; i < contentAttributes.length; i++) {
            attribute = contentAttributes[i];
            values = [];
            
            attribute.expression.evaluate(
                roots,
                rootValueTypes,
                "value",
                database
            ).values.visit(makeAppender(values));
            
            value = values.join(";");
            if (attribute.isStyle) {
                $(elmt).css(attribute.name, value);
            } else if (Exhibit.Lens._attributeValueIsSafe(attribute.name, value)) {
                $(elmt).attr(attribute.name, value);
            }
        }
    }
    if (typeof templateNode.subcontentAttributes !== "undefined" &&
        templateNode.subcontentAttributes !== null) {
        subcontentAttributes = templateNode.subcontentAttributes;
        for (i = 0; i < subcontentAttributes.length; i++) {
            attribute = subcontentAttributes[i];
            fragments = attribute.fragments;
            results = "";
            for (r = 0; r < fragments.length; r++) {
                fragment = fragments[r];
                if (typeof fragment === "string") {
                    results += fragment;
                } else {
                    results += fragment.evaluateSingle(
                        roots,
                        rootValueTypes,
                        "value",
                        database
                    ).value;
                }
            }
            
            if (attribute.isStyle) {
                $(elmt).css(attribute.name, results);
            } else if (Exhibit.Lens._attributeValueIsSafe(attribute.name, results)) {
                $(elmt).attr(attribute.name, results);
            }
        }
    }
    
    if (!Exhibit.params.safe) {
        handlers = templateNode.handlers;
        for (h = 0; h < handlers.length; h++) {
            handler = handlers[h];
            elmt[handler.name] = handler.code;
        }
    }
    itemID = roots["value"];
    if (typeof templateNode.control !== "undefined" &&
        templateNode.control !== null) {
        switch (templateNode.control) {

        case "item-link":
            a = $("<a>")
                .html(Exhibit._("%general.itemLinkLabel"))
                .attr("href", Exhibit.Persistence.getItemLink(itemID))
                .attr("target", "_blank");
            $(elmt).append(a);
            break;
            
        case "remove-item":
            // only new items can be deleted from an exhibit
            if (!opts.disableEditWidgets && database.isNewItem(itemID)) {
                if (templateNode.tag === 'a') {
                    $(elmt).attr("href", "#");
                }
                $(elmt).bind("click", function(evt) {
                    database.removeItem(itemID);
                });
                processChildren();                
            } else {
                $(elmt).remove();
            }
            break;
            
        case "start-editing":
            if (templateNode.tag === 'a') {
                $(elmt).attr("href", '#');
            }
            
            if (opts.disableEditWidgets) {
                $(elmt).remove();
            } else if (opts.inPopup) {
                $(elmt).bind("click", function(evt) {
                    Exhibit.UI.showItemInPopup(itemID, null, uiContext, {
                        lensType: 'edit',
                        coords: opts.coords
                    });                
                });
                processChildren();
            } else {
                $(elmt).bind("click", function() {
                    uiContext.setEditMode(itemID, true);
                    $(uiContext.getCollection().getElement()).trigger("onItemsChanged");
                });
                processChildren();
            }
            break;
            
        case "stop-editing":
            if (templateNode.tag === 'a') {
                $(elmt).attr("href", '#');
            }
            if (opts.disableEditWidgets) {
                $(elmt).remove();
            } else if (opts.inPopup) {
                $(elmt).bind("click", function() {
                    Exhibit.UI.showItemInPopup(itemID, null, uiContext, {
                        lensType: 'normal',
                        coords: opts.coords
                    });
                });
                processChildren();
            } else {
                $(elmt).bind("click", function() { 
                    uiContext.setEditMode(itemID, false);
                    $(uiContext.getCollection().getElement()).trigger("onItemsChanged", []);
                });
                processChildren();
            }
            break;
            
        case "accept-changes":
            if (database.isSubmission(itemID)) {
                if (templateNode.tag === 'a') {
                    $(elmt).attr("href", '#');
                }
                $(elmt).bind("click", function() {
                    database.mergeSubmissionIntoItem(itemID);
                });
                processChildren();
            } else {
                Exhibit.Debug.warn(Exhibit._("%lens.error.misplacedAcceptChanges"));
                $(elmt).remove();
            }
            break;
        }
    } else if (typeof templateNode.content !== "undefined" &&
               templateNode.content !== null) {
        results = templateNode.content.evaluate(
            roots,
            rootValueTypes,
            "value",
            database
        );
        if (typeof children !== "undefined" && children !== null) {
            rootValueTypes2 = { "value" : results.valueType, "index" : "number" };
            index = 1;
            
            processOneValue = function(childValue) {
                var roots2 = { "value" : childValue, "index" : index++ };
                for (i = 0; i < children.length; i++) {
                    Exhibit.Lens._constructFromLensTemplateNode(
                        roots2, rootValueTypes2, children[i], elmt, opts);
                }
            };
            if (results.values instanceof Array) {
                for (i = 0; i < results.values.length; i++) {
                    processOneValue(results.values[i]);
                }
            } else {
                results.values.visit(processOneValue);
            }
        } else {
            Exhibit.Lens._constructDefaultValueList(results.values, results.valueType, elmt, templateNode.uiContext);
        }
    } else if (typeof templateNode.edit !== "undefined" &&
               templateNode.edit !== null) {
        // TODO: handle editType

        // process children first, to get access to OPTION children of SELECT elements
        processChildren();
        Exhibit.Lens._constructEditableContent(templateNode, elmt, itemID, uiContext);
    } else if (typeof children !== "undefined" && children !== null) {
        for (i = 0; i < children.length; i++) {
            Exhibit.Lens._constructFromLensTemplateNode(roots, rootValueTypes, children[i], elmt, opts);
        }
    }
};

/**
 * @param {Object} templateNode
 * @param {Element} parentElmt
 * @param {Exhibit.Database} database
 * @returns {jQuery}
 */
Exhibit.Lens._constructElmtWithAttributes = function(templateNode, parentElmt, database) {
    var elmt, a, attributes, i, attribute, styles, style;
    if (templateNode.tag === "input") {
        // IE does not allow the type of an input element to be changed,
        // so jQuery also blocks it; there used to be a hack here for just
        // IE, but it might as well be universal given the IE problem
        // affected how jQuery does it.
        a = [ "<input" ];
        attributes = templateNode.attributes;
        for (i = 0; i < attributes.length; i++) {
            attribute = attributes[i];
            if (Exhibit.Lens._attributeValueIsSafe(attribute.name, attribute.value)) {
                a.push(attribute.name + "=\"" + attribute.value + "\"");
            }
        }
        a.push("></input>");
        
        elmt = $(a.join(" "));
        $(parentElmt).append(elmt);
    } else {
        elmt = $("<" + templateNode.tag + ">");
        $(parentElmt).append(elmt);
        
        attributes = templateNode.attributes;
        for (i = 0; i < attributes.length; i++) {
            attribute = attributes[i];
            if (Exhibit.Lens._attributeValueIsSafe(attribute.name, attribute.value)) {
                try {
                    elmt.attr(attribute.name, attribute.value);
                } catch (e) {
                    // ignore; this happens on IE for attribute "type" on element "input"
                }
            }
        }
    }
    
    styles = templateNode.styles;
    for (i = 0; i < styles.length; i++) {
        style = styles[i];
        elmt.css(style.name, style.value);
    }
    return elmt;
};

/**
 * @param {Object} templateNode
 * @param {Element} parentElmt
 * @param {Exhibit.Database} database
 * @returns {jQuery}
 */
Exhibit.Lens._constructEditableContent = function(templateNode, elmt, itemID, uiContext) {
    var db, attr, itemValue, changeHandler;
    db = uiContext.getDatabase();
    attr = templateNode.edit.replace('.', '');
    
    itemValue = db.getObject(itemID, attr);
    changeHandler = function() {
        if (this.value && this.value !== itemValue) {
            db.editItem(itemID, attr, this.value);
        }
    };
    
    if (templateNode.tag === 'select') {
        Exhibit.Lens._constructEditableSelect(templateNode, elmt, itemID, uiContext, itemValue);
        $(elmt).bind("blur", changeHandler);
    } else {
        $(elmt).attr("value", itemValue);
        $(elmt).bind("change", changeHandler);
    }
};

/**
 * @param {Object} select
 * @param {Array} select.options
 * @param {String} select.options.text
 * @param {String} select.options.value
 * @param {String} text
 * @returns {Boolean}
 */
Exhibit.Lens.doesSelectContain = function(select, text) {
    var i, opt;
    for (i in select.options) {
        if (select.options.hasOwnProperty(i)) {
            opt = select.options[i];
            if (opt.text === text || opt.value === text) {
                return true;
            }
        }
    }
    return false;
};

// helper function to handle special-case rules for editable select tags
/**
 * @param {Object} templateNode
 * @param {Element} elmt
 * @param {String} itemID
 * @param {Exhibit.UIContext} uiContext
 * @param {String} itemValue
 */
Exhibit.Lens._constructEditableSelect = function(templateNode, elmt, itemID, uiContext, itemValue) {
    var expr, allItems, results, sortedResults, i, optText, newOption;
    if (templateNode.options) {
        expr = Exhibit.ExpressionParser.parse(templateNode.options);
        allItems = uiContext.getDatabase().getAllItems();
        results = expr.evaluate({'value': allItems}, {value: 'item'}, 'value', uiContext.getDatabase());
        sortedResults = results.values.toArray().sort();
        
        for (i in sortedResults) {
            if (sortedResults.hasOwnProperty(i)) {
                optText = sortedResults[i];
                if (!Exhibit.Lens.doesSelectContain(elmt, optText)) {
                    newOption = new Option(sortedResults[i], sortedResults[i]);
                    elmt.add(newOption, null);
                }
            }
        }
    }
    
    if (!itemValue) {
        if (!Exhibit.Lens.doesSelectContain(elmt, '')) {
            newOption = new Option("", "", true);
            elmt.add(newOption, elmt.options[0]);
        }
    } else {
        for (i in elmt.options) {
            if (elmt.options.hasOwnProperty(i) && elmt.options[i].value === itemValue) {
                elmt.selectedIndex = i;
            }
        }   
    }
};

/**
 * @param {Exhibit.Set} values
 * @param {String} valueType
 * @param {Element} parentElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Lens._constructDefaultValueList = function(values, valueType, parentElmt, uiContext) {
    uiContext.formatList(values, values.size(), valueType, function(elmt) {
        $(parentElmt).append($(elmt));
    });
};

/**
 * @param {String} name
 * @param {String} value
 * @returns {Boolean}
 */
Exhibit.Lens._attributeValueIsSafe = function(name, value) {
    if (Exhibit.params.safe) {
        if ((name === "href" && value.startsWith("javascript:")) ||
            (name.startsWith("on"))) {
            return false;
        }
    }
    return true;
};
