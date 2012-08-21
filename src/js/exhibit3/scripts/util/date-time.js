/**
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @fileOverview A collection of date/time utility functions.
 */

/**
 * @namespace A collection of date/time utility functions.
 */
Exhibit.DateTime = {};

                                     /** @constant */
Exhibit.DateTime.MILLISECOND    = 0; /** @constant */
Exhibit.DateTime.SECOND         = 1; /** @constant */
Exhibit.DateTime.MINUTE         = 2; /** @constant */
Exhibit.DateTime.HOUR           = 3; /** @constant */
Exhibit.DateTime.DAY            = 4; /** @constant */
Exhibit.DateTime.WEEK           = 5; /** @constant */
Exhibit.DateTime.MONTH          = 6; /** @constant */
Exhibit.DateTime.YEAR           = 7; /** @constant */
Exhibit.DateTime.DECADE         = 8; /** @constant */
Exhibit.DateTime.CENTURY        = 9; /** @constant */
Exhibit.DateTime.MILLENNIUM     = 10; /** @constant */
Exhibit.DateTime.QUARTER        = 11; /** @constant */

Exhibit.DateTime.EPOCH          = -1; /** @constant */
Exhibit.DateTime.ERA            = -2;

/**
 * An array of unit lengths, expressed in milliseconds, of various lengths of
 * time.  The array indices are predefined and stored as properties of the
 * Exhibit.DateTime object, e.g. Exhibit.DateTime.YEAR.
 * @constant
 * @type {Array}
 */
Exhibit.DateTime.gregorianUnitLengths = [];
(function() {
    var d = Exhibit.DateTime, a = d.gregorianUnitLengths;
    
    a[d.MILLISECOND] = 1;
    a[d.SECOND]      = 1000;
    a[d.MINUTE]      = a[d.SECOND] * 60;
    a[d.HOUR]        = a[d.MINUTE] * 60;
    a[d.DAY]         = a[d.HOUR] * 24;
    a[d.WEEK]        = a[d.DAY] * 7;
    a[d.MONTH]       = a[d.DAY] * 31;
    a[d.QUARTER]     = a[d.MONTH] * 3;
    a[d.YEAR]        = a[d.DAY] * 365;
    a[d.DECADE]      = a[d.YEAR] * 10;
    a[d.CENTURY]     = a[d.YEAR] * 100;
    a[d.MILLENNIUM]  = a[d.YEAR] * 1000;
}());

/**
 * @private
 * @static
 * @constant
 */
Exhibit.DateTime._dateRegexp = new RegExp(
    "^(-?)([0-9]{4})(" + [
        "(-?([0-9]{2})(-?([0-9]{2}))?)", // -month-dayOfMonth
        "(-?([0-9]{3}))",                // -dayOfYear
        "(-?W([0-9]{2})(-?([1-7]))?)"    // -Wweek-dayOfWeek
    ].join("|") + ")?$"
);

/**
 * @private
 * @static
 * @constant
 */
Exhibit.DateTime._timezoneRegexp = /Z|(([\-+])([0-9]{2})(:?([0-9]{2}))?)$/;

/**
 * @private
 * @static
 * @constant
 */
Exhibit.DateTime._timeRegexp = /^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$/;

/**
 * Takes a date object and a string containing an ISO 8601 date and sets the
 * the date using information parsed from the string.  Note that this method
 * does not parse any time information.
 *
 * @static
 * @param {Date} dateObject The date object to modify.
 * @param {String} string An ISO 8601 string to parse.
 * @returns {Date} The modified date object.
 */
