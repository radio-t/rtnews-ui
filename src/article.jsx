import React from "react";
import { formatDate } from "./utils.js";
import { getArticle } from "./api.js";
import Remark from "./remark.jsx";
import Loading from "./loading.jsx";
import FeedLabel from "./feedLabel.jsx";

export default class Article extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			article: null,
		};
		getArticle(props.slug).then(article => {
			document.title = article.title + "| Новости Радио-Т";
			this.setState({ ...this.state, article });
		});
	}

	render() {
		if (this.state.article === null) return <Loading />;
		return (
			<article className="full-post">
				<h3 className="title full-post__title">
					{this.state.article.geek && (
						<span className="post__title-geek" title="Гиковская тема">
							•
						</span>
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
					{this.props.isAdmin && <FeedLabel feed={this.state.article.feed} />}
					<span
						className="post__timestamp"
						title={this.state.article.ats}
						dangerouslySetInnerHTML={{
							__html: formatDate(new Date(Date.parse(this.state.article.ats))),
						}}
					/>
				</div>
				<div
					className="full-post__content"
					dangerouslySetInnerHTML={{
						__html: this.state.article.content || this.state.article.snippet,
					}}
				/>
				<hr className="full-post__break" />
				<Remark
					className="full-post__comments"
					id="to-comments"
					config={{
						site_id: "radiot",
					}}
				/>
			</article>
		);
	}
	componentDidMount() {
		setTimeout(() => {
			const hash = window.location.hash;
			if (hash === "") return;
			const el = document.getElementById(hash.substr(1));
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}, 200);
	}
}
