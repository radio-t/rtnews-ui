import React from "react";

import { formatDate } from "./utils.js";
import { postsPrefix, isSafari } from "./settings.js";
import ArticleButtons from "./articleButtons.js";
import { getArticle } from "./api.js";

import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Loading from "./loading.jsx";
import SVGInline from "react-svg-inline";
import CommentsIcon from "./static/svg/i-comment.svg";

/**
 * Base for article view
 *
 * Provides with basic drag'n'drop handlers
 */
class ArticleBase extends React.PureComponent {
	onDragStart(e) {
		this.ref.classList.add("drop-item");
		this.setState({ detailedExpanded: false });
		e.dataTransfer.setData(
			"rtnews/article",
			JSON.stringify(this.props.article)
		);
		e.dataTransfer.setData("rtnews/article-id", this.props.article.id);
	}
	onDrag(e) {
		if (isSafari) {
			if (e.clientY <= 70) {
				window.scrollBy(0, -((70 - e.clientY) / 5));
			} else if (e.clientY >= window.innerHeight - 70) {
				window.scrollBy(0, (70 - (window.innerHeight - e.clientY)) / 5);
			}
		}
	}
	onDragOver(e) {
		if (e.dataTransfer.types.indexOf("rtnews/article") === -1) return;
		e.preventDefault();
		if (e.dataTransfer.getData("rtnews/article-id") === this.props.article.id) {
			this.ref.classList.remove("drop-top");
			this.ref.classList.remove("drop-bottom");
			return;
		}
		let append = (() => {
			const rect = e.currentTarget.getBoundingClientRect();
			const y = e.clientY - rect.y;
			const proportion = (y / rect.height) * 100;
			return proportion < 60 ? 1 : 0;
		})();
		if (append === 1) {
			this.ref.classList.remove("drop-bottom");
			this.ref.classList.add("drop-top");
		} else {
			this.ref.classList.remove("drop-top");
			this.ref.classList.add("drop-bottom");
		}
	}
	onDragLeave(e) {
		this.ref.classList.remove("drop-top");
		this.ref.classList.remove("drop-bottom");
	}
	onDragEnd(e) {
		this.ref.classList.remove("drop-item");
		this.ref.classList.remove("drop-top");
		this.ref.classList.remove("drop-bottom");
	}
	async onDrop(e) {
		this.ref.classList.remove("drop-item");
		this.ref.classList.remove("drop-top");
		this.ref.classList.remove("drop-bottom");
		if (e.dataTransfer.types.indexOf("rtnews/article") === -1) return;
		e.preventDefault();
		const data = JSON.parse(e.dataTransfer.getData("rtnews/article"));
		if (data.position === this.props.article.position) return;
		let append = (() => {
			const rect = e.currentTarget.getBoundingClientRect();
			const y = e.clientY - rect.y;
			const proportion = (y / rect.height) * 100;
			return proportion < 60 ? 1 : 0;
		})();
		if (data.position < this.props.article.position) append -= 1;
		if (data.position === this.props.article.position + append) return;
		this.props.onChange &&
			this.props.onChange("move", {
				id: data.id,
				from: data.position,
				to: this.props.article.position + append,
			});
	}
}

/**
 * Views which used in main, archive and deleted listings
 */
