import React from "react";

import { formatDate, scrollIntoView } from "./utils.js";
import { getArticle } from "./api.js";
import { remark } from "./settings.js";

import Remark from "./remark.jsx";
import Loading from "./loading.jsx";
import SVGInline from "react-svg-inline";
import GearIcon from "./static/svg/gear.svg";
import NotFound from "./notFound.jsx";
import Error from "./error.jsx";

export default class Article extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			article: null,
			error: null,
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
			<article className="full-post">
				<h3 className="title full-post__title">
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
				<div className="post__meta full-post__meta">
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
							__html: formatDate(new Date(Date.parse(this.state.article.ats))),
						}}
					/>
				</div>
				<div
					className="article-content full-post__content"
					dangerouslySetInnerHTML={{
						__html: this.state.article.content || this.state.article.snippet,
					}}
				/>
				<hr className="full-post__break" />
				<Remark
					className="full-post__comments"
					id="to-comments"
					baseurl={remark.baseurl}
					site_id={remark.site_id}
					url={`https://news.radio-t.com/post/${this.state.article.slug}`}
				/>
			</article>
		);
	}
}
