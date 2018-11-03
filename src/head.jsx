import React from "react";
import { NavLink, Route } from "react-router-dom";
import { logout, update, startShow, setAutoScroll } from "./api.js";
import { store, setState, addNotification } from "./store.jsx";

export default class Head extends React.Component {
	render() {
		return (
			<div className="header wrapper page__header">
				<h1 className="title header__title">Новости для Радио-Т</h1>
				<ul className="navigation header__navigation">
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
					{this.props.isAdmin && <br />}
					<Route
						path="/"
						exact={true}
						render={() => (
							<li className="navigation__item navigation__item_to-current">
								<span>
									<span
										role="button"
										className="pseudo navigation__item-link"
										onClick={() => this.scrollToCurrent()}
									>
										К текущей теме
									</span>
									<span
										role="button"
										className="navigation__scroll-toggle"
										onClick={() => this.toggleAutoScroll()}
										title="Автоматически переходить к текущей теме"
									>
										{this.props.autoScroll && this.props.autoScroll === true
											? "◉"
											: "◎"}
									</span>
								</span>
							</li>
						)}
					/>
					<Route
						path="/news/:slug"
						render={() => (
							<li className="navigation__item navigation__item_to-comments">
								<span
									role="button"
									className="pseudo navigation__item-link"
									onClick={e => {
										const el = document.getElementById("to-comments");
										if (el) {
											el.scrollIntoView({ behavior: "smooth" });
										}
									}}
								>
									К комментариям
								</span>
							</li>
						)}
					/>
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
	scrollToCurrent() {
		const el = document.querySelector(".post-active");
		if (!el) {
			addNotification({
				data: <span>Текущей темы нет</span>,
			});
			return;
		}
		el.scrollIntoView({ behavior: "smooth" });
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
