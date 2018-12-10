import {
	apiRoot,
	sortings,
	postRecentness,
	postLevels,
	remark as RemarkConfig,
	PostRecentness,
	PostLevel,
	Sorting,
} from "./settings";
import { first, retry, debounce, sleep } from "./utils";
import { Article } from "./articleInterface";
import { Feed } from "./feedInterface";

const whitespaceRegex = /(\t|\s)+/g;
const longWordRegex = /([^\s\\]{16})/gm;

function processArticle(article: any): Article {
	if (typeof article !== "object" || article === null) return article;
	if (article.hasOwnProperty("snippet")) {
		article.snippet = article.snippet
			.replace(whitespaceRegex, " ")
			.replace(longWordRegex, "$1&shy;");
	}
	if (article.hasOwnProperty("ts")) {
		article.parsedts = Date.parse(article.ts);
	}
	if (article.hasOwnProperty("ats")) {
		article.parsedats = Date.parse(article.ats);
	}
	if (article.hasOwnProperty("activets")) {
		article.parsedactivets = Date.parse(article.activets);
	}
	if (article.domain === "") {
		try {
			const url = new URL(article.origlink);
			article.domain = url.hostname;
		} catch (e) {}
	}
	return article as Article;
}

/**
 * Converts raw object to Article
 *
 * @param articles raw articles from server
 */
function processArticles(articles: any[]): Article[] {
	if (!Array.isArray(articles)) return articles;
	return articles.map(processArticle);
}

/**
 * Gets proposed topics url
 */
export function getPrepTopicsURL(): Promise<string> {
	return fetch("https://radio-t.com/site-api/last/1?categories=prep")
		.then(resp => resp.json())
		.then(data => {
			if (data.length < 1) return null;
			return data[0].url || null;
		});
}

/**
 * returns next Podcast issue number
 */
export function getIssueNumber(): Promise<number | null> {
	return retry(() =>
		fetch("https://radio-t.com/site-api/last/1?categories=podcast,prep")
	)
		.then(resp => resp.json())
		.then(json => {
			const passedReg = /^Темы для (\d+)$/i;
			const upcomingReg = /^Радио-Т (\d+)$/i;
			const match = json[0].title.match(passedReg);
			if (match && match.length > 1) {
				const number = parseInt(match[1], 10);
				return {
					number,
					link: json[0].url + "#remark42",
				};
			}
			const upcomingMatch = json[0].title.match(upcomingReg);
			if (upcomingMatch && upcomingMatch.length > 1) {
				const number = parseInt(upcomingMatch[1], 10) + 1;
				return {
					number,
					link: null,
				};
			}
			return null;
		})
		.catch(() => null);
}

function request(endpoint: string, options: RequestInit = {}): Promise<any> {
	if (!options.hasOwnProperty("headers")) {
		options.headers = new Headers();
	}
	if (localStorage.getItem("rt-news.auth")) {
		(options.headers as any).append(
			"Authorization",
			"Basic " + localStorage.getItem("rt-news.auth")
		);
	}
	return fetch(
		apiRoot + endpoint + `?timestamp=${new Date().getTime()}`,
		Object.assign(
			{
				mode: "cors",
				credentials: "omit",
			},
			options
		)
	).then(req => {
		if (req.status >= 400) throw req;
		return req.json().catch(e => null);
	});
}

/**
 * Updates articles on the server
 */
export function update(): Promise<null> {
	return request("/news/reload", { method: "PUT" });
}

/**
 * Gets articles from the server
 */
export function getNews(): Promise<Article[]> {
	return request("/news").then(processArticles);
}

/**
 * Gets archive articles from the server
 */
export function getArchiveNews(): Promise<Article[]> {
	return request("/news/archive").then(processArticles);
}

/**
 * Gets deleted articles from the server
 */
export function getDeletedNews(): Promise<Article[]> {
	return request("/news/del").then(processArticles);
}

/**
 * maps slug to article
 */
const articlesCache: Map<string, Article> = new Map();

/**
 * maps id to slug
 */
const articlesIdSlugMap: Map<string, string> = new Map();

/**
 * Gets article by slug
 */
