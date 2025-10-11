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

function addItemToList(url, list, itemName = null) {
	const name = itemName ?? url.searchParams.get('name');
	if(name.includes('/')) {
		const [folder, ...rest] = name.split('/');
		return addItemToList(
			url,
			getList(folder, list),
			rest.join('/')
		);
	}
	const liTag = newEl('li', list);
	const aTag = newEl('a', liTag);
	aTag.innerText = name;
	aTag.href = url.toString();
}

function removeItemFromList(url, list, rootList) {
	for(const aTag of list.querySelectorAll('a')) {
		if(aTag.href !== url) continue;
		const liTag = aTag.parentNode;
		const ulTag = liTag.parentNode;
		ulTag.removeChild(liTag);
		if(ulTag.children.length === 0 && list !== rootList) {
			const detailsTag = ulTag.parentNode;
			detailsTag.parentNode.removeChild(detailsTag);
		}
		return;
	};
}

// set up list in top left
(() => {
	const detailsTag = newEl('details', document.body);
	detailsTag.style.position = 'absolute';
	detailsTag.style.top = '10px';
	detailsTag.style.left = '10px';
	detailsTag.style['text-align'] = 'left';
	detailsTag.open = true;
	const summaryTag = newEl('summary', detailsTag);
	summaryTag.innerText = 'Bookmarks';
	const listTag = newEl('ul', detailsTag);
	setInterval(async () => {
		const urls = [...listTag.querySelectorAll('a').entries().map(([_, x]) => x.href)];
		const results = await getBookmarks();
		results
			.toSorted((a, b) => a.url < b.url ? -1 : 1)
			.forEach(bookmark => {
				const url = new URL(bookmark.url);
				if(!urls.includes(url.toString())) {
					addItemToList(url, listTag);
				}
			});
		const results_urls = [... results.map(x => x.url)];
		urls.forEach(url => {
			if(!results_urls.includes(url)) {
				removeItemFromList(url, listTag, listTag);
			}
		});
	}, 100);
})();
