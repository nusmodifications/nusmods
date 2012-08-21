/**
 * @fileOverview Resizable element widget
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ResizableDivWidget = function(configuration, elmt, uiContext) {
    this._div = elmt;
    this._configuration = configuration;
    if (typeof configuration.minHeight === "undefined") {
        configuration.minHeight = 10; // pixels
    }
    this._dragging = false;
    this._height = null;
    this._origin = null;
    this._ondrag = null;
    
    this._initializeUI();
};

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ResizableDivWidget}
 */
Exhibit.ResizableDivWidget.create = function(configuration, elmt, uiContext) {
    return new Exhibit.ResizableDivWidget(configuration, elmt, uiContext);
};

/**
 *
 */
Exhibit.ResizableDivWidget.prototype.dispose = function() {
    $(this._div).empty();
    this._contentDiv = null;
    this._resizerDiv = null;
    this._div = null;
};

/**
 * @returns {Element}
 */
Exhibit.ResizableDivWidget.prototype.getContentDiv = function() {
    return this._contentDiv;
};

/**
 *
 */
Exhibit.ResizableDivWidget.prototype._initializeUI = function() {
    var self = this;
    
    $(this._div).html(
        "<div></div>" +
        '<div class="exhibit-resizableDivWidget-resizer">' +
            Exhibit.UI.createTranslucentImageHTML("images/down-arrow.png") +
            "</div>");
        
    this._contentDiv = $(this._div).children().get(0);
    this._resizerDiv = $(this._div).children().get(1);

    $(this._resizerDiv).bind("mousedown", function(evt) {
        self._dragging = true;
        self._height = $(self._contentDiv).height();
        self._origin = { "x": evt.pageX, "y": evt.pageY };

        self._ondrag = function(evt2) {
            var height = self._height + evt2.pageY - self._origin.y;
            evt.preventDefault();
            evt.stopPropagation();
            $(self._contentDiv).height(Math.max(
                height,
                self._configuration.minHeight
            ));
        };
        $(document).bind("mousemove", self._ondrag);

        self._dragdone = function(evt) {
            self._dragging = false;
            $(document).unbind("mousemove", self._ondrag);
            if (typeof self._configuration.onResize === "function") {
                self._configuration.onResize();
            }
        };
        $(self._resizerDiv).one("mouseup", self._dragdone);
    });
};
