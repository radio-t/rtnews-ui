import { createElement, Component } from "react";

import { formatDate, scrollIntoView } from "./utils.js";
import { postsPrefix, isSafari } from "./settings.js";
import { getArticle } from "./api.js";

import ArticleControls from "./articleControls.jsx";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Loading from "./loading.jsx";
import SVGInline from "react-svg-inline";
import CommentsIcon from "./static/svg/i-comment.svg";
import GearIcon from "./static/svg/gear.svg";

/**
 * Applies "should update only if visible" logic to component
 */
function UpdateOnlyIfVisible(Component) {
	/**
	 * Map which connects HTMLElement with React.Component
	 */
	const refToComponentMap = new WeakMap();

	const observer = new IntersectionObserver(entries => {
		entries.forEach(e => {
			if (refToComponentMap.has(e.target)) {
				const component = refToComponentMap.get(e.target);
				component.visible = e.isIntersecting;
				component.setState({});
			}
		});
	});

	return class extends Component {
		shouldComponentUpdate(nextProps, nextState) {
			if (nextProps.active !== this.props.active) return true;
			if (!this.visible) return false;
			return true;
		}
		componentWillMount() {
			super.componentWillMount && super.componentWillMount();
			this.visible = true;
		}
		componentDidMount() {
			super.componentDidMount && super.componentDidMount();
			refToComponentMap.set(this.ref, this);
			observer.observe(this.ref);
		}
		componentWillUnmount() {
			super.componentWillUnmount && super.componentWillUnmount();
			observer.unobserve(this.ref);
		}
		render() {
			return super.render();
		}
	};
}

/**
 * Applies drag'n'drop logic to component
 */