Exhibit.DateTime.setIso8601Date = function(dateObject, string) {
    /*
     *  This function has been adapted from dojo.date, v.0.3.0
     *  http://dojotoolkit.org/.
     */
    var d, sign, year, month, date, dayofyear, week, dayofweek, gd, day, offset;
    d = string.match(Exhibit.DateTime._dateRegexp);
    if (!d) {
        throw new Error(Exhibit._("%datetime.error.invalidDate", string));
    }
    
    sign = (d[1] === "-") ? -1 : 1; // BC or AD
    year = sign * d[2];
    month = d[5];
    date = d[7];
    dayofyear = d[9];
    week = d[11];
    dayofweek = (d[13]) ? d[13] : 1;

    dateObject.setUTCFullYear(year);
    if (dayofyear) { 
        dateObject.setUTCMonth(0);
        dateObject.setUTCDate(Number(dayofyear));
    } else if (week) {
        dateObject.setUTCMonth(0);
        dateObject.setUTCDate(1);
        gd = dateObject.getUTCDay();
        day =  (gd) ? gd : 7;
        offset = Number(dayofweek) + (7 * Number(week));
        
        if (day <= 4) { 
            dateObject.setUTCDate(offset + 1 - day); 
        } else { 
            dateObject.setUTCDate(offset + 8 - day); 
        }
    } else {
        if (month) { 
            dateObject.setUTCDate(1);
            dateObject.setUTCMonth(month - 1); 
        }
        if (date) { 
            dateObject.setUTCDate(date); 
        }
    }
    
    return dateObject;
};

/**
 * Takes a date object and a string containing an ISO 8601 time and sets the
 * the time using information parsed from the string.  Note that this method
 * does not parse any date information.
 *
 * @param {Date} dateObject The date object to modify.
 * @param {String} string An ISO 8601 string to parse.
 * @returns {Date} The modified date object.
 */
Exhibit.DateTime.setIso8601Time = function (dateObject, string) {
    /*
     *  This function has been adapted from dojo.date, v.0.3.0
     *  http://dojotoolkit.org/.
     */
    var d, hours, mins, secs, ms;
    d = string.match(Exhibit.DateTime._timeRegexp);
    if (!d) {
        throw new Error(Exhibit._("%datetime.error.invalidTime", string));
    }
    hours = d[1];
    mins = Number((d[3]) ? d[3] : 0);
    secs = (d[5]) ? d[5] : 0;
    ms = d[7] ? (Number("0." + d[7]) * 1000) : 0;

    dateObject.setUTCHours(hours);
    dateObject.setUTCMinutes(mins);
    dateObject.setUTCSeconds(secs);
    dateObject.setUTCMilliseconds(ms);
    
    return dateObject;
};

/**
 * The timezone offset in minutes in the user's browser.
 * @type {Number}
 */
Exhibit.DateTime.timezoneOffset = new Date().getTimezoneOffset();

/**
 * Takes a date object and a string containing an ISO 8601 date and time and 
 * sets the date object using information parsed from the string.
 *
 * @param {Date} dateObject The date object to modify.
 * @param {String} string An ISO 8601 string to parse.
 * @returns {Date} The modified date object.
 */
Exhibit.DateTime.setIso8601 = function (dateObject, string){
    /*
     *  This function has been adapted from dojo.date, v.0.3.0
     *  http://dojotoolkit.org/.
     */
    var offset, comps, d;
    offset = null;
    comps = (string.indexOf("T") === -1) ? string.split(" ") : string.split("T");
    
    Exhibit.DateTime.setIso8601Date(dateObject, comps[0]);
    if (comps.length === 2) { 
        // first strip timezone info from the end
        d = comps[1].match(Exhibit.DateTime._timezoneRegexp);
        if (d) {
            if (d[0] === 'Z') {
                offset = 0;
            } else {
                offset = (Number(d[3]) * 60) + Number(d[5]);
                offset *= ((d[2] === '-') ? 1 : -1);
            }
            comps[1] = comps[1].substr(0, comps[1].length - d[0].length);
        }

        Exhibit.DateTime.setIso8601Time(dateObject, comps[1]); 
    }
    if (typeof offset === "undefined" || offset === null) {
        offset = dateObject.getTimezoneOffset(); // local time zone if no tz info
    }
    dateObject.setTime(dateObject.getTime() + offset * 60000);
    
    return dateObject;
};

/**
 * Takes a string containing an ISO 8601 date and returns a newly instantiated
 * date object with the parsed date and time information from the string.
 *
 * @param {String} string An ISO 8601 string to parse.
 * @returns {Date} A new date object created from the string.
 */
Exhibit.DateTime.parseIso8601DateTime = function (string) {
    try {
        return Exhibit.DateTime.setIso8601(new Date(0), string);
    } catch (e) {
        return null;
    }
};

