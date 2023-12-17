const els = {
    name_in: document.querySelector('#name-in'),
    name_out: document.querySelector('#name-out'),
    date_out: document.querySelector('#date-out'),
    in_div: document.querySelector('#in'),
    out_div: document.querySelector('#out'),
};

const url = new URL(window.location);

function start_counting(){
    url.searchParam.set('name', els.name_in.value);
    url.searchParam.set('date', Date.now());
    window.location.search = url.search;
}

function reset_count(){
    url.searchParam.set('date', Date.now());
    window.location.search = url.search;
}

function get_time_string(time, unit){
    return `${time} ${unit}${time === 1 ? '' : 's'}`;
}

function main(){
    if(url.search === '') return;
    const name = url.searchParams.get('name');
    const date = url.searchParams.get('date');
    els.in_div.classList.add('hidden');
    els.out_div.classList.remove('hidden');
    els.name_out.innerHTML = name;
    document.title = `since "${name}"`;
    const date = new Date(parseInt(date));
    setInterval(() => {
        const diff = new Date() - date;
        const time = {
            year: Math.floor(diff / 1000 / 60 / 60 / 24 / 7 / 52),
            week: Math.floor(diff / 1000 / 60 / 60 / 24 / 7) % 52,
            day: Math.floor(diff / 1000 / 60 / 60 / 24) % 7,
            hour: Math.floor(diff / 1000 / 60 / 60) % 24,
            minute: Math.floor(diff / 1000 / 60) % 60,
            second: Math.floor(diff / 1000) % 60,
            milisecond: diff % 1000,
        };
        els.date_out.innerHTML = Object.entries(time)
            .filter(([_, value]) => value !== 0)
            .map(([unit, value]) => get_time_string(value, unit))
            .join('<br>');
    }, 100);
}

main();
