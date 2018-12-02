import {
	apiRoot,
	sortings,
	postRecentness,
	postLevels,
	remark as RemarkConfig,
} from "./settings.js";
import { first, retry, debounce } from "./utils.js";

const whitespaceRegex = /(\t|\s)+/g;
const longWordRegex = /([^\s\\]{16})/gm;

function processArticle(article) {
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
	return article;
}

export function getIssueNumber() {
	return retry(() =>
		fetch("https://radio-t.com/site-api/last/1?categories=podcast")
	)
		.then(resp => resp.json())
		.then(json => {
			const passedReg = /^Радио-Т (\d+)$/i;
			const match = json[0].title.match(passedReg);
			if (match && match.length > 1) {
				const value = parseInt(match[1], 10) + 1;
				return value;
			}
			return null;
		})
		.catch(() => null);
}

function processArticles(articles) {
	if (!Array.isArray(articles)) return articles;
	return articles.map(processArticle);
}

function request(endpoint, options = {}) {
	if (!options.hasOwnProperty("headers")) {
		options.headers = new Headers();
	}
	const cookies = document.cookie
		.split(";")
		.map(x => x.trim())
		.reduce((c, x) => {
			const [key, value] = x.split("=");
			c[key] = value;
			return c;
		}, {});
	if (cookies.hasOwnProperty("auth")) {
		options.headers.append("Authorization", "Basic " + cookies.auth);
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

export function update() {
	return request("/news/reload", { method: "PUT" });
}

export function getNews() {
	return request("/news").then(processArticles);
}

export function getArchiveNews() {
	return request("/news/archive").then(processArticles);
}

export function getDeletedNews() {
	return request("/news/del").then(processArticles);
}

const articlesCache = new Map();
const articlesIdSlugMap = new Map();

export async function getArticle(slug) {
	if (articlesCache.has(slug)) return Promise.resolve(articlesCache.get(slug));
	const article = await request("/news/slug/" + encodeURIComponent(slug)).then(
		processArticle
	);
	articlesCache.set(slug, article);
	articlesIdSlugMap.set(article.id, article.slug);
	return article;
}

export async function getArticleById(id) {
	if (articlesIdSlugMap.has(id))
		return Promise.resolve(articlesCache.get(articlesIdSlugMap.get(id)));
	const article = await request("/news/id/" + encodeURIComponent(id)).then(
		processArticle
	);
	articlesCache.set(article.slug, article);
	articlesIdSlugMap.set(article.id, article.slug);
	return article;
}

export function getActiveArticle() {
	return request(`/news/active`)
		.then(x => x.id)
		.catch(() => null);
}

export async function pollActiveArticle(ms = 295) {
	while (true) {
		const req = await request(`/news/active/wait/${ms}`);
		if (req != null && req.hasOwnProperty("id")) return req.id;
	}
}

/**
 * Adds article or updates it if title already exists
 */
export function addArticle(link, title = "", snippet = "", content = "") {
	const body = { link };
	if (!title || title.length > 0) body.title = title;
	if (!snippet || snippet.length > 0) body.snippet = snippet;
	if (!content || content.length > 0) body.content = content;

	const headers = new Headers();
	headers.append("Content-Type", "application/json");

	const url = title.length > 0 ? "/news/manual" : "/news";

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

export function updateArticle(updated) {
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

export function moveArticle(id, offset) {
	return request(`/news/moveid/${id}/${offset}`, { method: "PUT" });
}

export function archiveArticle(id) {
	return request(`/news/archive/${id}`, { method: "PUT" });
}

export function activateArticle(id) {
	return request(`/news/active/${id}`, { method: "PUT" });
}

export function removeArticle(id) {
	return request(`/news/${id}`, { method: "DELETE" });
}

export function restoreArticle(id) {
	return request(`/news/undelete/${id}`, { method: "PUT" });
}

export async function makeArticleFirst(id) {
	const positions = await request("/news/positions");
	if (!positions.hasOwnProperty(id))
		throw new Error("Can't find id's position");
	const pos = positions[id];
	const maxPos = Math.max(...Object.values(positions));
	const offset = maxPos - pos;
	return request(`/news/moveid/${id}/${offset}`, { method: "PUT" });
}

export function makeArticleGeek(id) {
	return request(`/news/geek/${id}`, { method: "PUT" });
}

export function makeArticleNotGeek(id) {
	return request(`/news/nogeek/${id}`, { method: "PUT" });
}

export function getFeeds() {
	return request("/feeds");
}

export function addFeed(url) {
	const headers = new Headers();
	headers.append("Content-Type", "application/json");
	const body = JSON.stringify({
		feedlink: url,
	});
	return request("/feeds", { method: "POST", headers, body });
}

export function removeFeed(id) {
	return request("/feeds/" + id, { method: "DELETE" });
}

export function startShow() {
	return request("/show/start", { method: "PUT" });
}

export function getRecentness() {
	const s = localStorage.getItem("recentness");
	return first(postRecentness, x => x.title === s) || postRecentness[0];
}

export function setRecentness(value) {
	localStorage.setItem("recentness", value.title);
}

export function getAutoScroll() {
	const s = localStorage.getItem("autoScroll");
	return s === "true";
}

export function setAutoScroll(value) {
	localStorage.setItem("autoScroll", value);
}

export function getPostLevel() {
	const s = localStorage.getItem("postLevel");
	return first(postLevels, x => x.title === s) || postLevels[0];
}

export function setPostLevel(value) {
	localStorage.setItem("postLevel", value.title);
}

export function getSorting() {
	const s = localStorage.getItem("sorting");
	return first(sortings, x => x.title === s) || sortings[0];
}

export function setSorting(value) {
	localStorage.setItem("sorting", value.title);
}

export function getTheme() {
	const s = localStorage.getItem("theme");
	if (s !== null) return s;

	//check system night mode
	const mode = (() => {
		const query = window.matchMedia("(prefers-color-scheme: dark)");
		return query.matches ? "night" : "day";
	})();

	return mode || "day";
}

export function setTheme(value) {
	localStorage.setItem("theme", value);
}

export function login(user, password) {
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
			const d = new Date();
			d.setFullYear(d.getFullYear() + 3);
			document.cookie = `auth=${encodeURIComponent(
				auth
			)};expires=${d.toUTCString()};path=/`;
			return true;
		}
		return false;
	});
}

export function loginViaCookies() {
	const cookies = document.cookie.split(";").reduce((c, x) => {
		if (!x) return c;
		const [key, value] = x.split("=");
		if (!key) return c;
		c[key.trim()] = value.trim();
		return c;
	}, {});
	if (!cookies.hasOwnProperty("auth")) return Promise.resolve(false);
	const headers = new Headers();
	const auth = decodeURIComponent(cookies.auth);
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
		.catch(e => {
			return false;
		});
}

export function logout() {
	document.cookie = "auth=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
}

/**
 * Performs cumulative get of comment counts
 * by debouncing execution by 100ms
 *
 * @param {String} url
 * @returns {Promise} promise with response object
 */
export const getRemarkCommentsCount = (() => {
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
	return url => {
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
