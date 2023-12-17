async function createBookmark(url) {
	return await chrome.bookmarks.create({
		url: url.toString(),
		title: `since "${url.searchParams.get('name')}"`
	});
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch(request.type) {
	case 'has':
			chrome.bookmarks.search({ url: request.url }, sendResponse);
			break;
	case 'remove':
			chrome.bookmarks.remove(request.id, sendResponse);
			break;
	case 'create':
			createBookmark(new URL(request.url)).then(bookmark => sendResponse(bookmark.id));
			break
	default:
		throw new Error(`Invalid request type ${type}`);
	}
	// This needs to be here to allow async
	return true;
});
