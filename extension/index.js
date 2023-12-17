const newEl = tag => document.createElement(tag);
const bookmarkList = document.getElementById('bookmarkList');


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

chrome.bookmarks.search({ query: 'shanemcd.net/since/' }, results => {
	results.toSorted().forEach(result => {
		let url = new URL(result.url);
		const li = newEl('li');
		const title = newEl('a');
		title.innerText = url.searchParams.get('name');
		title.href = result.url;
		title.target = '_blank';
		li.appendChild(title);
		const date = newEl('span');
		setInterval(() => {
			const diff = Date.now() - url.searchParams.get('date');
			date.innerText = msToHuman(diff);
		}, 50);
		li.appendChild(date);
		const resetButton = newEl('button');
		resetButton.innerText = 'reset';
		resetButton.onclick = () => {
			url.searchParams.set('date', Date.now());
			chrome.bookmarks.update(
				result.id,
				{ url: url.toString() }
			);
		};
		li.appendChild(resetButton);
		bookmarkList.appendChild(li);
	});
});
