/**
 * @fileOverview jQuery 1.6+ plugin for DOM templating and pre-rendering.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

(function($){
    var methods = {
        /**
         * Locate and return the deepest element at the coordinates provided,
         * avoiding any Element and its children in the except Array.
         * 
         * @param {Number} x Horizontal position on the page from the left.
         * @param {Number} y Vertical position on the page from the top.
         * @param {Array} except Elements to discount during discovery.
         * @returns {Element}
         */
        "hit": function(x, y, except) {
            return methods._hit(document.body, x, y, except);
        },

        /**
         * Helper method for hit.
         *
         * @param {jQuery|Element} elmt
         * @param {Number} x
         * @param {Number} y
         * @param {Array} except
         * @returns {Element}
         */
        "_hit": function(elmt, x, y, except) {
            var hitNode = null;
            $(elmt).children().each(function(idx, el) {
                var i, top, left, node, offset;
                for (i = 0; i < except.length; i++) {
                    if (this === except[i]) {
                        return true; // move past this iteration of each
                    }
                }

                if ($(this).width() === 0 && $(this).height() === 0) {
                    /*
                     *  Sometimes SPAN elements have zero width and height but
                     *  they have children like DIVs that cover non-zero areas.
                     */
                    hitNode = methods._hit(this, x, y, except);
                    if (hitNode !== this) {
                        return false;
                    }
                } else {
                    top = 0;
                    left = 0;
                    node = this;

                    while (node) {
                        offset = $(node).offset();
                        top += offset.top;
                        left += offset.left;
                        node = $(node).offsetParent().get(0);
                    }
                    
                    if (left <= x &&
                        top <=y &&
                        (x - left) < $(this).width() &&
                        (y - top) < $(this).height()) {
                        hitNode = methods._hit(this, x, y, except);
                        return false;
                    } else if (this.nodeType === 1 && this.tagName === "TR") {
                        hitNode = methods._hit(this, x, y, except);
                        if (hitNode !== this) {
                            return false;
                        }
                    }
                }
            });
            return hitNode;
        },

        /**
         * Generates an object containing a pointer to the element
         * created from the template.  The argument object passed in
         * may contain properties including any of: elmt, tag, field,
         * children, and any DOM attribute.  Attributes specifically
         * named will not be inserted as DOM attributes, all others
         * will.  elmt is an existing DOM element, tag is the name of
         * an element to create, field set the result field named by
         * the field's value to the value of the created element, and
         * children loops through an array of argument objects to create
         * further child elements of the eventual result.
         *
         * One of elmt or tag properties must exist to get a non-null element
         * in the result, which is an object of the form { elmt: Element }.
         *
         * @param {Object} template The object described above.
         * @returns {Object} Result described above.
         */
        "template": function(template) {
            var result = {};
            result.elmt = methods._fromTemplate(template, result, null);
            return result;
        },

        /**
         * Helper function for template.
         *
         * @param {Object} templateNode
         * @param {Object} result
         * @param {Element} parentElmt
         */
        "_fromTemplate": function(templateNode, result, parentElmt) {
            var node, elmt, attribute, value, i, tag;
            if (typeof templateNode !== "undefined") {
                if (templateNode === null) {
                    return null;
                } else if (typeof templateNode !== "object") {
                    node = document.createTextNode(templateNode);
                    if (typeof parentElmt !== "undefined" &&
                        parentElmt !== null) {
                        $(parentElmt).append(node);
                    }
                    return node;
                } else {
                    elmt = null;
                    if (templateNode.hasOwnProperty("tag")) {
                        tag = templateNode.tag;
                        if (tag === "input") {
                            elmt = $("<input type=\"" + templateNode.type + "\" />");
                        } else {
                            elmt = $("<" + tag + ">");
                        }
                        if (typeof parentElmt !== "undefined" &&
                            parentElmt !== null) {
                            $(parentElmt).append(elmt);
                        }
                    } else {
                        elmt = $(templateNode.elmt);
                        if (typeof parentElmt !== "undefined" &&
                            parentElmt !== null) {
                            $(parentElmt).append(elmt);
                        }
                    }

                    for (attribute in templateNode) {
                        if (templateNode.hasOwnProperty(attribute)) {
                            value = templateNode[attribute];

                            if (attribute === "field") {
                                result[value] = elmt;
                            } else if (attribute === "type" &&
                                       elmt.get(0).tagName === "input") {
                                // do nothing
                            } else if (attribute === "children") {
                                for (i = 0; i < value.length; i++) {
                                    methods._fromTemplate(value[i], result, elmt);
                                }
                            } else if (attribute !== "tag" &&
                                       attribute !== "elmt") {
                                elmt.attr(attribute, value);
                            }
                        }
                    }
                    return elmt;
                }
            }
        },

        /**
         * Like template, but create based on a string containing the
         * HTML to create.
         *
         * @see template
         * @param {String|Element} root Base element to insert HTML into,
         *    either an existing element or the container tag.
         * @param {String} s HTML in a string to insert into container.
         * @param {Object} fieldElmts Mapping HTML id attributes to Elements
         *    that should substitute for existing Elements that currently
         *    hold the id.
         * @returns {Object} The generated object with DOM tree pointers.
         */
        "string": function(root, s, fieldElmts) {
            var elmt, dom;

            if (typeof root === "string") {
                elmt = $("<" + root + ">");
            } else {
                elmt = $(root);
            }
            elmt.html(s);

            dom = { elmt: elmt };

            if (typeof fieldElmts === "undefined" || fieldElmts === null) {
                fieldElmts = {};
            }

            methods._fromStringChildren(dom, elmt, fieldElmts);

            return dom;
        },

        /**
         * Helper function for string to substitute original elements
         * with their field replacements.
         *
         * @param {Object} dom,
         * @param {Element} elmt
         * @param {Object} fieldElmts
         */
        "_fromString": function(dom, elmt, fieldElmts) {
            var id, parentElmt;
            id = $(elmt).attr("id");
            if (typeof id !== "undefined" && id.length > 0) {
                $(elmt).removeAttr("id");
                if (fieldElmts.hasOwnProperty(id)) {
                    $(elmt).before($(fieldElmts[id]));
                    $(elmt).remove();
                    dom[id] = fieldElmts[id];
                    return;
                } else {
                    dom[id] = elmt;
                }
            }

            if ($("> *", elmt).length > 0) {
                methods._fromStringChildren(dom, elmt, fieldElmts);
            }
        },

        /**
         * Helper method to string to process the newly created DOM for any
         * necessary replacements.
         *
         * @param {Object} dom,
         * @param {Element} elmt
         * @param {Object} fieldElmts
         */
        "_fromStringChildren": function(dom, elmt, fieldElmts) {
            var node, node2;
            node = $(elmt).children(':first');
            while (node.length !== 0) {
                node2 = node.next();
                methods._fromString(dom, node, fieldElmts);
                node = node2;
            }
        }
    };

    /**
     * @param {String} method
     */
    $.simileDOM = function(method) {
        if (typeof method !== "undefined" &&
            method !== null &&
            typeof method === "string" &&
            method.indexOf("_") !== 0 &&
            typeof methods[method] !== "undefined") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error("Method " + method + " does not exist on jQuery.simileDOM");
        }
    };
}(jQuery));
