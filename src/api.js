import {
	apiRoot,
	sortings,
	archiveSortings,
	postRecentness,
	postLevels,
} from "./settings.js";
import { first } from "./utils.js";

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
		if (req.status >= 400) {
			throw req.statusText;
		}
		return req.json().catch(e => null);
	});
}

export function update() {
	return request("/news/reload", { method: "PUT" });
}

export function getNews() {
	return request("/news");
}

export function getArchiveNews() {
	return request("/news/archive");
}

export function getDeletedNews() {
	return request("/news/del");
}

export function getArticle(slug) {
	return request("/news/slug/" + encodeURIComponent(slug));
}

export function addArticle(link, title = "", snippet = "") {
	const body = { link };
	if (title.length > 0) body.title = title;
	if (snippet.length > 0) body.snippet = snippet;

	const headers = new Headers();
	headers.append("Content-Type", "application/json");

	const url = title.length > 0 ? "/news/manual" : "/news";

	return request(url, {
		method: "POST",
		body: JSON.stringify(body),
		headers,
	});
}

export function moveArticle(from, to) {
	const offset = to - from;
	return request(`/news/move/${from}/${offset}`, { method: "PUT" });
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

export function makeArticleNoGeek(id) {
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

export function getArchiveSorting() {
	const s = localStorage.getItem("archiveSorting");
	return first(sortings, x => x.title === s) || archiveSortings[0];
}

export function setArchiveSorting(value) {
	localStorage.setItem("archiveSorting", value.title);
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
			document.cookie = `auth=${auth};max-age=94608000;path=/;samesite=strict`;
			return true;
		}
		return false;
	});
}

export function loginViaCookies() {
	const cookies = document.cookie
		.split(";")
		.map(x => x.trim())
		.reduce((c, x) => {
			const [key, value] = x.split("=");
			c[key] = value;
			return c;
		}, {});
	if (cookies.hasOwnProperty("auth")) {
		const headers = new Headers();
		const auth = cookies.auth;
		headers.append("Authorization", "Basic " + auth);
		return fetch(apiRoot + "/news/reload", {
			method: "PUT",
			headers: headers,
			credentials: "omit",
			mode: "cors",
		})
			.then(response => response.status === 200)
			.then(x => {
				if (!x) logout();
				return x;
			});
	}
	return Promise.resolve(false);
}

export function logout() {
	document.cookie = "auth=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
}
