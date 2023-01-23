const els = {
    name_in: document.querySelector('#name-in'),
    name_out: document.querySelector('#name-out'),
    date_out: document.querySelector('#date-out'),
    in_div: document.querySelector('#in'),
    out_div: document.querySelector('#out'),
};

function parse_search(){
    const get = {};
    window.location.search
        .split(/&|\?/)
        .filter(x => x)
        .forEach(x => {
            let [key, val] = x.split('=').map(decodeURIComponent);
            get[key] = val;
        });
    return get;
}

function start_counting(){
    const now = new Date();
    window.location.search = `name=${els.name_in.value}&date=${now.valueOf()}`;
}

function main(){
    if(window.location.search == '') return;
    els.in_div.classList.add('hidden');
    els.out_div.classList.remove('hidden');
    const get = parse_search();
    window.location.search
        .split(/&|\?/)
        .filter(x => x)
        .forEach(x => {
            let [key, val] = x.split('=').map(decodeURIComponent);
            get[key] = val;
        });
    els.name_out.innerHTML = get.name;
    const date = new Date(parseInt(get.date));
    setInterval(() => {
        const now = new Date();
        const diff = now - date;
        const time = {
            ms: diff % 1000,
            secs: Math.floor(diff / 1000) % 60,
            mins: Math.floor(diff / 1000 / 60) % 60,
            hrs: Math.floor(diff / 1000 / 60 / 60) % 24,
            days: Math.floor(diff / 1000 / 60 / 60 / 24) % 7,
            weeks: Math.floor(diff / 1000 / 60 / 60 / 24 / 7) % 52,
            years: Math.floor(diff / 1000 / 60 / 60 / 24 / 7 / 52),
        };
        const time_strings = [];
        if(time.years > 0) time_strings.push(`${time.years} years`);
        if(time.weeks > 0) time_strings.push(`${time.weeks} weeks`);
        if(time.days > 0) time_strings.push(`${time.days} days`);
        if(time.hrs > 0) time_strings.push(`${time.hrs} hours`);
        if(time.mins > 0) time_strings.push(`${time.mins} minutes`);
        if(time.secs > 0) time_strings.push(`${time.secs} seconds`);
        if(time.ms > 0) time_strings.push(`${time.ms} miliseconds`);
        els.date_out.innerHTML = time_strings.join('<br>');
    }, 100);
}

main();
