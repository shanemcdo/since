const createRemoveBookmarkButton = document.getElementById('create-remove-bookmark');
const resetButton = document.getElementById('reset-button');
const datePickerOut = document.getElementById('datepicker-out');
createRemoveBookmarkButton.classList.remove('hidden');

let bookmarkId = null

async function hasBookmark() {
	if(bookmarkId != null) return true;
	const results = await chrome.runtime.sendMessage({ type: 'has', url: window.location.href })
	if(results.length > 0) {
		bookmarkId = results[0].id;
		return true;
	}
	return false;
}

async function removeBookmark() {
	if(bookmarkId === null) return;
	await chrome.runtime.sendMessage({ type: 'remove', id: bookmarkId });
	bookmarkId = null;
	setUpButton(false);
}

function setUpButton(hasBookmark) {
	if(hasBookmark) {
		createRemoveBookmarkButton.innerText = 'Remove Bookmark';
		createRemoveBookmarkButton.onclick = removeBookmark;
	} else { 
		createRemoveBookmarkButton.innerText = 'Create Bookmark';
		createRemoveBookmarkButton.onclick = async () => {
			bookmarkId = await chrome.runtime.sendMessage({ type: 'create', url: window.location.href });
			setUpButton(true);
		}
	}
}

async function updateBookmark(url) {
	if(await hasBookmark()) {
		await chrome.runtime.sendMessage({ type: 'update', id: bookmarkId, url });
	}
}

function resetCount(url, date = null){
    if(date === null) date = Date.now();
}

hasBookmark().then(setUpButton);
resetButton.onclick = async () => {
	let url = new URL(window.location);
    url.searchParams.set('date', Date.now());
	await updateBookmark(url);
	window.location.href = url.toString();
}
datePickerOut.onchange = async () => {
	let url = new URL(window.location);
	console.log(datePickerOut.value);
    url.searchParams.set('date', new Date(datePickerOut.value) - 0);
    window.history.pushState({ path: url.toString() }, '', url.toString());
	await updateBookmark(url);
};

function newEl(tag, parent = null) {
	const el = document.createElement(tag);
	if(parent) {
		parent.appendChild(el);
	}
	return el;
}

async function getBookmarks() {
	return await chrome.runtime.sendMessage({ type: 'getAll' });
};

getBookmarks().then(results => {
	const divTag = newEl('div', document.body);
	divTag.style.position = 'absolute';
	divTag.style.top = '10px';
	divTag.style.left = '10px';
	divTag.style['text-align'] = 'left';
	const listTag = newEl('ul', divTag);
	const buttonTag = newEl('button', divTag);
	buttonTag.innerText = 'Hide';
	buttonTag.onclick = () => {
		if(buttonTag.innerText === 'Hide') {
			buttonTag.innerText = 'Show';
			listTag.style.display = 'none';
		} else {
			buttonTag.innerText = 'Hide';
			listTag.style.display = '';
		}
	}
	results
		.toSorted((a, b) => a.url < b.url ? -1 : 1)
		.map(result => [result.id, new URL(result.url)])
		.forEach(([id, url]) => {
			if(id === bookmarkId) return;
			const liTag = newEl('li', listTag);
			const aTag = newEl('a', liTag);
			aTag.innerText = url.searchParams.get('name');
			aTag.href = url.toString();
			setInterval(async () => {
				const url = new URL(await chrome.runtime.sendMessage({ type: 'getUrl', id }));
				aTag.innerText = url.searchParams.get('name');
				aTag.href = url.toString();
			}, 100)
		});
});
