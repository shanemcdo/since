const newEl = tag => document.createElement(tag);
const els = {
	bookmarkList: document.getElementById('bookmark-list'),
	timerNameInput: document.getElementById('timer-name'),
	newTimerButton: document.getElementById('new-timer-button'),
};

const BASE_URL = 'shanemcd.net/since/';

async function createBookmark(url) {
	return await chrome.bookmarks.create({
		url: url.toString(),
		title: `since "${url.searchParams.get('name')}"`
	});
};

function msToHuman(ms) {
	const calc = (ms, unit) => (ms / unit).toFixed(1);
	if(ms > YEAR) return getTimeString(calc(ms, YEAR), 'Year');
	if(ms > MONTH) return getTimeString(calc(ms, MONTH), 'Month');
	if(ms > WEEK) return getTimeString(calc(ms, WEEK), 'Week');
	if(ms > DAY) return getTimeString(calc(ms, DAY), 'Day');
	if(ms > HOUR) return getTimeString(calc(ms, HOUR), 'Hour');
	if(ms > MINUTE) return getTimeString(calc(ms, MINUTE), 'Minute');
	if(ms > SECOND) return getTimeString(calc(ms, SECOND), 'Second');
	return getTimeString(ms, 'Milisecond');
};

function addTimerToList([id, url]) {
	const li = newEl('li');
	const title = newEl('a');
	title.innerText = url.searchParams.get('name');
	title.href = url;
	title.target = '_blank';
	li.appendChild(title);
	const date = newEl('span');
	const interval = setInterval(() => {
		const diff = Date.now() - url.searchParams.get('date');
		date.innerText = msToHuman(diff);
	}, 50);
	li.appendChild(date);
	const resetButton = newEl('button');
	resetButton.innerText = 'Reset';
	resetButton.onclick = () => {
		url.searchParams.set('date', Date.now());
		chrome.bookmarks.update(
			id,
			{ url: url.toString() }
		);
	};
	li.appendChild(resetButton);
	const removeButton = newEl('button');
	removeButton.innerText = 'Remove';
	removeButton.onclick = () => {
		clearInterval(interval);
		els.bookmarkList.removeChild(li);
		chrome.bookmarks.remove(id);
	};
	li.appendChild(removeButton);
	els.bookmarkList.appendChild(li);
}

els.newTimerButton.onclick = async () => {
	if(els.timerNameInput.value === '') return;
	const url = new URL('https://' + BASE_URL);
	url.searchParams.set('name', els.timerNameInput.value);
	url.searchParams.set('date', Date.now());
	const bookmark = await createBookmark(url);
	addTimerToList([bookmark.id, url]);
	els.timerNameInput.value = '';
};

els.timerNameInput.addEventListener('keydown', event => {
	if(event.keyCode == 13) { // Enter 
		els.newTimerButton.click();
	}
});

chrome.bookmarks.search({ query: BASE_URL }, results => {
	results.toSorted()
		.map(result => [result.id, new URL(result.url)])
		.forEach(addTimerToList);
});
