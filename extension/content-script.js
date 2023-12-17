const createRemoveBookmarkButton = document.getElementById('create-remove-bookmark');
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

function removeBookmark() {
	if(bookmarkId === null) return;
	chrome.runtime.sendMessage({ type: 'remove', id: bookmarkId });
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

hasBookmark().then(setUpButton);