/**
 * Takes a string containing a Gregorian date and time and returns a newly
 * instantiated date object with the parsed date and time information from the
 * string.  If the param is actually an instance of Date instead of a string, 
 * simply returns the given date instead.  Note the times are considered UTC
 * by default, so, e.g., setting a year only may result in a different value
 * if you subsequently use non-UTC getters.
 *
 * @param {Date|String} o An object, to either return or parse as a string.
 * @returns {Date} The date object.
 */
Exhibit.DateTime.parseGregorianDateTime = function(o) {
    var s, space, year, suffix, d;
    if (typeof o === "undefined" || o === null) {
        return null;
    } else if (o instanceof Date) {
        return o;
    }
    
   s = o.toString();
    if (s.length > 0 && s.length < 8) {
        space = s.indexOf(" ");
        if (space > 0) {
            year = parseInt(s.substr(0, space), 10);
            suffix = s.substr(space + 1);
            if (suffix.toLowerCase() === "bc") {
                year = 1 - year;
            }
        } else {
            year = parseInt(s, 10);
        }
            
        d = new Date(0);
        d.setUTCFullYear(year);
        
        return d;
    }
    
    try {
        return new Date(Date.parse(s));
    } catch (e) {
        return null;
    }
};

/**
 * Rounds date objects down to the nearest interval or multiple of an interval.
 * This method modifies the given date object, converting it to the given
 * timezone if specified.  NB, does not support Exhibit.DateTime.QUARTER.
 *
 * Rounding to the week is something of an odd concept, so the semantics are
 * described here.  Weeks are 1-index.  The first week of the year goes from
 * Jan 1 to the day before the first firstDayOfWeek, unless Jan 1 is the first
 * firstDayOfWeek.  There can be 54 weeks in a leap year, 53 in a non-leap
 * year.  Rounding is only done within a year; the farthest to round down is
 * the first week of the year.  The same day of week is retained unless it
 * comes before the first of the year, in which case the first of the year is
 * used.
 * 
 * @param {Date} date The date object to round.
 * @param {Number} intervalUnit A constant, integer index specifying an 
 *   interval, e.g. Exhibit.DateTime.HOUR.
 * @param {Number} timeZone A timezone shift, given in hours.
 * @param {Number} multiple A multiple of the interval to round by.
 * @param {Number} firstDayOfWeek An integer specifying the first day of the
 *   week, 0 corresponds to Sunday, 1 to Monday, etc.
 */
Exhibit.DateTime.roundDownToInterval = function(date, intervalUnit, timeZone, multiple, firstDayOfWeek) {
    var timeShift, date2, clearInDay, clearInYear, x, first;
    timeShift = timeZone * 
        Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.HOUR];
        
    date2 = new Date(date.getTime() + timeShift);
    clearInDay = Exhibit.DateTime.zeroTimeUTC;
    clearInYear = function(d) {
        clearInDay(d);
        d.setUTCDate(1);
        d.setUTCMonth(0);
    };
    
    switch(intervalUnit) {
    case Exhibit.DateTime.MILLISECOND:
        x = date2.getUTCMilliseconds();
        date2.setUTCMilliseconds(x - (x % multiple));
        break;
    case Exhibit.DateTime.SECOND:
        date2.setUTCMilliseconds(0);
        
        x = date2.getUTCSeconds();
        date2.setUTCSeconds(x - (x % multiple));
        break;
    case Exhibit.DateTime.MINUTE:
        date2.setUTCMilliseconds(0);
        date2.setUTCSeconds(0);
        
        x = date2.getUTCMinutes();
        date2.setTime(date2.getTime() - 
            (x % multiple) * Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.MINUTE]);
        break;
    case Exhibit.DateTime.HOUR:
        date2.setUTCMilliseconds(0);
        date2.setUTCSeconds(0);
        date2.setUTCMinutes(0);
        
        x = date2.getUTCHours();
        date2.setUTCHours(x - (x % multiple));
        break;
    case Exhibit.DateTime.DAY:
        clearInDay(date2);

        x = date2.getUTCDate();
        date2.setUTCDate(x - (x % multiple));
        break;
    case Exhibit.DateTime.WEEK:
        first = new Date(date2.getUTCFullYear(), 0, 1);
        clearInDay(date2);
        clearInDay(first);
        x = Math.ceil((((date2 - first) / Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.DAY]) - ((firstDayOfWeek - first.getUTCDay() + 7) % 7) + 1) / 7) + (first.getUTCDay() !== firstDayOfWeek ? 1 : 0);
        date2.setTime(date2.getTime() - ((x % multiple) * Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.WEEK]));
        if (date2 < first) {
            date2 = first;
        }
        break;
    case Exhibit.DateTime.MONTH:
        clearInDay(date2);
        date2.setUTCDate(1);
        
        x = date2.getUTCMonth() + 1;
        date2.setUTCMonth(Math.max(0, x - 1 - (x % multiple)));
        break;
    case Exhibit.DateTime.YEAR:
        clearInYear(date2);
        
        x = date2.getUTCFullYear();
        date2.setUTCFullYear(x - (x % multiple));
        break;
    case Exhibit.DateTime.DECADE:
        clearInYear(date2);
        date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / 10) * 10);
        break;
    case Exhibit.DateTime.CENTURY:
        clearInYear(date2);
        date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / 100) * 100);
        break;
    case Exhibit.DateTime.MILLENNIUM:
        clearInYear(date2);
        date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / 1000) * 1000);
        break;
    }
    
    date.setTime(date2.getTime() - timeShift);
};

