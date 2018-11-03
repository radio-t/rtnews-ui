// via webpack define plugin
export const apiRoot = APIROOT;

export const postsPrefix = "/news";

export const sortings = [
	{
		title: "По приоритету",
		fn(a, b) {
			return a.position < b.position;
		},
	},
	{
		title: "По дате новости",
		fn(a, b) {
			return Date.parse(a.ts) < Date.parse(b.ts);
		},
	},
	{
		title: "По дате добавления",
		fn(a, b) {
			return Date.parse(a.ats) < Date.parse(b.ats);
		},
	},
	{
		title: "По комментариям",
		fn(a, b) {
			return a.comments < b.comments;
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
