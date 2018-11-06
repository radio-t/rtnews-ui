import React from "react";
import { postsPrefix } from "./settings.js";
import Loading from "./loading.jsx";
import { getNews, moveArticle } from "./api.js";
import { formatDate } from "./utils.js";
import SVGInline from "react-svg-inline";
import CommentsIcon from "./static/svg/i-comment.svg";
import { Redirect, Link } from "react-router-dom";
import ArticleButtons from "./articleButtons.js";

class Item extends React.Component {
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
	onDrag(e) {
		e.dataTransfer.setData(
			"rtnews/article",
			JSON.stringify(this.props.article)
		);
		e.dataTransfer.setData("rtnews/article-id", this.props.article.id);
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
		this.ref.classList.remove("drop-top");
		this.ref.classList.remove("drop-bottom");
	}
	async onDrop(e) {
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
		await moveArticle(data.position, this.props.article.position + append);
		this.props.onMove &&
			this.props.onMove(data.position, this.props.article.position + append);
	}
	render() {
		return (
			<div
				draggable={this.state.draggable}
				className={
					"sorter__item " + (this.props.current ? "sorter__item-current" : "")
				}
				onDragStartCapture={e => this.onDrag(e)}
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
								onClick={() =>
									ArticleButtons[c].fn(
										this.props.article,
										this.props.update || noop
									)
								}
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

export default class Sorter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			articles: [],
			loaded: false,
		};
		this.update();
	}
	update() {
		getNews().then(articles => {
			articles.sort((a, b) => a.position < b.position);
			this.setState({ articles, loaded: true });
		});
	}
	render() {
		if (!this.props.isAdmin) return <Redirect to="/login/" />;
		if (!this.state.loaded) return <Loading />;
		return (
			<div className="sorter">
				{this.state.articles.map(article => (
					<Item
						article={article}
						key={article.id}
						current={this.props.activeId === article.id}
						update={() => this.update()}
						onMove={() => this.update()}
					/>
				))}
			</div>
		);
	}
}