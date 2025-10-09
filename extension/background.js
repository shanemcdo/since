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
