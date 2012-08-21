/**
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @fileOverview
 */

/**
 * @namespace Utility functions for working with built-in Date objects.
 */
Exhibit.NativeDateUnit = {};

/**
 * Return right now as a Date object.
 *
 * @static
 * @returns {Date} Right now.
 */
Exhibit.NativeDateUnit.makeDefaultValue = function() {
    return new Date();
};

/**
 * Make a new Date object with the same value as the argument.
 *
 * @static
 * @param {Date} v Original Date object.
 * @returns {Date} New Date object with the same value, not identical.
 */
Exhibit.NativeDateUnit.cloneValue = function(v) {
    return new Date(v.getTime());
};

/**
 * Based on a format, return a function that can take a string and parse
 * the format into a Date object.  Currently recognizes ISO-8601 as a
 * format; all others are treated as Gregorian.
 *
 * @requires Exhibit.DateTime
 * @see Exhibit.DateTime.parseIso8601DateTime
 * @see Exhibit.DateTime.parseGregorianDateTime
 * @static
 * @param {String} format Name of the date format, commonly ISO-8601.
 * @returns {Function} A function that takes a string in the given format
 *                     and returns a Date object.
 */
Exhibit.NativeDateUnit.getParser = function(format) {
    if (typeof format === "string") {
        format = format.toLowerCase();
    }
    return (format === "iso8601" || format === "iso 8601") ?
        Exhibit.DateTime.parseIso8601DateTime : 
        Exhibit.DateTime.parseGregorianDateTime;
};

/**
 * Returns the object if a Date or parses using native (Gregorian) date
 * parsing if a String.
 *
 * @static
 * @param {Date|String} o The object to return or parse.
 * @returns {Date} The parsed string or original object.
 */
Exhibit.NativeDateUnit.parseFromObject = function(o) {
    return Exhibit.DateTime.parseGregorianDateTime(o);
};

/**
 * Converts a Date object to its numeric representation in seconds since epoch.
 *
 * @static
 * @param {Date} v The Date object to convert.
 * @returns {Number} The date value in seconds since epoch.
 */
Exhibit.NativeDateUnit.toNumber = function(v) {
    return v.getTime();
};

/**
 * Converts seconds since epoch into a Date object.
 *
 * @static
 * @param {Number} n Seconds since epoch.
 * @returns {Date} The corresponding Date object.
 */
Exhibit.NativeDateUnit.fromNumber = function(n) {
    return new Date(n);
};

/**
 * Compares two Date objects.  If the values of the two are the same, returns
 * 0.  If v1 is earlier than v2, the return value is negative.  If v1 is
 * later than v2, the return value is positive.  Also compares anything that
 * can be converted to a Number, assuming the number is measured since epoch.
 *
 * @static
 * @param {Date|String|Number} v1 First Date object or raw time value to
                                  compare.
 * @param {Date|String|Number} v2 Second Date object or raw time value to
                                  compare.
 * @returns {Number} Integer with negative, zero, or positive value depending
 *                   on relative date values.
 */
Exhibit.NativeDateUnit.compare = function(v1, v2) {
    var n1, n2;
    if (typeof v1 === "object") {
        n1 = v1.getTime();
    } else {
        n1 = Number(v1);
    }
    if (typeof v2 === "object") {
        n2 = v2.getTime();
    } else {
        n2 = Number(v2);
    }
    
    return n1 - n2;
};

/**
 * Returns the earlier object of the two passed in as arguments.
 *
 * @static
 * @param {Date} v1 The first Date object to compare.
 * @param {Date} v2 The second Date object to compare.
 * @returns {Date} The earlier of the two arguments.
 */
Exhibit.NativeDateUnit.earlier = function(v1, v2) {
    return Exhibit.NativeDateUnit.compare(v1, v2) < 0 ? v1 : v2;
};

/**
 * Returns the later object of the two passed in as arguments.
 *
 * @static
 * @param {Date} v1 The first Date object to compare.
 * @param {Date} v2 The second Date object to compare.
 * @returns {Date} The later of the two arguments.
 */
Exhibit.NativeDateUnit.later = function(v1, v2) {
    return Exhibit.NativeDateUnit.compare(v1, v2) > 0 ? v1 : v2;
};

/**
 * Make a new Date object by adding a number of seconds to the original.
 *
 * @static
 * @param {Date} v The Date object to modify.
 * @param {Number} n The number of seconds, positive or negative, to add
 *                   to the Date object.
 * @returns {Date} A new Date object with the seconds added.
 */
Exhibit.NativeDateUnit.change = function(v, n) {
    return new Date(v.getTime() + n);
};
