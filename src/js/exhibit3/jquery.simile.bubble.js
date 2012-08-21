/**
 * @fileOverview jQuery 1.6+ plugin for making popup bubbles.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

(function($) {
    var pngFail, defaultBubbleConfig, methods, _init;

    pngFail = $.browser.msie && Number($.browser.version[0]).valueOf() <= 6;

    _init = false;

    defaultBubbleConfig = {
        containerCSSClass:              "simileAjax-bubble-container",
        innerContainerCSSClass:         "simileAjax-bubble-innerContainer",
        contentContainerCSSClass:       "simileAjax-bubble-contentContainer",
    
        borderGraphicSize:              50,
        borderGraphicCSSClassPrefix:    "simileAjax-bubble-border-",
    
        arrowGraphicTargetOffset:       33,  // from tip of arrow to the side of the graphic that touches the content of the bubble
        arrowGraphicLength:             100, // dimension of arrow graphic along the direction that the arrow points
        arrowGraphicWidth:              49,  // dimension of arrow graphic perpendicular to the direction that the arrow points
        arrowGraphicCSSClassPrefix:     "simileAjax-bubble-arrow-",
        
        closeGraphicCSSClass:           "simileAjax-bubble-close",
    
        extraPadding:                   20
    };

    methods = {
        "configure": function(options) {
            var opt;
            for (opt in options) {
                if (options.hasOwnProperty(opt)) {
                    defaultBubbleConfig[opt] = options[opt];
                }
            }
        },
        "createBubbleForContentAndPoint": function(div, pageX, pageY, contentWidth, orientation, maxHeight) {
            if (typeof contentWidth !== "number") {
                contentWidth = 300;
            }
            if (typeof maxHeight !== "number") {
                maxHeight = 0;
            }

            div = $(div);
            div.css("position", "absolute").
                css("left", "-5000px").
                css("top", "0px").
                css("width", contentWidth + "px");
            $(document.body).append(div);
            
            window.setTimeout(function() {
                var width, height, scrollDivW, bubble, scrollDiv;
                width = div.prop("scrollWidth") + 10;
                height = div.prop("scrollHeight") + 10;
                scrollDivW = 0; // width of the possible inner container when we want vertical scrolling
                if (maxHeight > 0 && height > maxHeight) {
                    height = maxHeight;
                    scrollDivW = width - 25;
                }
       
                bubble = methods.createBubbleForPoint(pageX, pageY, width, height, orientation);
        
                div.remove();
                div.css("position", "static");
                div.css("left", null);
                div.css("top", null);
        
                // create a scroll div if needed
                if (scrollDivW > 0) {
                    scrollDiv = $("<div>");
                    div.css("width", null);
                    scrollDiv.css("width", scrollDivW + "px");
                    scrollDiv.append(div);
                    $(bubble.content).append(scrollDiv);
                } else {
                    div.css("width", width + "px");
                    $(bubble.content).append(div);
                }
            }, 200);
        },
        "createBubbleForPoint": function(pageX, pageY, contentWidth, contentHeight, orientation) {
            var bubbleConfig, pnTransparencyClassSuffix, bubbleWidth, bubbleHeight, generatePngSensitiveClass, div, divInnerContainer, bubble, close, layer, createBorder, divContentContainer, divClose;

            contentWidth = parseInt(contentWidth, 10);
            contentHeight = parseInt(contentHeight, 10);

            bubbleConfig = defaultBubbleConfig;
            pngTransparencyClassSuffix = pngFail ?
                "pngNotTranslucent" :
                "pngTranslucent";
    
            bubbleWidth = contentWidth + 2 * bubbleConfig.borderGraphicSize;
            bubbleHeight = contentHeight + 2 * bubbleConfig.borderGraphicSize;
    
            generatePngSensitiveClass = function(className) {
                return className + " " + className + "-" + pngTransparencyClassSuffix;
            };
    
            /*
             *  Render container divs
             */
            div = $("<div>").
                attr("class", generatePngSensitiveClass(bubbleConfig.containerCSSClass)).
                css("width", contentWidth + "px").
                css("height", contentHeight + "px");

            divInnerContainer = $("<div>").
                attr("class", generatePngSensitiveClass(bubbleConfig.innerContainerCSSClass));
            div.append(divInnerContainer);
    
            /*
             *  Create layer for bubble
             */
            close = function() { 
                if (!bubble._closed) {
                    $(bubble._div).remove();
                    bubble._doc = null;
                    bubble._div = null;
                    bubble._content = null;
                    bubble._closed = true;
                }
            };
            bubble = { _closed: false };
            bubble._div = div.get(0);
            // @@@ not entirely correct, former layers material
            bubble.close = function() { close(); };
            
            /*
             *  Render border graphics
             */
            createBorder = function(classNameSuffix) {
                var divBorderGraphic = $("<div>").
                    attr("class",generatePngSensitiveClass(bubbleConfig.borderGraphicCSSClassPrefix + classNameSuffix));
                divInnerContainer.append(divBorderGraphic);
            };

            createBorder("top-left");
            createBorder("top-right");
            createBorder("bottom-left");
            createBorder("bottom-right");
            createBorder("left");
            createBorder("right");
            createBorder("top");
            createBorder("bottom");
            
            /*
             *  Render content
             */
            divContentContainer = $("<div>").
                attr("class", generatePngSensitiveClass(bubbleConfig.contentContainerCSSClass));
            divInnerContainer.append(divContentContainer);
            bubble.content = divContentContainer.get(0);
            
            /*
             *  Render close button
             */
            divClose = $("<div>").
                attr("class", generatePngSensitiveClass(bubbleConfig.closeGraphicCSSClass));
            divInnerContainer.append(divClose);
            divClose.bind("click", bubble.close);
            
            (function() {
                var docWidth, docHeight, halfArrowGraphicWidth, createArrow, left, divArrow, top;
                docWidth = $(window).width();
                docHeight = $(window).height();
                
                halfArrowGraphicWidth = Math.ceil(bubbleConfig.arrowGraphicWidth / 2);
        
                createArrow = function(classNameSuffix) {
                    var divArrowGraphic = $("<div>").
                        attr("class", generatePngSensitiveClass(bubbleConfig.arrowGraphicCSSClassPrefix + "point-" + classNameSuffix));
                    divInnerContainer.append(divArrowGraphic);
                    return divArrowGraphic;
                };
        
                if (pageX - halfArrowGraphicWidth - bubbleConfig.borderGraphicSize - bubbleConfig.extraPadding > 0 &&
                    pageX + halfArrowGraphicWidth + bubbleConfig.borderGraphicSize + bubbleConfig.extraPadding < docWidth) {
                    
                    /*
                     *  Bubble can be positioned above or below the target point.
                     */
                    
                    left = pageX - Math.round(contentWidth / 2);
                    left = pageX < (docWidth / 2) ?
                        Math.max(left, bubbleConfig.extraPadding + bubbleConfig.borderGraphicSize) : 
                        Math.min(left, docWidth - bubbleConfig.extraPadding - bubbleConfig.borderGraphicSize - contentWidth);
                    
                    if ((orientation && orientation === "top") || 
                        (!orientation && 
                         (pageY 
                          - bubbleConfig.arrowGraphicTargetOffset 
                          - contentHeight 
                          - bubbleConfig.borderGraphicSize 
                          - bubbleConfig.extraPadding > 0))) {
                        
                        /*
                         *  Position bubble above the target point.
                         */
                        
                        divArrow = createArrow("down");
                        divArrow.css("left", (pageX - halfArrowGraphicWidth - left) + "px");
                        
                        div.css("left", left + "px");
                        div.css("top", (pageY - bubbleConfig.arrowGraphicTargetOffset - contentHeight) + "px");
                        
                        return;
                    } else if ((orientation && orientation === "bottom") || 
                               (!orientation && 
                                (pageY 
                                 + bubbleConfig.arrowGraphicTargetOffset 
                                 + contentHeight 
                                 + bubbleConfig.borderGraphicSize 
                                 + bubbleConfig.extraPadding < docHeight))) {
                        
                        /*
                         *  Position bubble below the target point.
                         */
                        
                        divArrow = createArrow("up");
                        divArrow.css("left", (pageX - halfArrowGraphicWidth - left) + "px");
                
                        div.css("left", left + "px");
                        div.css("top", (pageY + bubbleConfig.arrowGraphicTargetOffset) + "px");
                
                        return;
                    }
                }
                
                top = pageY - Math.round(contentHeight / 2);
                top = pageY < (docHeight / 2) ?
                    Math.max(top, bubbleConfig.extraPadding + bubbleConfig.borderGraphicSize) : 
                    Math.min(top, docHeight - bubbleConfig.extraPadding - bubbleConfig.borderGraphicSize - contentHeight);
                
                if ((orientation && orientation === "left") || 
                    (!orientation && 
                     (pageX 
                      - bubbleConfig.arrowGraphicTargetOffset 
                      - contentWidth
                      - bubbleConfig.borderGraphicSize 
                      - bubbleConfig.extraPadding > 0))) {
                    
                    /*
                     *  Position bubble left of the target point.
                     */
                    
                    divArrow = createArrow("right");
                    divArrow.css("top", (pageY - halfArrowGraphicWidth - top) + "px");
                    
                    div.css("top", top + "px");
                    div.css("left", (pageX - bubbleConfig.arrowGraphicTargetOffset - contentWidth) + "px");
                } else {
            
                    /*
                     *  Position bubble right of the target point, as the last resort.
                     */
                    
                    divArrow = createArrow("left");
                    divArrow.css("top", (pageY - halfArrowGraphicWidth - top) + "px");
                    
                    div.css("top", top + "px");
                    div.css("left", (pageX + bubbleConfig.arrowGraphicTargetOffset) + "px");
                }
            }());
            
            $(document.body).append(div);
            
            return bubble;            
        },
        "createMessageBubble": function() {
            var containerDiv, topDiv, topRightDiv, middleDiv, middleRightDiv, contentDiv, bottomDiv, bottomRightDiv;

            containerDiv = $("<div>");
            if (!pngFail) {
                topDiv = $("<div>").css({
                    "height": 33,
                    "background": "url(" + Exhibit.urlPrefix + "images/message-top-left.png) top left no-repeat",
                    "padding-left": 44
                });
                containerDiv.append(topDiv);
        
                topRightDiv = $("<div>").css({
                    "height": 33,
                    "background": "url(" + Exhibit.urlPrefix + "images/message-top-right.png) top right no-repeat"
                });
                topDiv.append(topRightDiv);
        
                middleDiv = $("<div>").css({
                    "background": "url(" + Exhibit.urlPrefix + "images/message-left.png) top left repeat-y",
                    "padding-left": 44
                });
                containerDiv.append(middleDiv);
        
                middleRightDiv = $("<div>").css({
                    "background": "url(" + Exhibit.urlPrefix + "images/message-right.png) top right repeat-y",
                    "padding-right": 44
                });
                middleDiv.append(middleRightDiv);
        
                contentDiv = $("<div>");
                middleRightDiv.append(contentDiv);
        
                bottomDiv = $("<div>").css({
                    "height": 55,
                    "background": "url(" + Exhibit.urlPrefix + "images/message-bottom-left.png) bottom left no-repeat",
                    "padding-left": 44
                });
                containerDiv.append(bottomDiv);
        
                bottomRightDiv = $("<div>").css({
                    "height": 55,
                    "background": "url(" + Exhibit.urlPrefix + "images/message-bottom-right.png) bottom right no-repeat"
                });
                bottomDiv.append(bottomRightDiv);
            } else {
                containerDiv.css({
                    "border":  "2px solid #7777AA",
                    "padding": "20px",
                    "background": "white",
                    "opacity": 0.9
                });
        
                contentDiv = $("<div>");
                containerDiv.append(contentDiv);
            }
            
            return {
                containerDiv:   containerDiv,
                contentDiv:     contentDiv
            };
        },
        "createTranslucentImage": function(url, verticalAlign) {
            var elmt = $("<img />");
            if (pngFail) {
                elmt.
                    css("width", "1px").
                    css("height", "1px").
                    css("filter", "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + url +"', sizingMethod='image')");
            } else {
                elmt.attr("src", url);
            }

            if (typeof verticalAlign !== "undefined" &&
                verticalAlign !== null) {
                elmt.css("vertical-align", verticalAlign);
            } else {
                elmt.css("vertical-align", "middle");
            }
            return elmt.get(0);            
        },
        "createTranslucentImageHTML": function(url, verticalAlign) {
            if (pngFail) {
                var style = 
                    "width: 1px; height: 1px; " +
                    "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + url +"', sizingMethod='image');" +
                    (verticalAlign !== null ? " vertical-align: " + verticalAlign + ";" : "");
                return "<img src='" + url + "' style=\"" + style + "\" />";
            } else {
                return "<img src=\"" + url + "\"" +
                    (typeof verticalAlign !== "undefined" && verticalAlign !== null ? " style=\"vertical-align: " + verticalAlign + ";\"" : "") +
                    " />";
            }
        },
        "pngIsTranslucent": function() {
            return !pngFail;
        }
    };

    $.simileBubble = function(method) {
        if (typeof method !== "undefined" &&
            method !== null &&
            typeof method === "string" &&
            method.indexOf("_") !== 0 &&
            typeof methods[method] !== "undefined") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" ||
                   typeof method === "undefined" ||
                   method === null) {
            return methods.configure.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery.simileBubble");
        }
    };
}(jQuery));
