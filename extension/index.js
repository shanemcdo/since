const els = {
	bookmarkList: document.getElementById('bookmark-list'),
	searchInput: document.getElementById('search'),
	timerNameInput: document.getElementById('timer-name'),
	newTimerButton: document.getElementById('new-timer-button'),
	sortDateButton: document.getElementById('sort-date-button'),
	sortNameButton: document.getElementById('sort-name-button'),
};

const BASE_URL = 'shanemcd.net/since/';
const BOOKMARK_FOLDER_TITLE = '"Since" Extension Bookmarks';
let extension_folder_id = null;

async function get_extension_folder_id() { 
	const results = await chrome.bookmarks.search({ title: BOOKMARK_FOLDER_TITLE });
	if(results.length > 0) {
		return results[0].id;
	}
	return (await chrome.bookmarks.create({ title: BOOKMARK_FOLDER_TITLE })).id;
};

async function createBookmark(url) {
	if(extension_folder_id === null) {
		extension_folder_id = await get_extension_folder_id();
	}
	return await chrome.bookmarks.create({
		parentId: extension_folder_id,
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

function getList(folderName, bookmarkList) {
	const lists = bookmarkList.querySelectorAll('details')
	for(const list of lists) {
		if(list.querySelector('summary').innerText == folderName) {
			return list.querySelector('ul');
		}
	}
	const details = newEl('details', bookmarkList);
	const summary = newEl('summary', details);
	summary.innerText = folderName;
	const ul = newEl('ul', details);
	return ul;
}

function addTimerToList(id, url, oldLi = null, oldPreviousTimes = null, bookmarkList = null, timerName = null) {
	let list = bookmarkList ?? els.bookmarkList
	let name = timerName ?? url.searchParams.get('name');
	if(name.includes('/')) { 
		const [folder, ...rest] = name.split('/');
		return addTimerToList(
			id,
			url,
			oldLi,
			oldPreviousTimes,
			getList(folder, list),
			rest.join('/'),
		);
	}
	const previousTimes = oldPreviousTimes ?? [];
	const li = oldLi ?? newEl('li', list);
	const title = newEl('a', li);
	title.innerText = name;
	title.target = '_blank';
	const date = newEl('span', li);
	const interval = setInterval(() => {
		const diff = Date.now() - url.searchParams.get('date');
		date.innerText = msToHuman(diff);
		title.href = url.toString();
	}, 50);
	let isLocked = url.searchParams.get('locked', 'Boolean') === 'true';
	const lockButton = newEl('button', li);
	lockButton.innerText = isLocked ? '🔒' : '🔓';
	lockButton.onclick = () => {
		isLocked = !isLocked;
		lockButton.innerText = isLocked ? '🔒' : '🔓';
		if(isLocked) {
			resetButton.disabled = true;
			removeButton.disabled = true;
			undoButton.disabled = true;
		} else {
			resetButton.disabled = false;
			removeButton.disabled = false;
			undoButton.disabled = previousTimes.length === 0;
		}
		url.searchParams.set('locked', isLocked );
		chrome.bookmarks.update(id, { url: url.toString() });
	};
	var resetButton = newEl('button', li);
	resetButton.innerText = 'Reset';
	resetButton.disabled = isLocked;
	resetButton.onclick = () => {
		previousTimes.push(url.searchParams.get('date'))
		undoButton.disabled = false
		url.searchParams.set('date', Date.now());
		chrome.bookmarks.update(id, { url: url.toString() });
	};
	var removeButton = newEl('button', li);
	removeButton.innerText = 'Remove';
	removeButton.disabled = isLocked;
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

function fillBookmarks(sort_func) {
	chrome.bookmarks.search({ query: BASE_URL }, results => {
		results
			.toSorted(sort_func)
			.map(result => [result.id, new URL(result.url)])
			.forEach(arr => addTimerToList(...arr));
	});
}

// TODO: doesn't work with folders
function sortBookmarks(sort_func) {
	const lis = [];
	const children = [...els.bookmarkList.children];
	for (const li of children) {
		lis.push(li);
		els.bookmarkList.removeChild(li);
	}
	lis
		.toSorted((a, b) => sort_func(
			{ url: a.children[0].href },
			{ url: b.children[0].href },
		))
		.forEach(li => els.bookmarkList.appendChild(li));
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

els.searchInput.addEventListener('keyup', event => {
	if(els.searchInput.value === '') {
		els.bookmarkList.querySelectorAll('li').forEach(li => {
			li.style.display = '';
		})
		return;
	}
	els.bookmarkList.querySelectorAll('li').forEach(li => {
		li.style.display = li.children[0].innerHTML.toLowerCase().includes(els.searchInput.value.toLowerCase()) ? '' : 'None';
	})
});

els.timerNameInput.addEventListener('keydown', event => {
	if(event.keyCode == 13) { // Enter 
		els.newTimerButton.click();
	}
});

const sort_url_func = (a, b) => a.url < b.url ? -1 : 1;
const sort_date_func = (a, b) => {
	const a_date = new URL(a.url).searchParams.get('date');
	const b_date = new URL(b.url).searchParams.get('date');
	return a_date > b_date ? -1 : 1;
};

els.sortDateButton.onclick = () => {
	els.sortDateButton.style.display = 'none';
	els.sortNameButton.style.display = '';
	els.bookmarkList.innerHTML = '';
	fillBookmarks(sort_date_func);
};

els.sortNameButton.onclick = () => {
	els.sortNameButton.style.display = 'none';
	els.sortDateButton.style.display = '';
	els.bookmarkList.innerHTML = '';
	fillBookmarks(sort_url_func);
};

fillBookmarks(sort_url_func);
