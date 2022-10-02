import { NOW, DAY, MONTH, MINUTE } from "./constants";
import { Article } from "./articleInterface";
import { getNextShowDate } from "./utils";

// via webpack define plugin
declare var APIROOT: string;
export const apiRoot = APIROOT;

export const postsPrefix = "/post";

/**
 * now in ms
 */
const now = NOW.getTime();

/**
 * news update interval in minutes
 *
 * null if off
 */
export const newsAutoUpdateInterval: number | null = 10;

/**
 * news cache interval in minutes. Used between
 * history transition (back/forward in browser)
 *
 * null if off
 */
export const newsCacheValidInterval: number | null = 5;

export const activeArticleID = "active-article";

/**
 * Defines max show duration in ms, six hours
 */
export const maxShowDuration = 1000 * 60 * 60 * 6;

/**
 * Defines start date of the next show
 */
export const showStartTime = getNextShowDate();

/**
 * Defines interval from showStartTime when
 * if show wasn't started notification should appear
 */
export const showStartTimeDeadline = MINUTE * 15;

/**
 * Matches if article origlink matches to listeners proposed topics url
 */
export const prepTopicsReg =
	/^https?:\/\/radio-t.com\/p\/\d{4}\/\d{2}\/\d{2}\/prep-\d+\/?$/i;

/**
 * needs for situation when dragging something
 * near window border, so have add scroll manually
 */
export const isSafari = window.navigator.userAgent.indexOf("Safari") !== -1;

export interface Sorting {
	title: string;
	fn(a: Article, b: Article): number;
}

export const sortings: Sorting[] = [
	{
		title: "По приоритету",
		fn(a, b) {
			if (a.position === b.position) return 0;
			return a.position > b.position ? -1 : 1;
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

export type PostRecentnessString = "Все" | "Свежие";

export interface PostRecentness {
	title: PostRecentnessString;
	fn(x: Article, i: number, isgeek?: boolean): boolean;
}

export const postRecentness: PostRecentness[] = [
	{
		title: "Все",
		fn() {
			return true;
		},
	},
	{
		title: "Свежие",
		fn(x, _, isgeek = true) {
			const interval = now - x.parsedats;
			if (isgeek && x.geek && interval < 3 * MONTH) {
				return true;
			} else if (interval < 21 * DAY) {
				return true;
			}
			return false;
		},
	},
];

export type PostLevelString = "Все" | "Обычные" | "Гиковские";

export interface PostLevel {
	title: PostLevelString;
	fn(x: any, i: number): boolean;
	isgeek?: boolean;
}

export const postLevels: PostLevel[] = [
	{
		title: "Все",
		fn() {
			return true;
		},
	},
	{
		title: "Обычные",
		fn(x, _) {
			return !x.geek;
		},
	},
	{
		title: "Гиковские",
		fn(x, _) {
			return x.geek;
		},
		isgeek: true,
	},
];
