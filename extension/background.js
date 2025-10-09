const BASE_URL = 'shanemcd.net/since/';
const BOOKMARK_FOLDER_TITLE = '"Since" Extension Bookmarks';

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
			break;
	case 'update':
			chrome.bookmarks.get(request.id, ([bookmark]) => {
				chrome.bookmarks.update(request.id, { url: request.url });
				sendResponse(null);
			})
			break;
	case 'getUrl':
			chrome.bookmarks.get(request.id, x => sendResponse(x[0].url));
			break;
	case 'getAll':
			chrome.bookmarks.search({ query: BASE_URL }, sendResponse);
			break;
	default:
		throw new Error(`Invalid request type ${type}`);
	}
	// This needs to be here to allow async
	return true;
});
