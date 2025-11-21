const SECOND = 1000;
const MINUTE = 60  * SECOND;
const HOUR   = 60  * MINUTE;
const DAY    = 24  * HOUR;
const WEEK   = 7   * DAY;
const MONTH  = 31  * DAY;
const YEAR   = 365 * DAY;

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

function getTimeString(time, unit){
    return `${time} ${unit}${time === 1 || time === '1.0' ? '' : 's'}`;
}
