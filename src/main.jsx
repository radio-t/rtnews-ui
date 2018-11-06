import "./style.css";

import React from "react";
import "./ganalitics.js";
import { render } from "react-dom";
import {
	store,
	setState,
	setTheme,
	addNotification,
	removeNotificationsWithContext,
} from "./store.jsx";
import { Provider, connect } from "react-redux";
import Article from "./article.jsx";
import Head from "./head.jsx";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import {
	getActiveArticle,
	pollActiveArticle,
	getAutoScroll,
	loginViaCookies,
	getTheme,
	getArticleById,
} from "./api.js";
import AddArticle from "./add.jsx";
import { Listing, ArchiveListing, DeletedListing } from "./articleListings.jsx";
import Feeds from "./feeds.jsx";
import LoginForm from "./login.jsx";
import NotFound from "./notFound.jsx";
import Sorter from "./sorter.jsx";
import Notifications from "./notifications.jsx";
import { waitDOMReady } from "./utils.js";

class App extends React.Component {
	render() {
		return (
			<Router>
				<div className="page">
					<Head {...this.props} />
					<Switch>
						<Route
							path="/"
							exact={true}
							render={props => {
								document.title = "Новости для Радио-Т";
								return <Listing {...this.props} />;
							}}
						/>
						<Route
							path="/deleted/"
							exact={true}
							render={props => {
								document.title = "Удаленные темы | Новости Радио-Т";
								return <DeletedListing {...this.props} />;
							}}
						/>
						<Route
							path="/archive/"
							exact={true}
							render={props => {
								document.title = "Архив | Новости Радио-Т";
								return <ArchiveListing {...props} {...this.props} />;
							}}
						/>
						<Route
							path="/add/"
							exact={true}
							render={() => {
								document.title = "Добавить новость | Новости Радио-Т";
								return <AddArticle {...this.props} />;
							}}
						/>
						<Route
							path="/feeds/"
							exact={true}
							render={() => {
								document.title = "Управление фидами | Новости Радио-Т";
								return <Feeds {...this.props} />;
							}}
						/>
						<Route
							path="/sort/"
							render={props => {
								document.title = "Сортировка тем | Новости Радио-Т";
								return <Sorter {...this.props} />;
							}}
						/>
						<Route
							path="/news/:slug"
							render={props => {
								document.title = `${props.match.params.slug} | Новости Радио-Т`;
								return <Article slug={props.match.params.slug} />;
							}}
						/>
						<Route
							path="/login/"
							exact={true}
							render={props => {
								document.title = "Вход | Новости Радио-Т";
								return <LoginForm />;
							}}
						/>
						<Route component={NotFound} />
					</Switch>
					<div className="footer page__footer">
						<hr />
						<a href="http://radio-t.com/">Radio-T</a>,{" "}
						{new Date().getFullYear()}
					</div>
					<Notifications
						className="page__notifications"
						notifications={this.props.notifications}
					/>
				</div>
			</Router>
		);
	}
}

async function main() {
	const theme = getTheme();
	document.documentElement.dataset.theme = theme;
	setTheme(theme, true);

	const CApp = connect(state => {
		return state;
	})(App);

	await loginViaCookies().then(isAdmin => {
		setState({ isAdmin });
	});

	setState({ autoScroll: getAutoScroll() });

	render(
		<Provider store={store}>
			<CApp />
		</Provider>,
		document.querySelector(".app")
	);

	getActiveArticle().then(async activeId => {
		setState({ activeId });
		await waitDOMReady();
		while (true) {
			const activeId = await pollActiveArticle();
			if (activeId === store.getState().activeId) {
				addNotification({
					data: <b>Тема активирована</b>,
					time: 3000,
				});
				continue;
			}
			setState({ activeId });
			if (store.getState().autoScroll) {
				setTimeout(() => {
					const el = document.querySelector(".post-active");
					if (el) el.scrollIntoView({ behavior: "smooth" });
				}, 500);
			}
			const article = await getArticleById(activeId);
			setTimeout(() => {
				document.title = "* Тема обновлена | Новости Радио-Т";
			}, 300);
			if (article && article.hasOwnProperty("title")) {
				removeNotificationsWithContext("active-article");
				addNotification(remove => ({
					data: (
						<span>
							Тема обновлена "
							<HashLink
								to="/#active-article"
								onClick={() => remove()}
								scroll={el => {
									if (!el) return;
									if (location.pathname === "/") {
										el.scrollIntoView({ behavior: "smooth" });
										return;
									}
									setTimeout(() => {
										el.scrollIntoView({ behavior: "smooth" });
									}, 500);
								}}
							>
								{article.title}
							</HashLink>
							"
						</span>
					),
					time: null,
					context: "active-article",
				}));
			}
		}
	});
}

main().catch(e => console.error(e));
