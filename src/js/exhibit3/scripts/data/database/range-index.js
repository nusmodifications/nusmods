/**
 * @fileOverview Class for indexing sortable property value ranges.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * Builds a Exhibit.Database.RangeIndex object.
 *
 * @public
 * @constructor
 * @class
 * @param {Exhibit.Set} items Subjects with values to index.
 * @param {Function} getter Function to return a value given the item.
 */
Exhibit.Database.RangeIndex = function(items, getter) {
    var pairs = [];
    items.visit(function(item) {
        getter(item, function(value) {
            pairs.push({ item: item, value: value });
        });
    });
    
    pairs.sort(function(p1, p2) {
        var c = p1.value - p2.value;
        return (isNaN(c) === false) ? c : p1.value.localeCompare(p2.value);
    });
    
    this._pairs = pairs;
};

/**
 * Returns the number of values in the index.
 *
 * @returns {Number} The number of values in the index.
 */
Exhibit.Database.RangeIndex.prototype.getCount = function() {
    return this._pairs.length;
};

/**
 * Returns the smallest numeric value in the index, for numeric ranges.
 *
 * @returns {Number} The smallest value in the index.
 */
Exhibit.Database.RangeIndex.prototype.getMin = function() {
    return this._pairs.length > 0 ?
        this._pairs[0].value :
        Number.POSITIVE_INFINITY;
};

/**
 * Returns the largest numeric value in the index, for numeric ranges.
 *
 * @returns {Number} The largest value in the index.
 */
Exhibit.Database.RangeIndex.prototype.getMax = function() {
    return this._pairs.length > 0 ?
        this._pairs[this._pairs.length - 1].value :
        Number.NEGATIVE_INFINITY;
};

/**
 * Using a visitor function, provide it as an argument every item in
 * this index that falls in the provided open or closed range.
 *
 * @param {Function} visitor Function to handle each item with values in range.
 * @param {Number} min Lower bound of range.
 * @param {Number} max Upper bound of range.
 * @param {Boolean} inclusive Whether max is included in bounds or not.
 */
Exhibit.Database.RangeIndex.prototype.getRange = function(visitor, min, max, inclusive) {
    var startIndex, pairs, l, pair, value;

    startIndex = this._indexOf(min);
    pairs = this._pairs;
    l = pairs.length;

    inclusive = !!inclusive;
    while (startIndex < l) {
        pair = pairs[startIndex++];
        value = pair.value;
        if (value < max || (value === max && inclusive)) {
            visitor(pair.item);
        } else {
            break;
        }
    }
};

/**
 * Build a visitor function to construct a set to hand to getRange,
 * optionally with a filter of acceptable subjects.
 * 
 * @param {Number} min Lower bound of range.
 * @param {Number} max Upper bound of range.
 * @param {Boolean} inclusive Whether max is included in bounds or not.
 * @param {Exhibit.Set} [set] Result set
 * @param {Exhibit.Set} [filter] Only include items in the filter
 * @returns {Exhibit.Set} Filtered items in defined range.
 */
Exhibit.Database.RangeIndex.prototype.getSubjectsInRange = function(min, max, inclusive, set, filter) {
    if (typeof set === "undefined" || set === null) {
        set = new Exhibit.Set();
    }

    var f = (typeof filter !== "undefined" && filter !== null) ?
        function(item) {
            if (filter.contains(item)) {
                set.add(item);
            }
        } :
        function(item) {
            set.add(item);
        };

    this.getRange(f, min, max, inclusive);

    return set;
};

/**
 * Count the number of elements having values in this range between the
 * specified open or closed range of values.
 * 
 * @param {Number} min Lower bound of range.
 * @param {Number} max Upper bound of range.
 * @param {Boolean} inclusive Whether max is included in bounds or not.
 * @returns {Number} The number of items with values in the defined range.
 */
Exhibit.Database.RangeIndex.prototype.countRange = function(min, max, inclusive) {
    var startIndex, endIndex, pairs, l;
    startIndex = this._indexOf(min);
    endIndex = this._indexOf(max);

    if (inclusive) {
        pairs = this._pairs;
        l = pairs.length;
        while (endIndex < l) {
            if (pairs[endIndex].value === max) {
                endIndex++;
            } else {
                break;
            }
        }
    }
    return endIndex - startIndex;
};

/**
 * Find and return the closest preceding numeric index for a given value
 * if it falls inside this range.
 *
 * @private
 * @param {Number} v The value to find the closest index for.
 * @returns {Number} The closest preceding index to the given value.
 */
Exhibit.Database.RangeIndex.prototype._indexOf = function(v) {
    var pairs, from, to, middle, v2;

    pairs = this._pairs;
    if (pairs.length === 0 || pairs[0].value >= v) {
        return 0;
    }

    from = 0;
    to = pairs.length;
    while (from + 1 < to) {
        middle = (from + to) >> 1;
        v2 = pairs[middle].value;
        if (v2 >= v) {
            to = middle;
        } else {
            from = middle;
        }
    }

    return to;
};
