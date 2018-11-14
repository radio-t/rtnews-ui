import { createElement, Component } from "react";

import {
	logout,
	update,
	startShow,
	setAutoScroll,
	setTheme as saveTheme,
} from "./api.js";
import {
	store,
	setState,
	addNotification,
	setTheme as commitTheme,
} from "./store.jsx";
import { postsPrefix } from "./settings.js";

import { Link, NavLink, Route } from "react-router-dom";
import LinkToCurrent from "./linkToCurrent.jsx";
import { sleep, scrollIntoView } from "./utils.js";

import SVGInline from "react-svg-inline";
import MoonIcon from "./static/svg/moon.svg";
import SunIcon from "./static/svg/sun.svg";

const setTheme = v => {
	commitTheme(v);
	saveTheme(v);
};

export default class Head extends Component {
	render() {
		return (
			<div className="header wrapper page__header">
				<h1 className="title header__title">
					Новости для <span class="no-break">Радио-Т</span>
				</h1>
				<ul
					className="navigation header__navigation"
					role="navigation"
					aria-label="Main navigation"
				>
					{this.props.isAdmin && (
						<li className="navigation__item navigation__item_admin navigation__item_right navigation__item_logout">
							<span
								role="button"
								className="pseudo navigation__item-link"
								onClick={e => this.logout()}
							>
								Выйти
							</span>
						</li>
					)}
					<li className="navigation__item navigation__item_user">
						<NavLink to="/" exact={true} className="link navigation__item-link">
							Все темы
						</NavLink>
					</li>
					{this.props.isAdmin && (
						<li
							className="navigation__item navigation__item_admin"
							id="dels-wrap"
						>
							<NavLink
								to="/deleted/"
								exact={true}
								className="link navigation__item-link"
							>
								Удалённые
							</NavLink>
						</li>
					)}
					<li className="navigation__item">
						<NavLink
							to="/archive/"
							exact={true}
							className="link navigation__item-link"
						>
							Архив
						</NavLink>
					</li>
					{this.props.isAdmin && (
						<li className="navigation__item navigation__item_admin">
							<NavLink
								to="/sort/"
								exact={true}
								className="link navigation__item-link"
							>
								Сортировать&nbsp;темы
							</NavLink>
						</li>
					)}
					{this.props.isAdmin && (
						<li className="navigation__item navigation__item_admin">
							<NavLink
								to="/feeds/"
								exact={true}
								className="link navigation__item-link"
							>
								Управление фидами
							</NavLink>
						</li>
					)}
					{this.props.isAdmin && (
						<li className="navigation__item navigation__item_admin">
							<span
								role="button"
								className="pseudo link navigation__item-link"
								onClick={() => this.update()}
							>
								Обновить базу
							</span>
						</li>
					)}
					{this.props.isAdmin && (
						<li className="navigation__item navigation__item_admin">
							<span
								role="button"
								className="pseudo navigation__item-link"
								onClick={() => this.poehali()}
							>
								Поехали!
							</span>
						</li>
					)}
					{this.props.isAdmin && this.props.theme === "day" && (
						<span
							onClick={() => setTheme("night")}
							title="Поставить ночную тему"
							className="inline-button navigation__item navigation__theme-switcher"
						>
							<SVGInline
								svg={MoonIcon}
								className="icon navigation__theme-switcher-icon"
							/>
						</span>
					)}
					{this.props.isAdmin && this.props.theme === "night" && (
						<span
							onClick={() => setTheme("day")}
							title="Поставить дневную тему"
							className="inline-button navigation__item navigation__theme-switcher"
						>
							<SVGInline
								svg={SunIcon}
								className="icon navigation__theme-switcher-icon"
							/>
						</span>
					)}
					{this.props.isAdmin && <div className="navigation__separator" />}
					{this.props.activeId !== null && (
						<li className="navigation__item navigation__item_to-current">
							<span>
								<LinkToCurrent
									title="К текущей теме"
									className="pseudo navigation__item-link"
								/>
							</span>
						</li>
					)}
					<Route
						path={`${postsPrefix}/:slug`}
						render={() => (
							<li className="navigation__item navigation__item_to-comments">
								<Link
									to="#to-comments"
									onClick={e => {
										e.preventDefault();
										const el = document.getElementById("to-comments");
										scrollIntoView(el);
										sleep(500).then(() => {
											window.location.hash = "to-comments";
										});
									}}
									className="pseudo navigation__item-link"
								>
									К комментариям
								</Link>
							</li>
						)}
					/>
					{!this.props.isAdmin && this.props.theme === "day" && (
						<button
							onClick={() => setTheme("night")}
							title="Поставить ночную тему"
							className="inline-button navigation__item navigation__theme-switcher"
						>
							<SVGInline
								svg={MoonIcon}
								className="icon navigation__theme-switcher-icon"
							/>
						</button>
					)}
					{!this.props.isAdmin && this.props.theme === "night" && (
						<button
							onClick={() => setTheme("day")}
							title="Поставить дневную тему"
							className="inline-button navigation__item navigation__theme-switcher"
						>
							<SVGInline
								svg={SunIcon}
								className="icon navigation__theme-switcher-icon"
							/>
						</button>
					)}
				</ul>
				<hr />
			</div>
		);
	}
	logout() {
		logout();
		setState({ isAdmin: false });
	}
	async update() {
		update()
			.then(() => {
				addNotification({
					data: <b>База обновлена</b>,
				});
			})
			.catch(e => {
				console.error(e);
				addNotification({
					data: <b>Не могу обновить базу</b>,
					level: "error",
				});
			});
	}
	toggleAutoScroll() {
		const val = !store.getState().autoScroll;
		setState({ autoScroll: val });
		setAutoScroll(val);
	}
	poehali() {
		if (confirm("Таки поехали?")) {
			startShow()
				.then(() => {
					addNotification({
						data: <b>Шоу началось</b>,
					});
				})
				.catch(e => {
					console.error(e);
					addNotification({
						data: <b>Ошибка при старте шоу</b>,
						level: "error",
					});
				});
		}
	}
}
