/**
 * @fileOverview Localization handlers
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {String} locale
 * @param {String} url
 */
Exhibit.Locale = function(locale, url) {
    this._locale = locale;
    this._url = url;
    Exhibit.Localization.registerLocale(this._locale, this);
};

/**
 * @returns {String}
 */
Exhibit.Locale.prototype.getURL = function() {
    return this._url;
};

/**
 * @namespace All localization keys and strings fit under this namespace.
 */
Exhibit.l10n = {};

/**
 * Localizing function; take an identifying key and return the most specific
 * localization possible for it.  May return undefined if no match can be
 * found.
 * @see http://purl.eligrey.com/l10n.js
 * @requires sprintf.js
 * @param {String} s The key of the localized string to use.
 * @param [arguments] Any number of optional arguments that may be used in
 *     displaying the message, like numbers for count-dependent messages.
 * @returns Usually returns a string but may return arrays, booleans, etc.
 *     depending on what was localized.  Ideally this would not return a
 *     data structure.
 */
Exhibit._ = function() {
    var key, s, args;
    args = [].slice.apply(arguments);
    if (args.length > 0) {
        key = args.shift();
        s = Exhibit.Localization.lookup(key);
        if (typeof s !== "undefined") {
            return vsprintf(s, args);
        } else {
            return s;
        }
    }
};

/**
 * @namespace
 */
Exhibit.Localization = {
    _registryKey: "l10n",
    _registry: null,
    _lastResortLocale: "en",
    _currentLocale: undefined,
    _loadedLocales: []
};

/**
 * @static
 */
Exhibit.Localization._registerComponent = function(evt, reg) {
    var i, locale, clientLocales, segments;
    Exhibit.Localization._registry = reg;
    Exhibit.locales.push(Exhibit.Localization._lastResortLocale);

    clientLocales = (typeof navigator.language === "string" ?
                     navigator.language :
                     (typeof navigator.browserLanguage === "string" ?
                      navigator.browserLanguage :
                      Exhibit.Localization._lastResortLocale)).split(";");

    for (i = 0; i < clientLocales.length; i++) {
        locale = clientLocales[i];
        if (locale !== Exhibit.Localization._lastResortLocale) {
            segments = locale.split("-");
            if (segments.length > 1 &&
                segments[0] !== Exhibit.Localization._lastResortLocale) {
                Exhibit.locales.push(segments[0]);
            }
            Exhibit.locales.push(locale);
        }
    }

    if (typeof Exhibit.params.locale === "string") {
        if (Exhibit.params.locale !== Exhibit.Localization._lastResortLocale) {
            segments = Exhibit.params.locale.split("-");
            if (segments.length > 1 &&
                segments[0] !== Exhibit.Localization._lastResortLocale) {
                Exhibit.locales.push(segments[0]);
            }
            Exhibit.locales.push(Exhibit.params.locale);
        }
    }

    if (!reg.hasRegistry(Exhibit.Localization._registryKey)) {
        reg.createRegistry(Exhibit.Localization._registryKey);
        $(document).trigger("registerLocales.exhibit");
    }
};

/**
 * @static
 * @param {String} locale
 * @returns {Boolean}
 */
Exhibit.Localization.registerLocale = function(locale, l10n) {
    if (!Exhibit.Localization._registry.isRegistered(
        Exhibit.Localization._registryKey,
        locale
    )) {
        Exhibit.Localization._registry.register(
            Exhibit.Localization._registryKey,
            locale,
            l10n
        );
        $(document).trigger("localeRegistered.exhibit");
        return true;
    } else {
        return false;
    }
};

/**
 * @param {String} locale
 * @returns {Boolean}
 */
Exhibit.Localization.hasLocale = function(locale) {
    return Exhibit.Localization._registry.isRegistered(
        Exhibit.Localization._registryKey,
        locale
    );
};

/**
 * @param {String} locale
 * @returns {Exhibit.Locale}
 */
Exhibit.Localization.getLocale = function(locale) {
    return Exhibit.Localization._registry.get(
        Exhibit.Localization._registryKey,
        locale
    );
};

/**
 * @param {Array} locales
 */
Exhibit.Localization.setLocale = function(locales) {
    var i, locale, urls;

    urls = [];
    for (i = locales.length - 1; i >= 0; i--) {
        locale = locales[i];
        if (Exhibit.Localization.hasLocale(locale)) {
            if (typeof Exhibit.Localization._currentLocale === "undefined") {
                Exhibit.Localization._currentLocale = locale;
            }
            Exhibit.Localization._loadedLocales.push(locale);
            urls.push(Exhibit.Localization.getLocale(locale).getURL());
        }
    }

    $(document).trigger(
        "localeSet.exhibit",
        [urls]
    );
};

/**
 * @returns {String}
 */
Exhibit.Localization.getCurrentLocale = function() {
    return Exhibit.Localization._currentLocale;
};

/**
 * Given a list of extension locales, return the viable locales that
 * should be loaded, based on what core locales were loaded.  Assume
 * that a localization not available and loaded in core is not an
 * interesting extension locale to load.
 * @param {Array} possibles
 * @returns {Array}
 */
Exhibit.Localization.getLoadableLocales = function(possibles) {
    var i, loaded, loadable;
    loaded = Exhibit.Localization._loadedLocales;
    loadable = [];
    for (i = 0; i < loaded.length; i++) {
        if (possibles.indexOf(loaded[i]) >= 0) {
            loadable.push(loaded[i]);
        }
    }
    return loadable;
};

/**
 * Import core localization.
 * @param {String} locale
 * @param {Object} hash
 */
Exhibit.Localization.importLocale = function(locale, hash) {
    if (typeof Exhibit.l10n[locale] === "undefined") {
        Exhibit.l10n[locale] = hash;
        $(document).trigger("localeLoaded.exhibit", [locale]);
    }
};

/**
 * Import extension localization.
 * @param {String} locale
 * @param {Object} hash
 */
Exhibit.Localization.importExtensionLocale = function(locale, hash) {
    if (typeof Exhibit.l10n[locale] !== "undefined") {
        $.extend(Exhibit.l10n[locale], hash);
    } else {
        Exhibit.l10n[locale] = hash;
    }
};

/**
 * Decodes UTF-8 strings to output in HTML
 * @param {String} s
 * @returns {String}
 * @see http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
 */
Exhibit.Localization.decodeUTF8 = function(s) {
    var r;
    try {
        r = decodeURIComponent(escape(s));
    } catch (e) {
        r = s;
    }
    return r;
};

/**
 * Looks up a key in the set of localization and returns the corresponding
 * message; may return undefined if not found.
 * @param {String} key
 * @returns {String}
 */
Exhibit.Localization.lookup = function(key) {
    var i, locale;
    for (i = 0; i < Exhibit.Localization._loadedLocales.length; i++) {
        locale = Exhibit.Localization._loadedLocales[i];
        if (typeof Exhibit.l10n[locale] !== "undefined") {
            if (typeof Exhibit.l10n[locale][key] !== "undefined") {
                return Exhibit.Localization.decodeUTF8(Exhibit.l10n[locale][key]);
            }
        }
    }
    return undefined;
};

$(document).one(
    "registerLocalization.exhibit",
    Exhibit.Localization._registerComponent
);

$(document).bind(
    "localesRegistered.exhibit",
    function() {
        Exhibit.Localization.setLocale(Exhibit.locales);
    }
);
