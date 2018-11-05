import React from "react";
import ArticleBrief from "./articleBrief.jsx";
import ListingActions from "./listingActions.jsx";
import { Redirect } from "react-router-dom";
import {
	archiveSortings,
	postRecentness,
	postLevels,
	sortings,
} from "./settings.js";
import { first } from "./utils.js";
import {
	getNews,
	getArchiveNews,
	getDeletedNews,
	getRecentness,
	setRecentness,
	getPostLevel,
	setPostLevel,
	getSorting,
	setSorting,
	getArchiveSorting,
	setArchiveSorting,
} from "./api.js";
import AddArticle from "./add.jsx";
import Loading from "./loading.jsx";
import { sleep } from "./utils.js";

export class Listing extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			postRecentness: getRecentness(),
			postLevel: getPostLevel(),
			sort: getSorting(),
			loaded: false,
			news: [],
			addFormExpanded: false,
		};
	}
	render() {
		if (!this.state.loaded) return <Loading />;
		return (
			<>
				<ListingActions
					includeFilters={true}
					postRecentness={this.state.postRecentness}
					onRecentnessChange={postRecentness => {
						this.setState({ postRecentness });
						setRecentness(postRecentness);
					}}
					postLevel={this.state.postLevel}
					onPostLevelChange={postLevel => {
						const level = first(postLevels, x => x.title === postLevel);
						this.setState({
							postLevel: level,
						});
						setPostLevel(level);
					}}
					sort={this.state.sort}
					onSortingChange={sort => {
						this.setState({ sort });
						setSorting(sort);
					}}
					className={this.props.isAdmin ? "listing-actions-all" : ""}
				/>
				{this.props.isAdmin && (
					<div
						className={
							"add-form-overlay " +
							(this.state.addFormExpanded ? "add-form-overlay-expanded" : "")
						}
					>
						{!this.state.addFormExpanded && (
							<span
								className="pseudo add-form-overlay__control"
								onClick={() => {
									this.setState({ addFormExpanded: true });
									setTimeout(() => {
										const el =
											document.querySelector(".add-form__article-url") ||
											document.querySelector(".add-form__article-manual-link");
										if (el) el.focus();
									}, 500);
								}}
							>
								Добавить новость
							</span>
						)}
						{this.state.addFormExpanded && (
							<span
								className="pseudo add-form-overlay__control"
								onClick={() => this.setState({ addFormExpanded: false })}
							>
								Закрыть
							</span>
						)}
						<AddArticle
							{...this.props}
							style={{ display: this.state.addFormExpanded ? null : "none" }}
							onAdd={() => {
								sleep(1000).then(() => {
									this.update();
								});
							}}
						/>
					</div>
				)}
				<div className="news page__news">
					{[...this.state.news]
						.sort((a, b) => this.state.sort.fn(a, b))
						.filter(
							(x, i) =>
								this.state.postRecentness.fn(
									x,
									i,
									this.state.postLevel.hasOwnProperty("isgeek")
								) && this.state.postLevel.fn(x, i)
						)
						.map((x, i) => {
							const isCurrent = x.id === this.props.activeId;
							const sortIsDefault =
								this.state.postRecentness === postRecentness[0] &&
								this.state.postLevel === postLevels[0] &&
								this.state.sort === sortings[0];
							const getControls = () => {
								const isNotFirst = sortIsDefault && i !== 0;
								return [
									!isCurrent ? "make-current" : null,
									isNotFirst ? "make-first" : null,
									x.geek ? "make-ungeek" : "make-geek",
									"archive",
									"remove",
								].filter(x => x !== null);
							};
							return (
								<ArticleBrief
									key={x.id}
									article={x}
									archive={false}
									isAdmin={this.props.isAdmin}
									controls={this.props.isAdmin ? getControls() : []}
									update={() => this.update()}
									active={isCurrent}
									draggable={this.props.isAdmin && sortIsDefault}
									onMove={() => this.update()}
								/>
							);
						})}
				</div>
			</>
		);
	}
	async update() {
		const news = await getNews();
		this.setState({ news, loaded: true });
	}
	async componentWillMount() {
		this.update();
	}
}

export class ArchiveListing extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			postRecentness: postRecentness[0],
			postLevel: postLevels[0],
			sort: getArchiveSorting(),
			news: [],
			loaded: false,
		};
	}
	render() {
		if (!this.state.loaded) return <Loading />;
		return (
			<>
				<ListingActions
					includeFilters={false}
					sort={this.state.sort}
					sortings={archiveSortings}
					onSortingChange={sort => {
						this.setState({ sort });
						setArchiveSorting(sort);
					}}
				/>
				<div className="news page__news">
					{[...this.state.news]
						.sort((a, b) => this.state.sort.fn(a, b))
						.map(x => (
							<ArticleBrief
								key={x.id}
								article={x}
								archive={true}
								isAdmin={this.props.isAdmin}
								controls={this.props.isAdmin ? ["remove"] : []}
								update={() => this.update()}
							/>
						))}
				</div>
			</>
		);
	}
	async update() {
		const news = await getArchiveNews();
		this.setState({ news, loaded: true });
	}
	async componentWillMount() {
		this.update();
	}
}

export class DeletedListing extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			postRecentness: postRecentness[0],
			postLevel: postLevels[0],
			sort: getArchiveSorting(),
			news: [],
			loaded: false,
		};
	}
	render() {
		if (!this.props.isAdmin) return <Redirect to="/login/" />;
		if (!this.state.loaded) return <Loading />;
		return (
			<div className="news deleted-news page__news">
				{[...this.state.news]
					.sort((a, b) => Date.parse(a.ats) < Date.parse(b.ats))
					.map(x => (
						<ArticleBrief
							key={x.id}
							article={x}
							isAdmin={this.props.isAdmin}
							controls={this.props.isAdmin ? ["restore"] : []}
							update={() => this.update()}
						/>
					))}
			</div>
		);
	}
	async update() {
		const news = await getDeletedNews();
		this.setState({ news, loaded: true });
	}
	async componentWillMount() {
		this.update();
	}
}
