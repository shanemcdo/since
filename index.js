const els = {
    nameIn: document.querySelector('#name-in'),
    nameOut: document.querySelector('#name-out'),
    dateOut: document.querySelector('#date-out'),
    inDiv: document.querySelector('#in'),
    outDiv: document.querySelector('#out'),
    startNowCheckbox: document.querySelector('#start-now'),
    datePicker: document.querySelector('#date'),
};

const url = new URL(window.location);

function startCounting(){
    url.searchParams.set('name', els.nameIn.value);
    const date = els.startNowCheckbox.checked ? Date.now() : (new Date(els.datePicker.value) - 0);
    url.searchParams.set('date', date);
    window.location.search = url.search;
}

function resetCount(){
    url.searchParams.set('date', Date.now());
    window.location.search = url.search;
}

function showHideDate(){
    els.datePicker.required = !els.startNowCheckbox.checked;
    if(els.datePicker.required) {
        els.datePicker.value = new Date(
            // shift based on timezone
            Date.now() - new Date().getTimezoneOffset() * 60 * 1000
        // convert to yyyy-MM-ddThh:mm:ss.SSSZ format
        ).toISOString()
        // cut off seconds, miliseconds, and Z on end of string
        // the Z indicates ISO and that is not accepted by datetime-local
        .substr(0, 16);
        els.datePicker.classList.remove('hidden');
    } else {
        els.datePicker.classList.add('hidden');
    }
}

function main(){
    // needed when reversing back into page
    // checkbox might be unchecked
    setTimeout(showHideDate, 100); 
    if(url.search === '') return;
    const name = url.searchParams.get('name');
    els.inDiv.classList.add('hidden');
    els.outDiv.classList.remove('hidden');
    els.nameOut.innerHTML = name;
    document.title = `since "${name}"`;
    const date = new Date(parseInt(url.searchParams.get('date')));
    setInterval(() => {
        const diff = new Date() - date;
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
            .map(([unit, value]) => getTimeString(value, unit))
            .join('<br>');
    }, 100);
}

main();
