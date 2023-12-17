const newEl = tag => document.createElement(tag);
const bookmarkList = document.getElementById('bookmark-list');
const timerNameInput = document.getElementById('timer-name');
const newTimerButton = document.getElementById('new-timer-button');

const BASE_URL = 'shanemcd.net/since/';
const SECOND = 1000;
const MINUTE = 60  * SECOND;
const HOUR   = 60  * MINUTE;
const DAY    = 24  * HOUR;
const WEEK   = 7   * DAY;
const MONTH  = 31  * DAY;
const YEAR   = 365 * DAY

function msToHuman(ms) {
	const calc = (ms, unit) => (ms / unit).toFixed(1);
	if(ms > YEAR) return `${calc(ms, YEAR)} Years`;
	if(ms > MONTH) return `${calc(ms, MONTH)} Months`;
	if(ms > WEEK) return `${calc(ms, WEEK)} Weeks`;
	if(ms > DAY) return `${calc(ms, DAY)} Days`;
	if(ms > HOUR) return `${calc(ms, HOUR)} Hours`;
	if(ms > MINUTE) return `${calc(ms, MINUTE)} Minutes`;
	if(ms > SECOND) return `${calc(ms, SECOND)} Seconds`;
	return `${ms} Miliseconds`
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
		bookmarkList.removeChild(li);
		chrome.bookmarks.remove(id);
	};
	li.appendChild(removeButton);
	bookmarkList.appendChild(li);
}


async function newTimer() {
	const url = new URL('https://' + BASE_URL);
	url.searchParams.set('name', timerNameInput.value);
	url.searchParams.set('date', Date.now());
	const bookmark = await chrome.bookmarks.create({
		url: url.toString(),
		title: `since "${url.searchParams.get('name')}"`
	});
	addTimerToList([bookmark.id, url]);
}

chrome.bookmarks.search({ query: BASE_URL }, results => {
	results.toSorted()
		.map(result => [result.id, new URL(result.url)])
		.forEach(addTimerToList);
});
newTimerButton.onclick = newTimer;
