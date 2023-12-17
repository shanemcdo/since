const els = {
    nameIn: document.querySelector('#name-in'),
    nameOut: document.querySelector('#name-out'),
    dateOut: document.querySelector('#date-out'),
    inDiv: document.querySelector('#in'),
    outDiv: document.querySelector('#out'),
};

const url = new URL(window.location);

function startCounting(){
    url.searchParams.set('name', els.nameIn.value);
    url.searchParams.set('date', Date.now());
    window.location.search = url.search;
}

function resetCount(){
    url.searchParams.set('date', Date.now());
    window.location.search = url.search;
}

function getTimeString(time, unit){
    return `${time} ${unit}${time === 1 ? '' : 's'}`;
}

function main(){
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
            year: Math.floor(diff / 1000 / 60 / 60 / 24 / 7 / 52),
            week: Math.floor(diff / 1000 / 60 / 60 / 24 / 7) % 52,
            day: Math.floor(diff / 1000 / 60 / 60 / 24) % 7,
            hour: Math.floor(diff / 1000 / 60 / 60) % 24,
            minute: Math.floor(diff / 1000 / 60) % 60,
            second: Math.floor(diff / 1000) % 60,
            milisecond: diff % 1000,
        };
        els.dateOut.innerHTML = Object.entries(time)
            .filter(([, value]) => value !== 0)
            .map(([unit, value]) => getTimeString(value, unit))
            .join('<br>');
    }, 100);
}

main();
