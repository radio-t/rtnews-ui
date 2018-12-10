/**
 * Provides with different Atricle Listing views (Main, Archive, Deleted, Sorting)
 */

import { Component } from "react";
import { sleep, first, requestIdleCallback, retry, waitFor } from "./utils.js";
import {
	postRecentness,
	postLevels,
	sortings,
	newsAutoUpdateInterval,
} from "./settings.js";
import {
	getRecentness,
	setRecentness,
	getPostLevel,
	setPostLevel,
	getSorting,
	setSorting,
	activateArticle,
	makeArticleGeek,
	makeArticleNotGeek,
	makeArticleFirst,
	archiveArticle,
	removeArticle,
	restoreArticle,
	moveArticle,
	getPrepTopicsURL,
	addArticle,
} from "./api.js";
import { setState, addNotification, removeNotification } from "./store.jsx";
import articleCache from "./articleCache.js";
import Error from "./error.jsx";

import {
	ArticleBrief,
	DraggableArticleBrief,
	ArticleSort,
} from "./articleViews.jsx";
import ListingActions from "./listingActions.jsx";
import { Redirect } from "react-router-dom";
import AddArticle from "./add.jsx";
import Loading from "./loading.jsx";

/**
 * Special symbol which denotes that
 * article should be deleted in
 * BaseListing.onArticleChange
 */
export const REMOVE_CHANGE = Symbol();

/**
 * fuction which shows notification, fires function
 * and upon completition removes notification
 */
