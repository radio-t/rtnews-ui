import React from "react";
import { formatDate } from "./utils.js";
import SVGInline from "react-svg-inline";
import CommentsIcon from "./static/svg/i-comment.svg";
import { postsPrefix } from "./settings.js";
import { Link } from "react-router-dom";
import ArticleButtons from "./articleButtons.js";
import FeedLabel from "./FeedLabel.jsx";

const noop = () => {};

export default function ArticleBrief(props) {
	return (
		<article
			key={props.article.id}
			className={
				"post " + (props.active && props.active === true ? "post-active" : "")
			}
		>
			{props.controls && (
				<div className="post-controls post__controls">
					{props.controls.map(c => (
						<span
							role="button"
							className={
								"post-controls__control " + `post-controls__control-${c}`
							}
							key={c}
							onClick={() =>
								ArticleButtons[c].fn(props.article, props.update || noop)
							}
						>
							{ArticleButtons[c].title}
						</span>
					))}
				</div>
			)}
			{props.article.pic &&
				!props.archive && (
					<div
						className="post__image-container"
						style={{ backgroundImage: `url(${props.article.pic})` }}
					/>
				)}
			<h3 className="title post__title">
				{props.article.geek && (
					<span className="post__title-geek" title="Гиковская тема">
						•
					</span>
				)}
				<Link
					className="post__title-link"
					to={`${postsPrefix}/${props.article.slug}`}
				>
					{props.article.title || (
						<span className="post__empty-title">No Title</span>
					)}
				</Link>
			</h3>
			<div className="post__meta">
				<a
					className="post__original-link"
					href={props.article.origlink}
					title={props.article.origlink}
				>
					{props.article.domain}
				</a>
				<FeedLabel feed={props.article.feed} />
				<span
					className="post__timestamp"
					title={props.article.ats}
					dangerouslySetInnerHTML={{
						__html: formatDate(new Date(Date.parse(props.article.ats))),
					}}
				/>
				<Link
					className="post__comments-link"
					to={`${postsPrefix}/${props.article.slug}#to-comments`}
				>
					<SVGInline className="icon post__comments-icon" svg={CommentsIcon} />
					{props.article.comments}
				</Link>
			</div>
			{!props.archive && [
				<p key="paragraph" className="post__snippet">
					{props.article.snippet}
				</p>,
				<Link
					key="detailed"
					className="post__detailed-link"
					to={`${postsPrefix}/${props.article.slug}`}
				>
					Подробнее
				</Link>,
			]}
		</article>
	);
}
