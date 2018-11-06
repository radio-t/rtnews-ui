import React from "react";

import { Redirect } from "react-router-dom";
import { addArticle } from "./api.js";
import { addNotification } from "./store.jsx";
import { apiRoot } from "./settings.js";

export default class AddArticleForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			manual: false,
			autolink: "",
			manualLink: "",
			manualTitle: "",
			manualText: "",
			posting: false,
		};
		this.onDragover = this.onDragover.bind(this);
		this.onDrop = this.onDrop.bind(this);
	}
	bookmarklet() {
		const hrefFunc = function() {
			var w = window,
				d = document,
				i = d.createElement("div"),
				s = i.style;

			s.transition = "all 200ms";
			s.position = "fixed";
			s.left = "0";
			s.right = "0";
			s.top = "0";
			s.zIndex = 16777271;
			s.height = "0";
			s.width = "100%";
			s.overflow = "hidden";
			s.background = "#fff";
			s.borderBottom = "1px solid #bdbdbd";
			s.boxShadow = "0 0 30px #828282";
			s.color = "#232323";
			s.fontSize = "30px";
			s.fontWeight = "700";
			s.fontFamily = '"PT Serif", Georgia, serif';
			s.lineHeight = "67px";
			s.textAlign = "center";

			i.textContent = "Сохраняю..";

			d.body.appendChild(i);

			w.setTimeout(function() {
				s.height = "70px";
			}, 100);

			w.setTimeout(function() {
				var headers = new Headers();
				headers.append("Authorization", "Basic #AUTH#");
				headers.append("Content-Type", "application/json");

				fetch("#LOCATION#/news", {
					method: "POST",
					mode: "cors",
					credentials: "omit",
					headers: headers,
					body: JSON.stringify({ link: location.href }),
				})
					.then(req => {
						if (req.status !== 200) {
							e("Не смог сохранить");
							r();
							return;
						}
						s.color = "#090";
						i.textContent = "Сохранил";
						r();
					})
					.catch(() => {
						e("Не смог сохранить");
						r();
					});
			}, 500);

			function e(t) {
				s.color = "#d00";
				i.textContent = t;
			}

			function r() {
				w.setTimeout(function() {
					s.height = "0";

					w.setTimeout(function() {
						i.parentNode.removeChild(i);
					}, 300);
				}, 500);
			}
		};

		const cookies = document.cookie
			.split(";")
			.map(x => x.trim())
			.reduce((c, x) => {
				const [key, value] = x.split("=");
				c[key] = value;
				return c;
			}, {});

		if (!cookies.hasOwnProperty("auth")) return "";

		const href = hrefFunc
			.toString()
			.replace(/#LOCATION#/g, apiRoot)
			.replace(/#AUTH#/g, cookies.auth)
			.replace(/\s{2,}/g, " ");

		return "javascript:(" + encodeURIComponent(href) + ")();";
	}
	render() {
		if (!this.props.isAdmin) return <Redirect to="/login/" />;
		if (!this.state.manual)
			return (
				<form
					className="add-form"
					onSubmit={e => this.onSubmit(e)}
					style={this.props.style}
				>
					<p className="add-form__manual-switch">
						<span
							role="button"
							className="pseudo"
							onClick={() => this.onSwitch()}
						>
							Вручную
						</span>
					</p>
					<div className="add-form__auto">
						<input
							type="text"
							value={this.state.autolink}
							onChange={e => this.setState({ autolink: e.target.value })}
							placeholder="Ссылка на новость"
							className="add-form__article-url"
							ref={ref => (this.autoref = ref)}
						/>
						<input
							className="add-form__submit add-form__submit-auto"
							type="submit"
							value="Добавить"
							disabled={this.state.autolink.length === 0}
							title={
								this.state.autolink.length === 0
									? 'Поле "Ссылка на новость" должно быть заполнено'
									: ""
							}
						/>
					</div>
					{this.state.posting && (
						<p className="add-form__posting">добавляю...</p>
					)}
					<p className="add-form__bookmarklet">
						<span className="add-form__bookmarklet-text">
							закладка для быстрого добавления новости:
						</span>
						<br />
						<a className="add-form__bookmarklet-link" href={this.bookmarklet()}>
							Радио-Т
						</a>
					</p>
					<p className="add-form__drag-message">
						Также можно добавить новость перетянув ссылку на это окно
					</p>
				</form>
			);
		return (
			<form
				className="add-form"
				onSubmit={e => this.onSubmit(e)}
				style={this.props.style}
			>
				<p className="add-form__manual-switch">
					<span
						role="button"
						className="pseudo"
						onClick={() => this.onSwitch()}
					>
						По ссылке
					</span>
				</p>
				<input
					type="text"
					value={this.state.manualLink}
					onChange={e => this.setState({ manualLink: e.target.value })}
					placeholder="Ссылка на новость"
					className="add-form__article-manual-link"
					ref={ref => (this.manualref = ref)}
				/>
				<input
					type="text"
					value={this.state.manualTitle}
					onChange={e => this.setState({ manualTitle: e.target.value })}
					placeholder="Название новости"
					className="add-form__article-title"
				/>
				<textarea
					value={this.state.manualText}
					onChange={e => this.setState({ manualText: e.target.value })}
					placeholder="Описание новости"
					className="add-form__article-description"
				/>
				<input
					className="add-form__submit add-form__submit-manual"
					type="submit"
					value="Добавить"
					disabled={
						this.state.manualLink.length === 0 ||
						this.state.manualTitle.length === 0 ||
						this.state.manualText.length === 0
					}
					title={
						this.state.manualLink.length === 0 ||
						this.state.manualTitle.length === 0 ||
						this.state.manualText.length === 0
							? "Поля должны быть заполнены"
							: ""
					}
				/>
				{this.state.posting && <p className="add-form__posting">добавляю...</p>}
			</form>
		);
	}
	onSwitch() {
		this.setState({ manual: !this.state.manual });
		setTimeout(() => {
			(this.autoref || this.manualref).focus();
		}, 500);
	}
	onDragover(e) {
		if (e.dataTransfer.types.indexOf("text/plain") !== -1) {
			e.dataTransfer.dropEffect = "copy";
			e.preventDefault();
		}
	}
	async onDrop(e) {
		if (e.dataTransfer.types.indexOf("text/plain") === -1) return;
		const data = e.dataTransfer.getData("text/plain");
		const isLink = /^https?:\/\/.*/.test(data);
		if (!isLink) return;
		const url = new URL(data);
		if (url.origin === window.location.origin) return;
		e.preventDefault();

		this.setState({ posting: true });
		try {
			await addArticle(url.href);
			addNotification({
				data: <b>Новость добавлена</b>,
				time: 7000,
			});
			this.props.onAdd && this.props.onAdd();
		} catch (e) {
			console.error(e);
			addNotification({
				data: <b>Произошла ошибка</b>,
				level: "error",
				time: 5000,
			});
		} finally {
			this.setState({ posting: false });
		}
	}
	componentWillMount() {
		document.body.addEventListener("dragover", this.onDragover, false);
		document.body.addEventListener("drop", this.onDrop, false);
		setTimeout(() => {
			(this.autoref || this.manualref).focus();
		}, 500);
	}
	componentWillUnmount() {
		document.body.removeEventListener("dragover", this.onDragover, false);
		document.body.removeEventListener("drop", this.onDrop, false);
	}
	async onSubmit(e) {
		e.preventDefault();
		this.setState({ posting: true });
		try {
			if (!this.state.manual) {
				await addArticle(this.state.autolink);
				this.state.autolink = "";
			} else {
				await addArticle(
					this.state.manualLink,
					this.state.manualTitle,
					this.state.manualText
				);
				this.state.manualLink = "";
				this.state.manualTitle = "";
				this.state.manualText = "";
			}
			addNotification({
				data: <b>Новость добавлена</b>,
				time: 7000,
			});
			this.props.onAdd && this.props.onAdd();
		} catch (e) {
			console.error(e);
			addNotification({
				data: <b>Произошла ошибка</b>,
				level: "error",
				time: 5000,
			});
		} finally {
			this.setState({ posting: false });
		}
	}
}
