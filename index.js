const els = {
    nameIn: document.querySelector('#name-in'),
    nameOut: document.querySelector('#name-out'),
    dateOut: document.querySelector('#date-out'),
    inDiv: document.querySelector('#in'),
    outDiv: document.querySelector('#out'),
    startNowCheckbox: document.querySelector('#start-now'),
    datePickerIn: document.querySelector('#datepicker-in'),
    datePickerOut: document.querySelector('#datepicker-out'),
    units: document.querySelector('#units'),
};

const url = new URL(window.location);

function startCounting(){
    url.searchParams.set('name', els.nameIn.value);
    const date = els.startNowCheckbox.checked ? Date.now() : (new Date(els.datePickerIn.value) - 0);
    url.searchParams.set('date', date);
    window.location.search = url.search;
}

function resetCount(){
    url.searchParams.set('date', Date.now());
    window.location.search = url.search;
}

function convertISODate(date) {
    return new Date(
        // shift based on timezone
        date - new Date(date).getTimezoneOffset() * 60 * 1000
    // convert to yyyy-MM-ddThh:mm:ss.SSSZ format
    ).toISOString()
    // cut off seconds, miliseconds, and Z on end of string
    // the Z indicates ISO and that is not accepted by datetime-local
    .substr(0, 16);
}

function showHideDateIn(){
    els.datePickerIn.required = !els.startNowCheckbox.checked;
    if(els.datePickerIn.required) {
        els.datePickerIn.value = convertISODate(Date.now());
        els.datePickerIn.classList.remove('hidden');
    } else {
        els.datePickerIn.classList.add('hidden');
    }
}

function main(){
    // needed when reversing back into page
    // checkbox might be unchecked
    setTimeout(showHideDateIn, 100); 
    if(url.search === '') return;
    const name = url.searchParams.get('name');
    els.inDiv.classList.add('hidden');
    els.outDiv.classList.remove('hidden');
    els.nameOut.innerHTML = name;
    document.title = `since "${name}"`;
    let date = new Date(parseInt(url.searchParams.get('date')));
    els.datePickerOut.value = convertISODate(date);
    els.datePickerOut.onchange= () => {
        url.searchParams.set('date', new Date(els.datePickerOut.value) - 0);
        window.history.pushState({ path: url.toString() }, '', url.toString());
    };
    setInterval(() => {
        date = new Date(els.datePickerOut.value);
        const now = Date.now()
        const in_future = now < date - 0;
        const diff = Math.abs(now - date);
        switch(els.units.value) {
        case "mix":
            const time = {
                year: Math.floor(diff / YEAR),
                week: Math.floor(diff / WEEK) % 52,
                day: Math.floor(diff / DAY) % 7,
                hour: Math.floor(diff / HOUR) % 24,
                minute: Math.floor(diff / MINUTE) % 60,
                second: Math.floor(diff / SECOND) % 60,
                milisecond: diff % SECOND,
            };
            els.dateOut.innerHTML = Object.entries(time)
                .filter(([, value]) => value !== 0)
                .map(([unit, value]) => (in_future ? '-' : '') + getTimeString(value, unit))
                .join('<br>');
            break;
        case "year":
        case "month":
        case "week":
        case "day":
        case "hour":
        case "minute":
        case "second":
        case "millisecond":
            els.dateOut.innerHTML = getTimeString(diff / UNITS[els.units.value], els.units.value);
            break;
        default:
            throw new Error('Unexpected unit');
            break;
        }
    }, 100);
}

main();
