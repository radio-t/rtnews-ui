import { Component } from "react";

import { formatDate, scrollIntoView } from "./utils";
import {
	postsPrefix,
	activeArticleID,
	prepTopicsReg,
	remark,
} from "./settings";
import { getArticleBySlug } from "./api";
import { connect } from "react-redux";
import { State as StoreState } from "./store";

import ArticleControls, { ControlID, ChangeID } from "./articleControls";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Loading from "./loading";

// @ts-ignore
import SVGInline from "react-svg-inline";
// @ts-ignore
import CommentsIcon from "./static/svg/i-comment.svg";
// @ts-ignore
import GearIcon from "./static/svg/gear.svg";
import { Article } from "./articleInterface";
import Remark from "./remark";
import UpdateIfVisible from "./visibilityDependant";
import Draggable from "./draggable";

const RemarkWithTheme = connect(
	(state: StoreState): { theme: "light" | "dark" } => {
		return {
			theme: state.theme === "day" ? "light" : "dark",
		};
	}
)(Remark);

type ArticleBriefBasicProps = {
	article: Article;
	active?: boolean;
	controls?: ControlID[] | null;
	onChange?: (change: ChangeID, data?: any) => Promise<void>;
	archive?: boolean;
	draggable?: boolean;
	onMove?: (data: any, positionA: number, positionB: number) => void;
};

type ArticleBriefBasicState = {
	articleText: string | null;
	detailedExpanded?: boolean;
};

/**
 * Views which used in main, archive and deleted listings
 */
class ArticleBriefBasic extends Component<
	ArticleBriefBasicProps,
	ArticleBriefBasicState
> {
	fetchLock: boolean;
	mainElement?: HTMLElement;
	dragHandle?: HTMLElement;
	getPosition: () => number;
	getData: () => string;
	protected detailedRef: HTMLSpanElement | null;
	constructor(props: any) {
		super(props);
		this.state = {
			articleText: null,
			detailedExpanded: false,
		};
		this.fetchLock = false;
		this.detailedRef = null;
		this.getPosition = () => this.props.article.position;
		this.getData = () => this.props.article.id;
	}
	protected fetchArticle() {
		if (this.fetchLock) return;
		if (this.state.articleText !== null) return;
		this.fetchLock = true;
		getArticleBySlug(this.props.article.slug)
			.then(article => {
				this.setState({ articleText: article!.content! });
			})
			.catch(e => {
				this.setState({
					articleText: "Не смог загрузить новость",
				});
				this.fetchLock = false;
				console.error(e);
			});
	}
	render() {
		return (
			<article
				key={this.props.article.id}
				ref={ref => (this.mainElement = ref!)}
				id={this.props.active ? activeArticleID : undefined}
				className={
					"post " +
					(this.props.active && this.props.active === true ? "post-active" : "")
				}
			>
				<div
					className="post__drag-handle"
					ref={ref => (this.dragHandle = ref!)}
					style={{ display: this.props.draggable ? "" : "none" }}
				/>
				{this.props.controls && (
					<ArticleControls
						className="post__controls"
						controls={this.props.controls}
						onChange={change =>
							this.props.onChange && this.props.onChange(change)
						}
					/>
				)}
				{this.props.article.pic && !this.props.archive && (
					<div
						className="post__image-container"
						style={{ backgroundImage: `url(${this.props.article.pic})` }}
					/>
				)}
				<h3 className="title post__title ">
					{this.props.article.geek && (
						<SVGInline
							className="icon post__title-geek-icon"
							svg={GearIcon}
							title="Гиковская тема"
						/>
					)}
					<Link
						className={
							"post__title-link " +
							(this.props.article.geek ? "post__title-link--geek" : "")
						}
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
					{!this.props.archive && (
						<HashLink
							className="post__comments-link"
							to={`${postsPrefix}/${this.props.article.slug}#to-comments`}
							scroll={(el: HTMLElement) => {
								window.setTimeout(() => {
									scrollIntoView(el);
								}, 500);
							}}
						>
							<SVGInline
								className="icon post__comments-icon"
								svg={CommentsIcon}
							/>
							{this.props.article.comments}
						</HashLink>
					)}
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
						ref={ref => (this.detailedRef = ref)}
						onClick={() => {
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
							<div className="post__full-content" key="fulltext">
								{prepTopicsReg.test(this.props.article.origlink) ? (
									<div className="article-content post__full-content-content post__remark-comments">
										<RemarkWithTheme
											baseurl={remark.baseurl}
											site_id="radiot"
											id="to-comments"
											url={this.props.article.origlink}
										/>
									</div>
								) : (
									<div
										className="article-content post__full-content-content"
										dangerouslySetInnerHTML={{ __html: this.state.articleText }}
									/>
								)}
								<div
									className="post__full-content-hide"
									onClick={() => {
										if (this.mainElement) {
											const rect = this.detailedRef!.getBoundingClientRect();
											if (((rect as any).y || rect.top) < 0)
												scrollIntoView(this.mainElement);
										}
										this.setState({ detailedExpanded: false });
									}}
									title="К заголовку"
								>
									<span className="post__full-content-hide-button">^</span>
								</div>
							</div>
						)),
				]}
			</article>
		);
	}
}

export const ArticleBrief = UpdateIfVisible(ArticleBriefBasic, ["active"]);

export const DraggableArticleBrief = Draggable(
	(ArticleBrief as unknown) as new (
		props: ArticleBriefBasicProps
	) => ArticleBriefBasic,
	"rtnews/article"
);

type ArticleSortBasicProps = {
	active?: boolean;
	article: Article;
	onChange?: (id: ChangeID, data?: any) => Promise<void>;
	onMove: (data: any, from: number, to: number) => void;
	draggable?: boolean;
};

type ArticleSortBasicState = {};

/**
 * View which used in sorting listing "/sort/"
 */
export class ArticleSortBasic extends Component<
	ArticleSortBasicProps,
	ArticleSortBasicState
> {
	protected controls: () => ControlID[];
	mainElement?: HTMLDivElement;
	dragHandle?: HTMLDivElement;
	getPosition: () => number;
	getData: () => string;
	constructor(props: any) {
		super(props);
		this.state = {
			draggable: false,
		};
		this.controls = () =>
			[
				!this.props.active ? "make-current" : null,
				this.props.article.geek ? "make-ungeek" : "make-geek",
				"archive",
				"remove",
			].filter(x => x !== null) as ControlID[];
		this.getPosition = () => this.props.article.position;
		this.getData = () => this.props.article.id;
	}
	render() {
		return (
			<div
				className={
					"sorter__item " + (this.props.active ? "sorter__item-current" : "")
				}
				ref={ref => (this.mainElement = ref!)}
			>
				<div className="sorter__item-content">
					<ArticleControls
						className="sorter__item-controls"
						controls={this.controls()}
						onChange={change =>
							this.props.onChange && this.props.onChange(change)
						}
					/>
					<div className="sorter__item-header">
						{this.props.article.geek && (
							<SVGInline
								className="icon sorter__geek-indicator"
								svg={GearIcon}
								title="Гиковская тема"
							/>
						)}
						<Link
							to={`${postsPrefix}/${this.props.article.slug}`}
							className={
								"sorter__item-link " +
								(this.props.article.geek ? "sorter__item-link--geek" : "")
							}
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
					ref={ref => (this.dragHandle = ref!)}
				>
					☰
				</div>
			</div>
		);
	}
}

export const ArticleSort = Draggable(
	(UpdateIfVisible(ArticleSortBasic, ["active"]) as unknown) as new (
		props: ArticleSortBasicProps
	) => ArticleSortBasic,
	"rtnews/article"
);