function Draggable(Component) {
	/**
	 * touchmove targets used by ArticleBase.onHandleTouchMove
	 */
	let moveTargets = [];

	/**
	 * Name of an event which occurs when touch-driven dragg occurs over element
	 */
	const eventIdentifier = "RTNEWSDATADRAG";

	return class extends Component {
		componentDidMount() {
			super.componentDidMount && super.componentDidMount();
			if (!(this.handle && this.ref)) return;

			this.onHandleMouseEnter = this.onHandleMouseEnter.bind(this);
			this.handle.addEventListener("mouseenter", this.onHandleMouseEnter);
			this.onHandleMouseLeave = this.onHandleMouseLeave.bind(this);
			this.handle.addEventListener("mouseleave", this.onHandleMouseLeave);

			this.onHandleTouchStart = this.onHandleTouchStart.bind(this);
			this.handle.addEventListener("touchstart", this.onHandleTouchStart);
			this.onHandleTouchMove = this.onHandleTouchMove.bind(this);
			this.handle.addEventListener("touchmove", this.onHandleTouchMove);
			this.onHandleTouchEnd = this.onHandleTouchEnd.bind(this);
			this.handle.addEventListener("touchend", this.onHandleTouchEnd);

			this.onTouchDrag = this.onTouchDrag.bind(this);
			this.ref.addEventListener(eventIdentifier, this.onTouchDrag);
			this.onTouchDragLeave = this.onTouchDragLeave.bind(this);
			this.ref.addEventListener(
				`${eventIdentifier}Leave`,
				this.onTouchDragLeave
			);
			this.onTouchDragEnd = this.onTouchDragEnd.bind(this);
			this.ref.addEventListener(`${eventIdentifier}End`, this.onTouchDragEnd);

			this.onDrop = this.onDrop.bind(this);
			this.ref.addEventListener("drop", this.onDrop);
			this.onDrag = this.onDrag.bind(this);
			this.ref.addEventListener("drag", this.onDrag);
			this.onDragStart = this.onDragStart.bind(this);
			this.ref.addEventListener("dragstart", this.onDragStart);
			this.onDragOver = this.onDragOver.bind(this);
			this.ref.addEventListener("dragover", this.onDragOver);
			this.onDragLeave = this.onDragLeave.bind(this);
			this.ref.addEventListener("dragleave", this.onDragLeave);
			this.onDragEnd = this.onDragEnd.bind(this);
			this.ref.addEventListener("dragend", this.onDragEnd);
		}
		componentWillUnmount() {
			super.componentWillUnmount && super.componentWillUnmount();
			if (this.ref) {
				this.ref.removeEventListener(eventIdentifier, this.onTouchDrag);
				this.ref.removeEventListener(
					`${eventIdentifier}Leave`,
					this.onTouchDragLeave
				);
				this.ref.removeEventListener(
					`${eventIdentifier}End`,
					this.onTouchDragEnd
				);

				this.ref.removeEventListener("drop", this.onDrop);
				this.ref.removeEventListener("drag", this.onDrag);
				this.ref.removeEventListener("dragstart", this.onDragStart);
				this.ref.removeEventListener("dragover", this.onDragOver);
				this.ref.removeEventListener("dragleave", this.onDragLeave);
				this.ref.removeEventListener("dragend", this.onDragEnd);
			}

			if (this.handle) {
				this.handle.removeEventListener("touchend", this.onHandleTouchEnd);
				this.handle.removeEventListener("touchmove", this.onHandleTouchMove);
				this.handle.removeEventListener("touchstart", this.onHandleTouchStart);

				this.handle.removeEventListener("mouseenter", this.onHandleMouseEnter);
				this.handle.removeEventListener("mouseleave", this.onHandleMouseLeave);
			}
		}
		onHandleMouseEnter(e) {
			this.ref.draggable = this.props.draggable;
		}
		onHandleMouseLeave(e) {
			this.ref.draggable = false;
		}
		onTouchDrag(e) {
			const rect = this.ref.getBoundingClientRect();
			const ratio = (e.relativeCoords.y / rect.height) * 100;
			if (ratio < 50) {
				this.ref.classList.remove("touch-drag-target-bottom");
				this.ref.classList.add("touch-drag-target-top");
			} else {
				this.ref.classList.remove("touch-drag-target-top");
				this.ref.classList.add("touch-drag-target-bottom");
			}
		}
		onTouchDragLeave(e) {
			this.ref.classList.remove("touch-drag-target-top");
			this.ref.classList.remove("touch-drag-target-bottom");
		}
		onTouchDragEnd(e) {
			this.ref.classList.remove("touch-drag-target-top");
			this.ref.classList.remove("touch-drag-target-bottom");
			if (e.data.position === this.props.article.position) return;
			const append = (() => {
				const rect = this.ref.getBoundingClientRect();
				const ratio = (e.relativeCoords.y / rect.height) * 100;
				let append = ratio < 60 ? 1 : 0;
				if (e.data.position < this.props.article.position) append -= 1;
				return append;
			})();
			if (e.data.position === this.props.article.position + append) return;
			this.props.onChange &&
				this.props.onChange("move", {
					id: e.data.id,
					from: e.data.position,
					to: this.props.article.position + append,
				});
		}

		onHandleTouchStart(e) {
			if (e.touches.length > 1) return;
			e.preventDefault();

			this.ref.classList.add("touch-drag-item__start");
			this.ref.classList.add("touch-drag-item");
			this.ref.classList.remove("touch-drag-item__start");
			this.initialTouch = e.touches[0];
			this.initialTransform = this.ref.style.tranform;

			// handle scroll over borders
			this.clientY = e.touches[0].clientY;
			this.dragInterval = setInterval(() => {
				if (this.clientY <= 80) {
					window.scrollBy(0, -((80 - this.clientY) / 2));
				} else if (this.clientY >= window.innerHeight - 80) {
					window.scrollBy(0, (80 - (window.innerHeight - this.clientY)) / 2);
				}
			}, 30);
		}
		onHandleTouchMove(e) {
			this.clientY = e.touches[0].clientY;
			const deltaY = e.touches[0].pageY - this.initialTouch.pageY;
			this.ref.style.transform = `translate(0, ${deltaY}px)`;

			const targets = document.elementsFromPoint(
				e.touches[0].clientX,
				e.touches[0].clientY
			);

			const left = moveTargets.filter(x => targets.indexOf(x) === -1);
			const lEvent = new Event(`${eventIdentifier}Leave`, {
				bubbles: false,
				cancelable: false,
			});
			left.forEach(x => x.dispatchEvent(lEvent));

			moveTargets = targets;

			moveTargets.forEach(x => {
				if (!x) return;
				const event = new Event(eventIdentifier, {
					bubbles: false,
					cancelable: true,
				});
				const tRect = x.getBoundingClientRect();
				event.absoluteCoords = {
					x: e.touches[0].clientX,
					y: e.touches[0].clientY,
				};
				event.relativeCoords = {
					x: e.touches[0].clientX - tRect.x,
					y: e.touches[0].clientY - tRect.y,
				};
				x.dispatchEvent(event);
			});
		}
		onHandleTouchEnd(e) {
			const article = this.props.article;
			clearInterval(this.dragInterval);
			this.ref.classList.remove("touch-drag-item");
			if (this.initialTransform) {
				this.ref.style.transform = this.initialTransform;
			} else {
				this.ref.style.transform = "";
			}

			const targets = document.elementsFromPoint(
				e.changedTouches[0].clientX,
				e.changedTouches[0].clientY
			);
			targets.forEach(x => {
				if (!x) return;
				const event = new Event(`${eventIdentifier}End`, {
					bubbles: false,
					cancelable: true,
				});
				event.data = article;
				const rect = x.getBoundingClientRect();
				event.absoluteCoords = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY,
				};
				event.relativeCoords = {
					x: e.changedTouches[0].clientX - rect.x,
					y: e.changedTouches[0].clientY - rect.y,
				};
				x.dispatchEvent(event);
			});
		}

		onDragStart(e) {
			if (!this.ref.draggable) return;
			this.ref.classList.add("drop-item");
			this.setState({ detailedExpanded: false });
			e.dataTransfer.setData(
				"rtnews/article",
				JSON.stringify(this.props.article)
			);
			e.dataTransfer.setData("rtnews/article-id", this.props.article.id);

			if (isSafari) {
				this.clientY = e.clientY;
				this.dragInterval = setInterval(() => {
					if (this.clientY <= 80) {
						window.scrollBy(0, -((80 - this.clientY) / 2));
					} else if (this.clientY >= window.innerHeight - 80) {
						window.scrollBy(0, (80 - (window.innerHeight - this.clientY)) / 2);
					}
				}, 30);
			}
		}
		onDrag(e) {
			if (isSafari) {
				this.clientY = e.clientY;
			}
		}
		onDragOver(e) {
			if (e.dataTransfer.types.indexOf("rtnews/article") === -1) return;
			e.preventDefault();
			if (
				e.dataTransfer.getData("rtnews/article-id") === this.props.article.id
			) {
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
			clearInterval(this.dragInterval);
			this.ref.classList.remove("drop-item");
			this.ref.classList.remove("drop-top");
			this.ref.classList.remove("drop-bottom");
		}
		async onDrop(e) {
			clearInterval(this.dragInterval);
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
		render() {
			return super.render();
		}
	};
}

/**
 * Views which used in main, archive and deleted listings
 */
class ArticleBriefBasic extends Component {
	constructor(props) {
		super(props);
		this.state = {
			articleText: null,
			detailedExpanded: false,
			draggable: false,
			visible: true,
		};
		this.fetchLock = false;
	}
	fetchArticle() {
		if (this.fetchLock) return;
		if (this.state.articleText !== null) return;
		this.fetchLock = true;
		getArticle(this.props.article.slug)
			.then(article => {
				this.setState({ articleText: article.content });
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
				ref={ref => (this.ref = ref)}
				id={this.props.active && "active-article"}
				className={
					"post " +
					(this.props.active && this.props.active === true ? "post-active" : "")
				}
			>
				<div
					className="post__drag-handle"
					ref={ref => (this.handle = ref)}
					style={{ display: this.props.draggable ? null : "none" }}
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
							scroll={el => {
								setTimeout(() => {
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
							<div className="post__full-content" key="fulltext">
								<div
									class="article-content post__full-content-content"
									dangerouslySetInnerHTML={{ __html: this.state.articleText }}
								/>
								<div
									className="post__full-content-hide"
									onClick={() => {
										if (this.ref) {
											const rect = this.ref.getBoundingClientRect();
											if (rect.y < 0) scrollIntoView(this.ref);
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

export const ArticleBrief = UpdateOnlyIfVisible(ArticleBriefBasic);
export const DraggableArticleBrief = UpdateOnlyIfVisible(
	Draggable(ArticleBriefBasic)
);

/**
 * View which used in sorting listing "/sort/"
 */
export class ArticleSortBasic extends Component {
	constructor(props) {
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
			].filter(x => x !== null);
	}
	render() {
		return (
			<div
				draggable={this.state.draggable}
				className={
					"sorter__item " + (this.props.active ? "sorter__item-current" : "")
				}
				ref={ref => (this.ref = ref)}
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
				<div className="sorter__item-handle" ref={ref => (this.handle = ref)}>
					☰
				</div>
			</div>
		);
	}
}

export const ArticleSort = UpdateOnlyIfVisible(Draggable(ArticleSortBasic));