export async function getArticle(slug: string): Promise<Article | null> {
	if (articlesCache.has(slug)) return Promise.resolve(articlesCache.get(slug));
	const article = await request("/news/slug/" + encodeURIComponent(slug)).then(
		processArticle
	);
	articlesCache.set(slug, article);
	articlesIdSlugMap.set(article.id, article.slug);
	return article;
}

/**
 * Gets article by id
 */
export async function getArticleById(id: string): Promise<Article | null> {
	if (articlesIdSlugMap.has(id))
		return Promise.resolve(articlesCache.get(articlesIdSlugMap.get(id)));
	const article = await request("/news/id/" + encodeURIComponent(id)).then(
		processArticle
	);
	articlesCache.set(article.slug, article);
	articlesIdSlugMap.set(article.id, article.slug);
	return article;
}

/**
 * Gets active article id
 */
export function getActiveArticle(): Promise<string> {
	return request(`/news/active/id`)
		.then(x => x.id || null)
		.catch(() => null);
}

/**
 * Polls server for active article change
 *
 * @param [ms] polling Interval. default: 295
 */
export async function pollActiveArticle(ms: number = 295): Promise<string> {
	while (true) {
		try {
			const req = await request(`/news/active/wait/${ms}`);
			if (req != null && req.hasOwnProperty("id")) return req.id;
		} catch (e) {
			console.error("Error while polling for active article");
			await sleep(3000);
		}
	}
}

/**
 * Adds article or updates it ifs title already exists on server
 *
 */
export function addArticle(
	link: string,
	title: string = "",
	snippet: string = "",
	content: string = "",
	position: number | null = null
): Promise<null> {
	const body: {
		link: string;
		title?: string;
		snippet?: string;
		content?: string;
		position?: number;
	} = { link };
	const isManual = !!(title || snippet || content || position);

	if (title && title.length > 0) body.title = title;
	if (snippet && snippet.length > 0) body.snippet = snippet;
	if (content && content.length > 0) body.content = content;
	if (position) body.position = position;

	const headers = new Headers();
	headers.append("Content-Type", "application/json");

	const url = isManual ? "/news/manual" : "/news";

	for (let [slug, article] of articlesCache.entries()) {
		if (article.title === title) {
			articlesCache.delete(slug);
			articlesIdSlugMap.delete(article.id);
		}
	}

	return request(url, {
		method: "POST",
		body: JSON.stringify(body),
		headers,
	});
}

export function updateArticle(updated: Partial<Article>): Promise<null> {
	for (let [slug, article] of articlesCache.entries()) {
		if (article.id === updated.id) {
			articlesCache.delete(slug);
			articlesIdSlugMap.delete(article.id);
		}
	}

	const headers = new Headers();
	headers.append("Content-Type", "application/json");

	return request("/news/manual", {
		method: "POST",
		body: JSON.stringify(updated),
		headers,
	});
}

export function moveArticle(id: string, offset: number): Promise<null> {
	return request(`/news/moveid/${id}/${offset}`, { method: "PUT" });
}

export function archiveArticle(id: string): Promise<null> {
	return request(`/news/archive/${id}`, { method: "PUT" });
}

export function activateArticle(id: string): Promise<null> {
	return request(`/news/active/${id}`, { method: "PUT" });
}

export function removeArticle(id: string): Promise<null> {
	return request(`/news/${id}`, { method: "DELETE" });
}

export function restoreArticle(id: string): Promise<null> {
	return request(`/news/undelete/${id}`, { method: "PUT" });
}

/**
 * Moves article to top
 */
export async function makeArticleFirst(id: string): Promise<null> {
	const positions: { [id: string]: number } = await request("/news/positions");
	if (!positions.hasOwnProperty(id))
		throw new Error("Can't find id's position");
	const pos = positions[id];
	const maxPos = Math.max(...Object.values(positions));
	const offset = maxPos - pos;
	return request(`/news/moveid/${id}/${offset}`, { method: "PUT" });
}

/**
 * Makes article Geek
 */
export function makeArticleGeek(id: string): Promise<null> {
	return request(`/news/geek/${id}`, { method: "PUT" });
}

/**
 * Removes geek indicator from article
 */
export function makeArticleNotGeek(id): Promise<null> {
	return request(`/news/nogeek/${id}`, { method: "PUT" });
}

export function getFeeds(): Promise<Feed[]> {
	return request("/feeds");
}

