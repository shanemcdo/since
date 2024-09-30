const createRemoveBookmarkButton = document.getElementById('create-remove-bookmark');
const resetButton = document.getElementById('reset-button');
const datePickerOut = document.getElementById('#datepicker-out');
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

function updateBookmark(url) {
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
datePickerOut.removeEventListener('change');
datePickerOut.addEventListener('change', async () => {
	let url = new URL(window.location);
    url.searchParams.set('date', new Date(els.datePickerOut.value) - 0);
    window.history.pushState({ path: url.toString() }, '', url.toString());
    datePickerOut.value = convertISODate(date);
	await updateBookmark(url);
});
