/**
 * @fileOverview View header option making widget
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.OptionWidget = function(configuration, containerElmt, uiContext) {
    this._label = configuration.label;
    this._checked = typeof configuration.checked !== "undefined" ?
        configuration.checked :
        false;
    this._onToggle = configuration.onToggle;
    
    this._containerElmt = containerElmt;
    this._uiContext = uiContext;
    this._initializeUI();
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.OptionWidget}
 */
Exhibit.OptionWidget.create = function(configuration, containerElmt, uiContext) {
    return new Exhibit.OptionWidget(configuration, containerElmt, uiContext);
};

/**
 *
 */
Exhibit.OptionWidget.prototype.dispose = function() {
    $(this._containerElmt).empty();
    
    this._dom = null;
    this._containerElmt = null;
    this._uiContext = null;
};

/**
 * @constant
 */
Exhibit.OptionWidget.uncheckedImageURL = Exhibit.urlPrefix + "images/option.png";

/**
 * @constant
 */
Exhibit.OptionWidget.checkedImageURL = Exhibit.urlPrefix + "images/option-check.png";

/**
 * @constant
 */
Exhibit.OptionWidget.uncheckedTemplate = 
    "<span id=\"uncheckedSpan\" style=\"display: none;\"><img id=\"uncheckedImage\" /> %1$s</span>";
    
/**
 * @constant
 */
Exhibit.OptionWidget.checkedTemplate = 
    "<span id=\"checkedSpan\" style=\"display: none;\"><img id=\"checkedImage\" /> %1$s</span>";
    
/**
 *
 */
Exhibit.OptionWidget.prototype._initializeUI = function() {
    this._containerElmt.className = "exhibit-optionWidget";
    this._dom = $.simileDOM(
        "string",
        this._containerElmt,
        sprintf(
            Exhibit.OptionWidget.uncheckedTemplate + Exhibit.OptionWidget.checkedTemplate,
            this._label
        ),
        {   uncheckedImage: $.simileBubble("createTranslucentImage", Exhibit.OptionWidget.uncheckedImageURL),
            checkedImage:   $.simileBubble("createTranslucentImage", Exhibit.OptionWidget.checkedImageURL)
        }
    );
    
    if (this._checked) {
        $(this._dom.checkedSpan).show();
    } else {
        $(this._dom.uncheckedSpan).show();
    }

    $(this._containerElmt).bind("click", this._onToggle);
};

/**
 * @returns {Boolean}
 */
Exhibit.OptionWidget.prototype.getChecked = function() {
    return this._checked;
};

/**
 * @param {Boolean} checked
 */
Exhibit.OptionWidget.prototype.setChecked = function(checked) {
    if (checked !== this._checked) {
        this._checked = checked;
        if (checked) {
            $(this._dom.checkedSpan).show();
            $(this._dom.uncheckedSpan).hide();
        } else {
            $(this._dom.checkedSpan).hide();
            $(this._dom.uncheckedSpan).show();
        }
    }
};

/**
 *
 */
Exhibit.OptionWidget.prototype.toggle = function() {
    this.setChecked(!this._checked);
};
