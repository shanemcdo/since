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
    console.table({
        before, after, beforeWithComma
    })
    return [beforeWithComma, after].join('.');
}

function getTimeString(time, unit, precision = null){
    time = formatNumber(time, precision);
    return `${time} ${unit}${time === 1 || time === '1.0' ? '' : 's'}`;
}

function msToHuman(ms, precision = 1) {
    const calc = (ms, unit) => (ms / unit).toFixed(precision);
    const func = () => {
        const abs = Math.abs(ms);
        if(abs > YEAR) return getTimeString(calc(abs, YEAR), 'Year');
        if(abs > MONTH) return getTimeString(calc(abs, MONTH), 'Month');
        if(abs > WEEK) return getTimeString(calc(abs, WEEK), 'Week');
        if(abs > DAY) return getTimeString(calc(abs, DAY), 'Day');
        if(abs > HOUR) return getTimeString(calc(abs, HOUR), 'Hour');
        if(abs > MINUTE) return getTimeString(calc(abs, MINUTE), 'Minute');
        if(abs > SECOND) return getTimeString(calc(abs, SECOND), 'Second');
        return getTimeString(abs, 'Milisecond');
    }
    return (ms < 0 ? '-' : ' ') + func();
};

