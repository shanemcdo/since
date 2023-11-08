const els = {
    name_in: document.querySelector('#name-in'),
    name_out: document.querySelector('#name-out'),
    date_out: document.querySelector('#date-out'),
    in_div: document.querySelector('#in'),
    out_div: document.querySelector('#out'),
};

function parse_search(){
    return window.location.search
        .split(/&|\?/)
        .filter(x => x)
        .reduce((accum, x) => {
            const [key, val] = x.split('=').map(decodeURIComponent)
            return {...accum, [key]: val};
        }, {});
}

function start_counting(){
    const now = new Date();
    window.location.search = `name=${els.name_in.value}&date=${now.valueOf()}`;
}

function reset_count(){
    const now = new Date();
    window.location.search = `name=${els.name_out.innerHTML}&date=${now.valueOf()}`;
}

function get_time_string(time, unit){
    return `${time} ${unit}${time === 1 ? '' : 's'}`;
}

function main(){
    if(window.location.search === '') return;
    els.in_div.classList.add('hidden');
    els.out_div.classList.remove('hidden');
    const get = parse_search();
    els.name_out.innerHTML = get.name;
    document.title = `since "${get.name}"`;
    const date = new Date(parseInt(get.date));
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
