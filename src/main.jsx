import "./style.scss";
import "intersection-observer";
import "whatwg-fetch";
import "./ganalitics";

import { render } from "react-dom";
import { store, setState, setTheme } from "./store";
import {
	addNotification,
	removeNotificationsWithContext,
} from "./notifications";
import {
	getActiveArticle,
	pollActiveArticle as apiPollActiveArticle,
	loginViaStorage,
	getTheme,
	getArticle,
	getIssueNumber,
} from "./api";
import { waitDOMReady, sleep } from "./utils";
import { Provider, connect } from "react-redux";

import App from "./app";
import LinkToCurrent from "./linkToCurrent";
import { activeArticleID } from "./settings";

function pollActiveArticle() {
	getActiveArticle()
		.catch(() => null)
		.then(async activeId => {
			setState({ activeId });
			await waitDOMReady();
			while (true) {
				try {
					const activeId = await apiPollActiveArticle();
					if (activeId === store.getState().activeId) {
						removeNotificationsWithContext(activeArticleID);
						addNotification({
							data: <b>Тема активирована</b>,
							time: 3000,
						});
						continue;
					}
					setState({ activeId });
					window.setTimeout(async () => {
						sleep(700).then(() => {
							document.title = "* Тема обновлена | Новости Радио-Т";
						});
						const article = await getArticle(activeId);

						if (article && article.hasOwnProperty("title")) {
							removeNotificationsWithContext(activeArticleID);
							addNotification(remove => ({
								data: (
									<span>
										Тема обновлена:
										<br />
										<LinkToCurrent
											title={`“${article.title}”`}
											onClick={() => remove()}
										/>
									</span>
								),
								time: null,
								context: activeArticleID,
							}));
						}
					}, 0);
				} catch {
					console.error("Error while setting active article");
				}
			}
		});
}

async function main() {
	try {
		const theme = getTheme();
		document.documentElement.dataset.theme = theme;
		setTheme(theme, true);
	} catch (e) {
		console.error(e);
	}

	const CApp = connect(state => {
		return state;
	})(App);

	await loginViaStorage().then(isAdmin => {
		setState({ isAdmin });
	});

	getIssueNumber().then(issueNumber => {
		if (issueNumber) {
			setState({ issueNumber });
		}
	});

	render(
		<Provider store={store}>
			<CApp />
		</Provider>,
		document.querySelector(".app")
	);

	pollActiveArticle();
}

main().catch(e => console.error(e));
