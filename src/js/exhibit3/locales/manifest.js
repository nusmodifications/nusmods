$(document).bind("registerLocales.exhibit", function() {
    $(document).trigger("beforeLocalesRegistered.exhibit");
    new Exhibit.Locale("default", Exhibit.urlPrefix + "locales/en/locale.js");
    new Exhibit.Locale("en", Exhibit.urlPrefix + "locales/en/locale.js");
    $(document).trigger("localesRegistered.exhibit");
});