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

function newEl(tag, parent = null) {
	const el = document.createElement(tag);
	if(parent) {
		parent.appendChild(el);
	}
	return el;
}

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

function addTimerToList(id, url, oldLi = null, oldPreviousTimes = null) {
	const previousTimes = oldPreviousTimes ?? [];
	const li = oldLi ?? newEl('li', els.bookmarkList);
	const title = newEl('a', li);
	title.innerText = url.searchParams.get('name');
	title.target = '_blank';
	const date = newEl('span', li);
	const interval = setInterval(() => {
		const diff = Date.now() - url.searchParams.get('date');
		date.innerText = msToHuman(diff);
		title.href = url.toString();
	}, 50);
	const resetButton = newEl('button', li);
	resetButton.innerText = 'Reset';
	resetButton.onclick = () => {
		previousTimes.push(url.searchParams.get('date'))
		undoButton.disabled = false
		url.searchParams.set('date', Date.now());
		chrome.bookmarks.update(id, { url: url.toString() });
	};
	const removeButton = newEl('button', li);
	removeButton.innerText = 'Remove';
	removeButton.onclick = () => {
		clearInterval(interval);
		chrome.bookmarks.remove(id);
		li.innerHTML = '';
		for(let i = 0; i < 4; i++) {
			newEl('div', li);
		}
		const undoButton = newEl('button', li);
		undoButton.innerText = 'Undo';
		undoButton.onclick = async () => {
			li.innerHTML = '';
			const bookmark = await createBookmark(url);
			addTimerToList(bookmark.id, url, li, previousTimes);
		};

	};
	// needs to be var for hoisting into resetButton onclick
	var undoButton = newEl('button', li);
	undoButton.disabled = previousTimes.length <= 0;
	undoButton.innerText = 'Undo';
	undoButton.onclick = () => {
		url.searchParams.set('date', previousTimes.pop())
		chrome.bookmarks.update(id, { url: url.toString() });
		if(previousTimes.length < 1) {
			undoButton.disabled = true;
		}
	};
}

els.newTimerButton.onclick = async () => {
	if(els.timerNameInput.value === '') return;
	const url = new URL('https://' + BASE_URL);
	url.searchParams.set('name', els.timerNameInput.value);
	url.searchParams.set('date', Date.now());
	const bookmark = await createBookmark(url);
	addTimerToList(bookmark.id, url);
	els.timerNameInput.value = '';
};

els.timerNameInput.addEventListener('keydown', event => {
	if(event.keyCode == 13) { // Enter 
		els.newTimerButton.click();
	}
});

chrome.bookmarks.search({ query: BASE_URL }, results => {
	results
		.toSorted((a, b) => a.url < b.url ? -1 : 1)
		.map(result => [result.id, new URL(result.url)])
		.forEach(arr => addTimerToList(...arr));
});
