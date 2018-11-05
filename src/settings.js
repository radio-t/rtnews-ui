// via webpack define plugin
export const apiRoot = APIROOT;

export const postsPrefix = "/news";

export const sortings = [
	{
		title: "По приоритету",
		fn(a, b) {
			if (a.position === b.position) return 0;
			return a.position > b.position ? -1 : 1;
		},
	},
	{
		title: "По дате новости",
		fn(a, b) {
			if (a.ts === b.ts) return 0;
			return a.parsedts > b.parsedts ? -1 : 1;
		},
	},
	{
		title: "По дате добавления",
		fn(a, b) {
			if (a.ats === b.ats) return 0;
			return a.parsedats > b.parsedats ? -1 : 1;
		},
	},
	{
		title: "По комментариям",
		fn(a, b) {
			if (a.comments === b.comments) return 0;
			return a.comments > b.comments ? -1 : 1;
		},
	},
];

export const archiveSortings = sortings.filter(
	x => x.title !== "По приоритету"
);

const now = new Date();
const day = 1000 * 60 * 60 * 24;
const month = day * 30;

export const postRecentness = [
	{
		title: "Все",
		fn(x, i) {
			return true;
		},
	},
	{
		title: "Свежие",
		fn(x, i, isgeek = true) {
			const interval = now - Date.parse(x.ats);
			if (isgeek && x.geek && interval < 3 * month) {
				return true;
			} else if (interval < 21 * day) {
				return true;
			}
			return false;
		},
	},
];

export const postLevels = [
	{
		title: "Все",
		fn(x, i) {
			return true;
		},
	},
	{
		title: "Обычные",
		fn(x, i) {
			return !x.geek;
		},
	},
	{
		title: "Гиковские",
		fn(x, i) {
			return x.geek;
		},
		isgeek: true,
	},
];
