import { PureComponent } from "react";

import { formatDate, scrollIntoView, waitFor } from "./utils";
import { getArticleBySlug, updateArticle } from "./api";
import articleCache from "./articleCache";
import { remark, prepTopicsReg } from "./settings";
import { Article as ArticleType } from "./articleInterface";

import Remark from "./remark";
import Loading from "./loading";
import NotFound from "./notFound";
import ErrorComponent from "./error";
import RichEditor from "./richEditor";
import { addNotification, removeNotification } from "./notifications";
import { Notification } from "./notificationInterface";

// @ts-ignore
import SVGInline from "react-svg-inline";
// @ts-ignore
import GearIcon from "./static/svg/gear.svg";

function ArticleHeader({ article }: { article: ArticleType }) {
	return (
		<div>
			<h3 className="title article__title">
				{article.geek && (
					<SVGInline
						className="icon post__title-geek-icon"
						svg={GearIcon}
						title="Гиковская тема"
					/>
				)}
				<a className="post__title-link" href={article.origlink}>
					{article.title}
				</a>
			</h3>
			<div className="post__meta article__meta">
				<a
					className="post__original-link"
					href={article.origlink}
					title={article.origlink}
				>
					{article.domain}
				</a>
				<span
					className="post__timestamp"
					title={article.ats}
					dangerouslySetInnerHTML={{
						__html: formatDate(new Date(Date.parse(article.ats))),
					}}
				/>
			</div>
		</div>
	);
}

type ArticleMode = "view" | "preview" | "edit";

type Props = {
	slug: string;
};

type State = {
	article: ArticleType | null;
	error: {
		status?: number;
		statusText?: string;
		message: string;
	} | null;
	previewSnippet: string | null;
	previewContent: string | null;
	mode: ArticleMode;
};

function ArticleFactory(editable: boolean = false) {
	return class Article extends PureComponent<Props, State> {
		protected snippeteditor: RichEditor | null;
		protected editor: RichEditor | null;
		constructor(props: Props) {
			super(props);
			this.state = {
				article: null,
				error: null,
				previewSnippet: null,
				previewContent: null,
				mode: "view",
			};
			this.snippeteditor = null;
			this.editor = null;
		}
		componentDidMount() {
			getArticleBySlug(this.props.slug)
				.then(article => {
					if (article === null) {
						throw new Error("Unknown article");
					}
					document.title = article.title + " | Новости Радио-Т";
					this.setState({ article });
				})
				.catch(error => {
					this.setState({ error });
				});

			window.setTimeout(() => {
				const hash = window.location.hash;
				if (hash === "") return;
				const el = document.getElementById(hash.substr(1));
				if (el) {
					scrollIntoView(el);
				}
			}, 200);
		}
		protected async edit() {
			this.setState({
				previewSnippet: (this.state.article as ArticleType).snippet || "",
				previewContent: (this.state.article as ArticleType).content || "",
				mode: "edit",
			});
			await waitFor(() => !!this.snippeteditor, 10000);
			this.snippeteditor && this.snippeteditor.focus();
		}
		protected cancelEdit() {
			this.setState({
				previewContent: null,
				previewSnippet: null,
				mode: "view",
			});
		}
		protected preview() {
			this.setState({
				previewSnippet: (this.snippeteditor as RichEditor).getContent(),
				previewContent: (this.editor as RichEditor).getContent(),
				mode: "preview",
			});
		}
		protected async save() {
			let notification: Notification | null = null;
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
				await updateArticle({
					...this.state.article,
					content: content as string,
					snippet: snippet as string,
				});
				articleCache.invalidate();
				this.setState({
					previewContent: null,
					previewSnippet: null,
					article: {
						...this.state.article,
						snippet: snippet as string,
						content: content as string,
					} as ArticleType,
					mode: "view",
				});
				removeNotification(notification);
				addNotification({
					data: "Новость сохранена",
					time: 3000,
				});
			} catch (e) {
				console.error(e);
				if (notification) removeNotification(notification);
				addNotification({
					data: (
						<span>
							Ошибка при сохранении,{" "}
							<span
								className="pseudo"
								onClick={() => {
									window.location.reload;
								}}
							>
								обновить страницу?
							</span>
						</span>
					),
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
					<ErrorComponent
						code={this.state.error.status || 500}
						message={
							this.state.error.statusText ||
							this.state.error.message ||
							"Произошла ошибка"
						}
					/>
				);
			if (this.state.article === null) return <Loading />;
			if (prepTopicsReg.test(this.state.article.origlink)) {
				return (
					<article className="article">
						<ArticleHeader article={this.state.article} />
						<Remark
							baseurl={remark.baseurl}
							site_id="radiot"
							id="to-comments"
							className="article__remark-comments"
							url={this.state.article.origlink}
						/>
					</article>
				);
			}
			return (
				<article className="article">
					<ArticleHeader article={this.state.article} />
					{editable && [
						this.state.mode === "view" && (
							<div className="article__edit">
								<span
									className="pseudo article__edit-button article__edit-button-edit"
									onClick={() => this.edit()}
								>
									Редактировать
								</span>
							</div>
						),
						this.state.mode === "edit" && (
							<div className="article__edit">
								<span
									className="pseudo article__edit-button"
									onClick={() => this.cancelEdit()}
								>
									Отменить
								</span>
								{" / "}
								<span
									className="pseudo article__edit-button"
									onClick={() => this.preview()}
								>
									Превью
								</span>
								{" / "}
								<span
									className="pseudo article__edit-button"
									onClick={() => this.save()}
								>
									Сохранить
								</span>
							</div>
						),
						this.state.mode === "preview" && (
							<div className="article__edit">
								<span
									className="pseudo article__edit-button"
									onClick={() => this.cancelEdit()}
								>
									Отменить
								</span>
								{" / "}
								<span
									className="pseudo article__edit-button"
									onClick={() => this.setState({ mode: "edit" })}
								>
									Продолжить
								</span>
								{" / "}
								<span
									className="pseudo article__edit-button"
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
					{editable && this.state.mode === "preview" && (
						<div
							className="article__snippet"
							dangerouslySetInnerHTML={{
								__html:
									this.state.previewSnippet !== null
										? this.state.previewSnippet
										: this.state.article.snippet || "",
							}}
						/>
					)}
					{editable &&
						(this.state.mode === "view" || this.state.mode === "preview") && (
							<div
								className="article-content article__content"
								dangerouslySetInnerHTML={{
									__html:
										this.state.previewContent !== null
											? this.state.previewContent
											: this.state.article.content || "",
								}}
							/>
						)}
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
