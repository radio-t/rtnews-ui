import {
	activateArticle,
	makeArticleGeek,
	makeArticleNoGeek,
	makeArticleFirst,
	archiveArticle,
	removeArticle,
	restoreArticle,
} from "./api.js";
import { setState } from "./store.jsx";

import { addNotification, removeNotification } from "./store.jsx";

async function en(message, fn) {
	const notification = addNotification({
		data: message,
		time: 30000,
	});
	try {
		const o = await fn();
		return o;
	} finally {
		setTimeout(() => {
			removeNotification(notification);
		}, 500);
	}
}

export default {
	"make-current": {
		title: "Сделать текущей",
		id: "make-current",
		async fn(article, update) {
			setState({ activeId: article.id });
			await en("активирую", async () => await activateArticle(article.id));
			await update();
		},
	},
	"make-geek": {
		title: "Гиковское",
		id: "make-geek",
		async fn(article, update) {
			await en(
				"делаю тему гиковской",
				async () => await makeArticleGeek(article.id)
			);
			await update();
		},
	},
	"make-ungeek": {
		title: "Не гиковское",
		id: "make-ungeek",
		async fn(article, update) {
			await en(
				"делаю тему негиковской",
				async () => await makeArticleNoGeek(article.id)
			);
			await update();
		},
	},
	"make-first": {
		title: "Сделать первой",
		id: "make-first",
		async fn(article, update) {
			await en(
				"делаю тему первой",
				async () => await makeArticleFirst(article.id)
			);
			await update();
		},
	},
	archive: {
		title: "В архив",
		id: "archive",
		async fn(article, update) {
			await en("убираю в архив", async () => await archiveArticle(article.id));
			await update();
		},
	},
	remove: {
		title: "Удалить",
		id: "remove",
		async fn(article, update) {
			await en("удаляю", async () => await removeArticle(article.id));
			await update();
		},
	},
	restore: {
		title: "Восстановить",
		id: "restore",
		async fn(article, update) {
			await en("восстанавливаю", async () => await restoreArticle(article.id));
			await update();
		},
	},
};