/**
 * Rounds date objects up to the nearest interval or multiple of an interval.
 * This method modifies the given date object, converting it to the given
 * timezone if specified.  NB, does not support Exhibit.DateTime.QUARTER.
 *
 * Unlike round down, round up for week and month may cross year boundaries.
 * The semantics here are also weird and probably should not be used for
 * anything other than multiples of one, but if you have October and want
 * to round up to the nearest fifteenth month, you will get April of the
 * next year.  Caveat emptor.
 * 
 * @param {Date} date The date object to round.
 * @param {Number} intervalUnit A constant, integer index specifying an 
 *   interval, e.g. Exhibit.DateTime.HOUR.
 * @param {Number} timeZone A timezone shift, given in hours.
 * @param {Number} multiple A multiple of the interval to round by.
 * @param {Number} firstDayOfWeek An integer specifying the first day of the
 *   week, 0 corresponds to Sunday, 1 to Monday, etc.
 * @see Exhibit.DateTime.roundDownToInterval
 */
Exhibit.DateTime.roundUpToInterval = function(date, intervalUnit, timeZone, multiple, firstDayOfWeek) {
    var originalTime, useRoundDown, usedRoundDown, date2, first, x, clearInYear;
    originalTime = date.getTime();
    clearInYear = function(d) {
        Exhibit.DateTime.zeroTimeUTC(d);
        d.setUTCDate(1);
        d.setUTCMonth(0);
    };
    usedRoundDown = false;
    useRoundDown = function() {
        Exhibit.DateTime.roundDownToInterval(date, intervalUnit, timeZone, multiple, firstDayOfWeek);
        if (date.getTime() < originalTime) {
            date.setTime(date.getTime() + 
                         Exhibit.DateTime.gregorianUnitLengths[intervalUnit] * multiple);
        }
        usedRoundDown = true;
    };

    timeShift = timeZone * 
        Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.HOUR];
    date2 = new Date(date.getTime() + timeShift);

    switch(intervalUnit) {
    case Exhibit.DateTime.MILLISECOND:
        useRoundDown();
        break;
    case Exhibit.DateTime.SECOND:
        useRoundDown();
        break;
    case Exhibit.DateTime.MINUTE:
        useRoundDown();
        break;
    case Exhibit.DateTime.HOUR:
        useRoundDown();
        break;
    case Exhibit.DateTime.DAY:
        useRoundDown();
        break;
    case Exhibit.DateTime.WEEK:
        first = new Date(date2.getUTCFullYear(), 0, 1);
        Exhibit.DateTime.zeroTimeUTC(date2);
        Exhibit.DateTime.zeroTimeUTC(first);
        x = Math.ceil((((date2 - first) / Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.DAY]) - ((firstDayOfWeek - first.getUTCDay() + 7) % 7) + 1) / 7) + (first.getUTCDay() !== firstDayOfWeek ? 1 : 0);
        date2.setTime(date2.getTime() + (((multiple - (x % multiple)) % multiple) * Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.WEEK]));
        break;
    case Exhibit.DateTime.MONTH:
        Exhibit.DateTime.zeroTimeUTC(date2);
        date2.setUTCDate(1);
        
        x = date2.getUTCMonth() + 1;
        date2.setUTCMonth(x - 1 + (multiple - (x % multiple)) % multiple);
        break;
    case Exhibit.DateTime.YEAR:
        clearInYear(date2);
        
        x = date2.getUTCFullYear();
        date2.setUTCFullYear(x + (multiple - (x % multiple)) % multiple);
        break;
    case Exhibit.DateTime.DECADE:
        clearInYear(date2);
        date2.setUTCFullYear(Math.ceil(date2.getUTCFullYear() / 10) * 10);
        break;
    case Exhibit.DateTime.CENTURY:
        clearInYear(date2);
        date2.setUTCFullYear(Math.ceil(date2.getUTCFullYear() / 100) * 100);
        break;
    case Exhibit.DateTime.MILLENNIUM:
        clearInYear(date2);
        date2.setUTCFullYear(Math.ceil(date2.getUTCFullYear() / 1000) * 1000);
        break;
    }

    if (!usedRoundDown) {
        date.setTime(date2.getTime() - timeShift);
    }
};