export function addFeed(url: string): Promise<null> {
	const headers = new Headers();
	headers.append("Content-Type", "application/json");
	const body = JSON.stringify({
		feedlink: url,
	});
	return request("/feeds", { method: "POST", headers, body });
}

export function removeFeed(id: string): Promise<null> {
	return request("/feeds/" + id, { method: "DELETE" });
}

export function startShow(): Promise<null> {
	return request("/show/start", { method: "PUT" });
}

export function getRecentness(): PostRecentness {
	const s = localStorage.getItem("recentness");
	return first(postRecentness, x => x.title === s) || postRecentness[0];
}

export function setRecentness(value: PostRecentness): void {
	localStorage.setItem("recentness", value.title);
}

export function getPostLevel(): PostLevel {
	const s = localStorage.getItem("postLevel");
	return first(postLevels, x => x.title === s) || postLevels[0];
}

export function setPostLevel(value: PostLevel): void {
	localStorage.setItem("postLevel", value.title);
}

export function getSorting(): Sorting {
	const s = localStorage.getItem("sorting");
	return first(sortings, x => x.title === s) || sortings[0];
}

export function setSorting(value: Sorting): void {
	localStorage.setItem("sorting", value.title);
}

export function getTheme(): "day" | "night" {
	const s = localStorage.getItem("theme") as "day" | "night";
	if (s !== null) return s;

	//check system night mode
	const mode = (() => {
		const query = window.matchMedia("(prefers-color-scheme: dark)");
		return query.matches ? "night" : "day";
	})();

	return mode || "day";
}

export function setTheme(value: "day" | "night"): void {
	localStorage.setItem("theme", value);
}

export function login(user: string, password: string): Promise<boolean> {
	const headers = new Headers();
	const auth = btoa(user + ":" + password);
	headers.append("Authorization", "Basic " + auth);
	return fetch(apiRoot + "/news/reload", {
		method: "PUT",
		headers: headers,
		credentials: "omit",
		mode: "cors",
	}).then(response => {
		if (response.status === 200) {
			localStorage.setItem("rt-news.auth", auth);
			return true;
		}
		return false;
	});
}

export function loginViaStorage(): Promise<boolean> {
	if (!localStorage.getItem("rt-news.auth")) return Promise.resolve(false);
	const headers = new Headers();
	const auth = localStorage.getItem("rt-news.auth");
	headers.append("Authorization", "Basic " + auth);
	return retry(
		() =>
			fetch(apiRoot + "/news/reload", {
				method: "PUT",
				headers: headers,
				credentials: "omit",
				mode: "cors",
			}),
		3,
		1000
	)
		.then(response => response.status === 200)
		.catch(() => false);
}

export function logout(): void {
	localStorage.removeItem("rt-news.auth");
}

/**
 * Performs cumulative get of comment counts
 * by debouncing execution by 100ms
 */
export const getRemarkCommentsCount: (url: string) => Promise<number> = (() => {
	let tasksMap = new Map();
	const worker = debounce(async () => {
		const urls = Array.from(tasksMap.keys());
		if (urls.length === 0) return;
		const tasksMapSlice = tasksMap;
		tasksMap = new Map();
		try {
			const data = await fetch(
				`${RemarkConfig.baseurl}/api/v1/counts?site=${encodeURIComponent(
					RemarkConfig.site_id
				)}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(urls),
				}
			).then(resp => resp.json());
			for (let item of data) {
				const task = tasksMapSlice.get(item.url);
				if (!task) continue;
				tasksMapSlice.delete(item.url);
				task.onGet(item);
			}
			for (let orphan of tasksMapSlice.keys()) {
				const task = tasksMapSlice.get(orphan);
				if (!task) continue;
				task.onReject(new Error("URL wasn't found in response"));
			}
		} catch (e) {
			for (let item of tasksMapSlice.keys()) {
				const task = tasksMapSlice.get(item);
				task.onReject(e);
			}
		}
	}, 100);
	return (url: string): Promise<number> => {
		return new Promise((resolve, reject) => {
			const task = {
				onGet: data => {
					resolve(data);
				},
				onReject: e => {
					reject(e);
				},
			};
			tasksMap.set(url, task);
			worker();
		});
	};
})();
