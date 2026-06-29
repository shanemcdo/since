const SECOND = 1000;
const MINUTE = 60  * SECOND;
const HOUR   = 60  * MINUTE;
const DAY    = 24  * HOUR;
const WEEK   = 7   * DAY;
const MONTH  = 31  * DAY;
const YEAR   = 365.25 * DAY;

const UNITS = Object.freeze({
    'millisecond': 1,
    'second': SECOND,
    'minute': MINUTE,
    'hour': HOUR,
    'day': DAY,
    'week': WEEK,
    'month': MONTH,
    'year': YEAR,
});

const SHORT_UNITS = Object.freeze({
    'millisecond': 'ms',
    'second': 's',
    'min': 'min',
    'hr': 'hr',
    'day': 'day',
    'week': 'wk',
    'month': 'mth',
    'year': 'yr',
});

// Whether or not the short unit version needs an s added to the end
// true if requires s
// false if not
const SHORT_UNITS_PLURAL = Object.freeze({
    'millisecond': false,
    'second': false,
    'min': true,
    'hr': true,
    'day': true,
    'week': true,
    'month': true,
    'year': true,
});

function divmod(a, b) {
    return [Math.floor(a / b), a % b];
}

function formatNumber(number, precision = null) {
    if(typeof number === 'number') {
        number = number.toFixed(precision);
    }
    let [before, after] = number.split('.');
    // https://stackoverflow.com/questions/2901102/how-can-i-format-a-number-with-commas-as-thousands-separators
    const beforeWithComma = before.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ','
    );
    const result = [beforeWithComma];
    if(after)
        result.push(after);
    return result.join('.');
}

function getTimeString(time, unit, precision = null){
    time = formatNumber(time, precision);
    return `${time} ${unit}${time === 1 || time === '1.0' ? '' : 's'}`;
}

function msToHuman(ms, precision = 1) {
	const abs = Math.abs(ms);
	const unit = getLargestUnit(abs);
	return (ms < 0 ? '-' : ' ') + getTimeString(
		(abs / UNITS[unit]).toFixed(precision),
		unit
	);
};

function getLargestUnit(ms) {
	for(const [key, val] of Object.entries(UNITS).reverse()) {
		if(ms > val) return key;
	}
	return 'Milisecond';
}