/**
 * Increments a date object by a specified interval, taking into
 * consideration the timezone.
 *
 * @param {Date} date The date object to increment.
 * @param {Number} intervalUnit A constant, integer index specifying an
 *   interval, e.g. Exhibit.DateTime.HOUR.
 * @param {Number} timeZone The timezone offset in hours.
 */
Exhibit.DateTime.incrementByInterval = function(date, intervalUnit, timeZone) {
    timeZone = (typeof timeZone === 'undefined') ? 0 : timeZone;
    var timeShift, date2;
    timeShift = timeZone * 
        Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.HOUR];
        
    date2 = new Date(date.getTime() + timeShift);

    switch(intervalUnit) {
    case Exhibit.DateTime.MILLISECOND:
        date2.setTime(date2.getTime() + 1);
        break;
    case Exhibit.DateTime.SECOND:
        date2.setTime(date2.getTime() + 1000);
        break;
    case Exhibit.DateTime.MINUTE:
        date2.setTime(date2.getTime() + 
            Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.MINUTE]);
        break;
    case Exhibit.DateTime.HOUR:
        date2.setTime(date2.getTime() + 
            Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.HOUR]);
        break;
    case Exhibit.DateTime.DAY:
        date2.setUTCDate(date2.getUTCDate() + 1);
        break;
    case Exhibit.DateTime.WEEK:
        date2.setUTCDate(date2.getUTCDate() + 7);
        break;
    case Exhibit.DateTime.MONTH:
        date2.setUTCMonth(date2.getUTCMonth() + 1);
        break;
    case Exhibit.DateTime.YEAR:
        date2.setUTCFullYear(date2.getUTCFullYear() + 1);
        break;
    case Exhibit.DateTime.DECADE:
        date2.setUTCFullYear(date2.getUTCFullYear() + 10);
        break;
    case Exhibit.DateTime.CENTURY:
        date2.setUTCFullYear(date2.getUTCFullYear() + 100);
        break;
    case Exhibit.DateTime.MILLENNIUM:
        date2.setUTCFullYear(date2.getUTCFullYear() + 1000);
        break;
    }

    date.setTime(date2.getTime() - timeShift);
};

/**
 * Returns a new date object with the given time offset removed.
 *
 * @param {Date} date The starting date.
 * @param {Number} timeZone A timezone specified in an hour offset to remove.
 * @returns {Date} A new date object with the offset removed.
 */
Exhibit.DateTime.removeTimeZoneOffset = function(date, timeZone) {
    return new Date(date.getTime() + 
        timeZone * Exhibit.DateTime.gregorianUnitLengths[Exhibit.DateTime.HOUR]);
};

/**
 * Returns the timezone of the user's browser.  This is expressed as the
 * number of hours one would have to add to the local time to equal GMT,
 * NOT the numbers one would have to add to GMT to equal local time, as
 * timezones are normally expressed.
 *
 * @returns {Number} The timezone in the user's locale in hours.
 */
Exhibit.DateTime.getTimezone = function() {
    var d = new Date().getTimezoneOffset();
    return d / -60;
};

/**
 * Zeroes (UTC) all time components of the provided date object.
 *
 * @static
 * @param {Date} date The Date object to modify.
 * @returns {Date} The modified Date object.
 */
Exhibit.DateTime.zeroTimeUTC = function(date) {
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
};