export class ArticleBrief extends ArticleBase {
	constructor(props) {
		super(props);
		this.state = {
			articleText: null,
			detailedExpanded: false,
			fetchLock: false,
			draggable: false,
		};
	}
	fetchArticle() {
		if (this.state.fetchLock) return;
		if (this.state.articleText !== null) return;
		this.setState({ fetchLock: true });
		getArticle(this.props.article.slug)
			.then(article => {
				this.setState({ articleText: article.content });
			})
			.catch(e => {
				this.setState({
					articleText: "Не смог загрузить новость",
					fetchLock: false,
				});
				console.error(e);
			});
	}
	render() {
		return (
			<article
				key={this.props.article.id}
				id={this.props.active && "active-article"}
				className={
					"post " +
					(this.props.active && this.props.active === true ? "post-active" : "")
				}
				draggable={this.state.draggable && this.props.draggable}
				onDragStartCapture={e => this.onDragStart(e)}
				onDrag={e => this.onDrag(e)}
				onDragOver={e => this.onDragOver(e)}
				onDragLeave={e => this.onDragLeave(e)}
				onDragEnd={e => this.onDragEnd(e)}
				onDrop={e => this.onDrop(e)}
				ref={ref => (this.ref = ref)}
			>
				{this.props.draggable && (
					<div
						className="post__drag-handle"
						onMouseEnter={() => this.setState({ draggable: true })}
						onMouseLeave={() => this.setState({ draggable: false })}
					/>
				)}
				{this.props.controls && (
					<div className="post-controls post__controls">
						{this.props.controls.map(c => (
							<span
								role="button"
								className={
									"post-controls__control " + `post-controls__control-${c}`
								}
								key={c}
								onClick={() => this.props.onChange && this.props.onChange(c)}
							>
								{ArticleButtons[c].title}
							</span>
						))}
					</div>
				)}
				{this.props.article.pic &&
					!this.props.archive && (
						<div
							className="post__image-container"
							style={{ backgroundImage: `url(${this.props.article.pic})` }}
						/>
					)}
				<h3 className="title post__title">
					{this.props.article.geek && (
						<span className="post__title-geek" title="Гиковская тема">
							•
						</span>
					)}
					<Link
						className="post__title-link"
						to={`${postsPrefix}/${this.props.article.slug}`}
					>
						{this.props.article.title || (
							<span className="post__empty-title">No Title</span>
						)}
					</Link>
				</h3>
				<div className="post__meta">
					<a
						className="post__original-link"
						href={this.props.article.origlink}
						title={this.props.article.origlink}
					>
						{this.props.article.domain}
					</a>
					<span
						className="post__timestamp"
						title={this.props.article.ats}
						dangerouslySetInnerHTML={{
							__html: formatDate(new Date(Date.parse(this.props.article.ats))),
						}}
					/>
					<HashLink
						className="post__comments-link"
						to={`${postsPrefix}/${this.props.article.slug}#to-comments`}
						scroll={el => {
							setTimeout(() => {
								el.scrollIntoView({ behavior: "smooth" });
							}, 500);
						}}
					>
						<SVGInline
							className="icon post__comments-icon"
							svg={CommentsIcon}
						/>
						{this.props.article.comments}
					</HashLink>
				</div>
				{!this.props.archive && [
					<div key="paragraph" className="post__snippet">
						<p
							dangerouslySetInnerHTML={{ __html: this.props.article.snippet }}
						/>
					</div>,
					<span
						key="detailed"
						className="pseudo post__detailed-link"
						to={`${postsPrefix}/${this.props.article.slug}`}
						ref={ref => (this.detailedRef = ref)}
						onClick={e => {
							this.setState({ detailedExpanded: !this.state.detailedExpanded });
							this.fetchArticle();
						}}
					>
						{this.state.detailedExpanded ? "Скрыть" : "Подробнее"}
					</span>,
					this.state.detailedExpanded &&
						(this.state.articleText === null ? (
							<div className="post__full-content" key="fulltext">
								<Loading />
							</div>
						) : (
							<div
								className="article-content post__full-content"
								key="fulltext"
							>
								<div
									class="article-content post__full-content-content"
									dangerouslySetInnerHTML={{ __html: this.state.articleText }}
								/>
								<div
									className="post__full-content-hide"
									onClick={() => {
										if (this.detailedRef) this.detailedRef.scrollIntoView();
										this.setState({ detailedExpanded: false });
									}}
								>
									×
								</div>
							</div>
						)),
				]}
			</article>
		);
	}
}

/**
 * View which used in sorting listing "/sort/"
 */
export class ArticleSort extends ArticleBase {
	constructor(props) {
		super(props);
		this.state = {
			draggable: false,
		};
		this.controls = () =>
			[
				!this.props.current ? "make-current" : null,
				this.props.article.geek ? "make-ungeek" : "make-geek",
				"archive",
				"remove",
			].filter(x => x !== null);
	}
	render() {
		return (
			<div
				draggable={this.state.draggable}
				className={
					"sorter__item " + (this.props.current ? "sorter__item-current" : "")
				}
				onDragStartCapture={e => this.onDragStart(e)}
				onDrag={e => this.onDrag(e)}
				onDragOver={e => this.onDragOver(e)}
				onDragLeave={e => this.onDragLeave(e)}
				onDragEnd={e => this.onDragEnd(e)}
				onDrop={e => this.onDrop(e)}
				ref={ref => (this.ref = ref)}
			>
				<div className="sorter__item-content">
					<div className="post-controls sorter__item-controls">
						{this.controls().map(c => (
							<span
								role="button"
								className={
									"post-controls__control " + `post-controls__control-${c}`
								}
								key={c}
								onClick={() => this.props.onChange && this.props.onChange(c)}
							>
								{ArticleButtons[c].title}
							</span>
						))}
					</div>
					<div className="sorter__item-header">
						{this.props.article.geek && (
							<span className="sorter__geek-indicator" title="Гиковская тема">
								•
							</span>
						)}
						<Link
							to={`${postsPrefix}/${this.props.article.slug}`}
							className="sorter__item-link"
						>
							{this.props.article.title.trim()}
						</Link>
					</div>
					<div className="sorter__item-meta">
						<a
							className="sorter__item-original-link"
							href={this.props.article.origlink}
							title={this.props.article.origlink}
						>
							{this.props.article.domain}
						</a>
						<span
							className="sorter__item-timestamp"
							title={this.props.article.ats}
							dangerouslySetInnerHTML={{
								__html: formatDate(
									new Date(Date.parse(this.props.article.ats))
								),
							}}
						/>
						<span className="sorter__comments-link">
							<SVGInline
								className="icon sorter__comments-icon"
								svg={CommentsIcon}
							/>
							&nbsp;
							{this.props.article.comments}
						</span>
					</div>
				</div>
				<div
					className="sorter__item-handle"
					ref={this.handle}
					onMouseEnter={() => this.setState({ draggable: true })}
					onMouseLeave={() => this.setState({ draggable: false })}
				>
					☰
				</div>
			</div>
		);
	}
}
