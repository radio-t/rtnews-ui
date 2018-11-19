import { createElement, PureComponent } from "react";

import { formatDate, scrollIntoView, waitFor } from "./utils.js";
import { getArticle, addArticle } from "./api.js";
import articleCache from "./articleCache";
import { remark } from "./settings.js";

import Remark from "./remark.jsx";
import Loading from "./loading.jsx";
import SVGInline from "react-svg-inline";
import GearIcon from "./static/svg/gear.svg";
import NotFound from "./notFound.jsx";
import Error from "./error.jsx";
import RichEditor from "./richEditor.jsx";
import { addNotification, removeNotification } from "./store.jsx";

function ArticleFactory(editable = false) {
	return class Article extends PureComponent {
		constructor(props) {
			super(props);
			this.state = {
				article: null,
				error: null,
				previewSnippet: null,
				previewContent: null,
				/**
				 * view|edit|preview
				 */
				mode: "view",
			};
		}
		componentDidMount() {
			getArticle(this.props.slug)
				.then(article => {
					document.title = article.title + "| Новости Радио-Т";
					this.setState({ article });
				})
				.catch(error => {
					this.setState({ error });
				});

			setTimeout(() => {
				const hash = window.location.hash;
				if (hash === "") return;
				const el = document.getElementById(hash.substr(1));
				if (el) {
					scrollIntoView(el);
				}
			}, 200);
		}
		async edit() {
			this.setState({
				previewSnippet: this.state.article.snippet || "",
				previewContent: this.state.article.content || "",
				mode: "edit",
			});
			await waitFor(() => this.snippeteditor, 10000);
			this.snippeteditor.focus();
		}
		cancelEdit() {
			this.setState({
				previewContent: null,
				previewSnippet: null,
				mode: "view",
			});
		}
		preview() {
			this.state.previewSnippet = this.snippeteditor.getContent();
			this.state.previewContent = this.editor.getContent();
			this.setState({ mode: "preview" });
		}
		async save() {
			let notification;
			try {
				const snippet = this.snippeteditor
					? this.snippeteditor.getContent()
					: this.state.previewSnippet;
				const content = this.editor
					? this.editor.getContent()
					: this.state.previewContent;
				notification = addNotification({
					data: "Сохраняю новость",
					time: null,
				});
				await addArticle(
					this.state.article.link,
					this.state.article.title,
					snippet,
					content
				);
				articleCache.invalidate();
				this.setState({
					previewContent: null,
					previewSnippet: null,
					article: { ...this.state.article, snippet, content },
					mode: "view",
				});
				removeNotification(notification);
				addNotification({
					data: "Новость сохранена",
					time: 3000,
				});
			} catch (e) {
				console.error(e);
				removeNotification(notification);
				addNotification({
					data: (
						<span>
							Ошибка при сохранении,{" "}
							<span
								class="pseudo"
								onClick={() => {
									window.location.reload;
								}}
							>
								обновить страницу?
							</span>
						</span>
					),
					level: "error",
					time: 10000,
				});
			}
		}
		render() {
			if (
				this.state.error &&
				this.state.error.status &&
				this.state.error.status === 404
			)
				return <NotFound />;
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
			if (this.state.article === null) return <Loading />;
			return (
				<article className="article">
					<h3 className="title article__title">
						{this.state.article.geek && (
							<SVGInline
								className="icon post__title-geek-icon"
								svg={GearIcon}
								title="Гиковская тема"
							/>
						)}
						<a className="post__title-link" href={this.state.article.origlink}>
							{this.state.article.title}
						</a>
					</h3>
					<div className="post__meta article__meta">
						<a
							className="post__original-link"
							href={this.state.article.origlink}
							title={this.state.article.origlink}
						>
							{this.state.article.domain}
						</a>
						<span
							className="post__timestamp"
							title={this.state.article.ats}
							dangerouslySetInnerHTML={{
								__html: formatDate(
									new Date(Date.parse(this.state.article.ats))
								),
							}}
						/>
					</div>
					{editable && [
						this.state.mode === "view" && (
							<div class="article__edit">
								<span
									class="pseudo article__edit-button"
									onClick={() => this.edit()}
								>
									Редактировать
								</span>
							</div>
						),
						this.state.mode === "edit" && (
							<div class="article__edit">
								<span
									class="pseudo article__edit-button"
									onClick={() => this.cancelEdit()}
								>
									Отменить
								</span>
								{" / "}
								<span
									class="pseudo article__edit-button"
									onClick={() => this.preview()}
								>
									Превью
								</span>
								{" / "}
								<span
									class="pseudo article__edit-button"
									onClick={() => this.save()}
								>
									Сохранить
								</span>
							</div>
						),
						this.state.mode === "preview" && (
							<div class="article__edit">
								<span
									class="pseudo article__edit-button"
									onClick={() => this.cancelEdit()}
								>
									Отменить
								</span>
								{" / "}
								<span
									class="pseudo article__edit-button"
									onClick={() => this.setState({ mode: "edit" })}
								>
									Продолжить
								</span>
								{" / "}
								<span
									class="pseudo article__edit-button"
									onClick={() => this.save()}
								>
									Сохранить
								</span>
							</div>
						),
					]}
					{!editable && (
						<div
							className="article-content article__content"
							dangerouslySetInnerHTML={{
								__html:
									this.state.article.content || this.state.article.snippet,
							}}
						/>
					)}
					{editable &&
						(this.state.mode === "view" || this.state.mode === "preview") && [
							<div
								className="article__snippet"
								dangerouslySetInnerHTML={{
									__html:
										this.state.previewSnippet !== null
											? this.state.previewSnippet
											: this.state.article.snippet || "",
								}}
							/>,
							<div
								className="article-content article__content"
								dangerouslySetInnerHTML={{
									__html:
										this.state.previewContent !== null
											? this.state.previewContent
											: this.state.article.content || "",
								}}
							/>,
						]}
					{this.state.mode === "edit" && [
						<div className="article__editor-title article__editor-title-content">
							Сниппет
						</div>,
						<RichEditor
							className="article__editor"
							content={this.state.previewSnippet || ""}
							ref={ref => (this.snippeteditor = ref)}
							placeholder="сниппет"
							rich={false}
						/>,
						<div className="article__editor-title article__editor-title-snippet">
							Контент
						</div>,
						<RichEditor
							className="article__editor"
							content={this.state.previewContent || ""}
							ref={ref => (this.editor = ref)}
							placeholder="контент"
							rich={true}
						/>,
					]}
					<hr className="article__break" />
					<Remark
						className="article__comments"
						id="to-comments"
						baseurl={remark.baseurl}
						site_id={remark.site_id}
						url={`https://news.radio-t.com/post/${this.state.article.slug}`}
					/>
				</article>
			);
		}
	};
}

export const Article = ArticleFactory(false);
export const EditableArticle = ArticleFactory(true);