async function en(message, fn, context = null) {
	const notification = addNotification({
		data: message,
		time: 30000,
		context,
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

function withAutoUpdate(Component, updateInterval = newsAutoUpdateInterval) {
	if (updateInterval === null) return Component;

	return class extends Component {
		componentDidMount() {
			super.componentDidMount && super.componentDidMount();

			this.updateTimestamp = new Date().getTime();

			this.updateInterval = setInterval(async () => {
				let stamp = new Date().getTime();
				if (stamp - this.updateTimestamp > updateInterval * 60000) {
					await new Promise(resolve => {
						requestIdleCallback(
							() => {
								this.update()
									.then(resolve)
									.catch(e => {
										console.error(e);
										resolve();
									});
							},
							{
								timeout: 30000,
							}
						);
					});
				}
			}, 30000);
		}
		componentWillUnmount() {
			super.componentWillUnmount && super.componentWillUnmount();
			clearInterval(this.updateInterval);
		}
		async update(...args) {
			const o = await super.update(...args);
			this.updateTimestamp = new Date().getTime();
			return o;
		}
	};
}

/**
 * Base for listing components
 *
 * Provides onChange handlers such as
 * "make geek", "make first" etc...
 *
 * Provides news autoupdate
 */
class BaseListing extends Component {
	/**
	 *
	 * Provides articles autoupdate
	 */
	constructor(props) {
		super(props);

		this.updateArticle = this.updateArticle.bind(this);
		this.onArticleChange = this.onArticleChange.bind(this);
		this.dataProvider = () => [];
	}
	async update(force = false) {
		try {
			const news = await this.dataProvider(force);
			this.setState({ news, loaded: true });
		} catch (e) {
			if (force || !this.state.loaded) {
				this.setState({ error: e });
			} else {
				addNotification({
					data: "Произошла ошибка при обновлении новостей",
					time: 10000,
				});
			}
		}
	}
	updateArticle(article, change) {
		const articleIndex = this.state.news.indexOf(article);
		if (articleIndex === -1) return;
		if (change === REMOVE_CHANGE) {
			this.setState({
				news: [
					...this.state.news.slice(0, articleIndex),
					...this.state.news.slice(articleIndex + 1),
				],
			});
			return;
		}
		const storeArticle = this.state.news[articleIndex];
		const updatedArticle = { ...storeArticle, ...change };
		this.setState({
			news: [
				...this.state.news.slice(0, articleIndex),
				updatedArticle,
				...this.state.news.slice(articleIndex + 1),
			],
		});
		return updatedArticle;
	}
	async onArticleChange(article, change, data = null) {
		switch (change) {
			case "make-first":
				{
					const max = Math.max(...this.state.news.map(x => x.position));
					this.updateArticle(article, { position: max + 1 });
					const updated = await en(
						"делаю тему первой",
						async () => await makeArticleFirst(article.id)
					);
					const updatedArticles = this.state.news.slice(0).map(a => {
						if (!updated.hasOwnProperty(a.id)) return a;
						const n = { ...a, position: updated[a.id] };
						return n;
					});
					this.setState({ news: updatedArticles });
					articleCache.invalidate("common");
				}
				break;
			case "make-current":
				setState({ activeId: article.id });
				await en(
					"активирую",
					async () => await activateArticle(article.id),
					"active-article"
				);
				this.update && (await this.update(true));
				articleCache.invalidate("common");
				break;
			case "make-geek":
				this.updateArticle(article, { geek: true });
				await en(
					"делаю тему гиковской",
					async () => await makeArticleGeek(article.id)
				);
				articleCache.invalidate("common");
				break;
			case "make-ungeek":
				this.updateArticle(article, { geek: false });
				await en(
					"делаю тему негиковской",
					async () => await makeArticleNotGeek(article.id)
				);
				articleCache.invalidate("common");
				break;
			case "archive":
				this.updateArticle(article, REMOVE_CHANGE);
				if (article.id === this.props.activeId) setState({ activeId: null });
				await en(
					"убираю в архив",
					async () => await archiveArticle(article.id)
				);
				articleCache.invalidate("common");
				articleCache.invalidate("archive");
				break;
			case "remove":
				this.updateArticle(article, REMOVE_CHANGE);
				if (article.id === this.props.activeId) setState({ activeId: null });
				await en("удаляю", async () => await removeArticle(article.id));
				articleCache.invalidate("common");
				articleCache.invalidate("deleted");
				break;
			case "restore":
				this.updateArticle(article, REMOVE_CHANGE);
				await en(
					"восстанавливаю",
					async () => await restoreArticle(article.id)
				);
				articleCache.invalidate("deleted");
				articleCache.invalidate("common");
				break;
			case "move":
				const target = first(this.state.news, a => a.id === data.id);
				const append = data.from < data.to ? 0.2 : -0.2;
				this.updateArticle(target, { position: data.to + append });
				const updated = await moveArticle(data.id, data.to - data.from);
				const updatedArticles = this.state.news.slice(0).map(a => {
					if (!updated.hasOwnProperty(a.id)) return a;
					const n = { ...a, position: updated[a.id] };
					return n;
				});
				this.setState({ news: updatedArticles });
				articleCache.invalidate("common");
				break;
			default:
				console.error("unknown action");
				break;
		}
	}
}

const BaseListingWithAutoUpdate = withAutoUpdate(BaseListing);

/**
 * Listing for main "/" route
 */
export class Listing extends BaseListingWithAutoUpdate {
	constructor(props) {
		super(props);

		this.state = {
			postRecentness: getRecentness(),
			postLevel: getPostLevel(),
			sort: getSorting(),
			loaded: false,
			error: null,
			news: [],
			addFormExpanded: false,
		};
		this.dataProvider = force => articleCache.get("common", force);
	}
	componentDidMount() {
		super.componentDidMount && super.componentDidMount();
		document.title = "Новости для Радио-Т";
	}
	async componentWillMount() {
		super.componentWillMount && super.componentWillMount();
		this.update();
	}
	async startPrepTopics() {
		try {
			addNotification({
				data: "Активирую темы слушателей",
			});
			await waitFor(() => this.state.loaded, 20000);
			const url = await getPrepTopicsURL();
			const number = url.substr(url.length - 4, 3);

			const maxPosition = this.state.news.reduce(
				(n, a) => Math.max(n, a.position),
				0
			);

			await addArticle(
				url,
				`Темы слушателей ${number}`,
				"",
				`<a href="${url}">Темы слушателей</a>`,
				maxPosition + 1
			);

			const article =
				first(this.state.news, a => a.origlink === url) ||
				(await retry(async () => {
					await sleep(2000);
					await this.update(true);
					const article = first(
						this.state.news,
						article => article.origlink === url
					);
					if (!article) throw new Error("Can't find prep article");
					return article;
				}, 5));
			this.onArticleChange(article, "make-current");
		} catch (e) {
			console.error(e);
			switch (e.message) {
				case "Can't find prep article":
					addNotification({
						data: "Не могу найти тему слушателей в списке",
						level: "error",
					});
					break;
				default:
					addNotification({
						data: "Произошла ошибка при активации тем слушателей",
						level: "error",
					});
			}
		}
	}
	render() {
		if (this.state.error)
			return (
				<Error
					code={this.state.error.status || 500}
					message={
						this.state.error.statusText ||
						this.state.error.message ||
						"Произошла ошибка"
					}
				/>
			);

		if (!this.state.loaded) return <Loading />;

		const sortIsDefault =
			this.state.postRecentness === postRecentness[0] &&
			this.state.postLevel === postLevels[0] &&
			this.state.sort === sortings[0];

		return (
			<>
				<ListingActions
					includeFilters={true}
					className={this.props.isAdmin ? "listing-actions-all" : ""}
					//
					postRecentness={this.state.postRecentness}
					onRecentnessChange={postRecentness => {
						this.setState({ postRecentness });
						setRecentness(postRecentness);
					}}
					//
					postLevel={this.state.postLevel}
					onPostLevelChange={postLevel => {
						const level = first(postLevels, x => x.title === postLevel);
						this.setState({
							postLevel: level,
						});
						setPostLevel(level);
					}}
					//
					sort={this.state.sort}
					onSortingChange={sort => {
						this.setState({ sort });
						setSorting(sort);
					}}
				/>
				{this.props.isAdmin && (
					<div
						className={
							"add-form-overlay " +
							(this.state.addFormExpanded ? "add-form-overlay-expanded" : "")
						}
					>
						{!this.state.addFormExpanded && (
							<span
								className="pseudo add-form-overlay__control"
								onClick={() => {
									this.setState({ addFormExpanded: true });
									setTimeout(() => {
										const el =
											document.querySelector(".add-form__article-url") ||
											document.querySelector(".add-form__article-manual-link");
										if (el) el.focus();
									}, 500);
								}}
							>
								Добавить новость
							</span>
						)}
						{this.state.addFormExpanded && (
							<span
								className="pseudo add-form-overlay__control"
								onClick={() => this.setState({ addFormExpanded: false })}
							>
								Закрыть
							</span>
						)}
						<AddArticle
							{...this.props}
							style={{ display: this.state.addFormExpanded ? null : "none" }}
							onAdd={() => {
								sleep(1000).then(() => {
									this.update(true);
								});
							}}
						/>
					</div>
				)}
				<div className="news page__news">
					{this.state.news
						.slice(0)
						.filter((x, i) => {
							if (this.props.activeId === x.id) return true;
							return (
								this.state.postRecentness.fn(
									x,
									i,
									this.state.postLevel.hasOwnProperty("isgeek")
								) && this.state.postLevel.fn(x, i)
							);
						})
						.sort((a, b) => this.state.sort.fn(a, b))
						.map((x, i) => {
							const isCurrent = x.id === this.props.activeId;
							const getControls = () => {
								const isNotFirst = sortIsDefault && i !== 0;
								return [
									!isCurrent ? "make-current" : null,
									isNotFirst ? "make-first" : null,
									x.geek ? "make-ungeek" : "make-geek",
									"archive",
									"remove",
								].filter(x => x !== null);
							};
							return this.props.isAdmin ? (
								<DraggableArticleBrief
									key={x.id}
									article={x}
									archive={false}
									controls={this.props.isAdmin ? getControls() : null}
									active={isCurrent}
									draggable={sortIsDefault}
									onChange={(id, data) => this.onArticleChange(x, id, data)}
								/>
							) : (
								<ArticleBrief
									key={x.id}
									article={x}
									archive={false}
									controls={this.props.isAdmin ? getControls() : null}
									active={isCurrent}
									onChange={(id, data) => this.onArticleChange(x, id, data)}
								/>
							);
						})}
				</div>
			</>
		);
	}
}

/**
 * Listing for archive "/arhive/"
 */
export class ArchiveListing extends BaseListingWithAutoUpdate {
	constructor(props) {
		super(props);
		this.state = {
			news: [],
			loaded: false,
			error: null,
		};
		this.dataProvider = force => articleCache.get("archive", force);
	}
	componentDidMount() {
		super.componentDidMount && super.componentDidMount();
		document.title = "Архив | Новости Радио-Т";
	}
	async componentWillMount() {
		super.componentWillMount && super.componentWillMount();
		this.update();
	}
	render() {
		if (this.state.error)
			return (
				<Error
					code={this.state.error.status || 500}
					message={
						this.state.error.statusText ||
						this.state.error.message ||
						"Произошла ошибка"
					}
				/>
			);
		if (!this.state.loaded) return <Loading />;
		return (
			<div className="news page__news">
				{this.state.news.map(x => (
					<ArticleBrief
						key={x.id}
						article={x}
						archive={true}
						controls={this.props.isAdmin ? ["remove"] : null}
						onChange={(id, data) => this.onArticleChange(x, id, data)}
					/>
				))}
			</div>
		);
	}
}

/**
 * Listing for deleted articles "/deleted/"
 */
export class DeletedListing extends BaseListingWithAutoUpdate {
	constructor(props) {
		super(props);
		this.state = {
			news: [],
			loaded: false,
			error: null,
		};
		this.dataProvider = async force =>
			(await articleCache.get("deleted", force)).sort((a, b) => {
				if (a.ats === b.ats) return 0;
				return a.parsedats > b.parsedats ? -1 : 1;
			});
	}
	componentDidMount() {
		super.componentDidMount && super.componentDidMount();
		document.title = "Удаленные темы | Новости Радио-Т";
	}
	componentWillMount() {
		super.componentWillMount && super.componentWillMount();
		this.update();
	}
	render() {
		if (!this.props.isAdmin) return <Redirect to="/login/" />;
		if (this.state.error)
			return (
				<Error
					code={this.state.error.status || 500}
					message={
						this.state.error.statusText ||
						this.state.error.message ||
						"Произошла ошибка"
					}
				/>
			);
		if (!this.state.loaded) return <Loading />;
		return (
			<div className="news deleted-news page__news">
				{this.state.news.map(x => (
					<ArticleBrief
						key={x.id}
						article={x}
						controls={this.props.isAdmin ? ["restore"] : []}
						onChange={(id, data) => this.onArticleChange(x, id, data)}
					/>
				))}
			</div>
		);
	}
}

/**
 * Listing for sorting view "/sort/"
 */
export class Sorter extends BaseListingWithAutoUpdate {
	constructor(props) {
		super(props);
		this.state = {
			news: [],
			loaded: false,
			error: null,
		};
		this.dataProvider = force => articleCache.get("common", force);
	}
	componentDidMount() {
		super.componentDidMount && super.componentDidMount();
		document.title = "Сортировка тем | Новости Радио-Т";
	}
	componentWillMount() {
		super.componentWillMount && super.componentWillMount();
		this.update();
	}
	render() {
		if (!this.props.isAdmin) return <Redirect to="/login/" />;
		if (this.state.error)
			return (
				<Error
					code={this.state.error.status || 500}
					message={
						this.state.error.statusText ||
						this.state.error.message ||
						"Произошла ошибка"
					}
				/>
			);
		if (!this.state.loaded) return <Loading />;
		return (
			<div className="sorter">
				{this.state.news
					.slice(0)
					.sort((a, b) => {
						if (a.position === b.position) return 0;
						return a.position > b.position ? -1 : 1;
					})
					.map(article => (
						<ArticleSort
							article={article}
							key={article.id}
							active={this.props.activeId === article.id}
							onChange={(id, data) => this.onArticleChange(article, id, data)}
							draggable={true}
						/>
					))}
			</div>
		);
	}
}
