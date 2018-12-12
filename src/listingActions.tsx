import { Component } from "react";

import {
	postRecentness,
	PostRecentness,
	Sorting,
	postLevels,
	PostLevel,
	PostLevelString,
	sortings,
} from "./settings";
import Select from "./select";

type Props = {
	postRecentness?: PostRecentness;
	includeFilters?: boolean;
	className?: string;
	postLevel: PostLevel;
	onPostLevelChange: (label: PostLevelString) => void;
	onRecentnessChange: (value: PostRecentness) => void;
	sortings?: Sorting[];
	sort: Sorting;
	onSortingChange: (sort: Sorting) => void;
};

export default class ListingActions extends Component<Props> {
	render() {
		return (
			<div className={"listing-actions " + (this.props.className || "")}>
				{this.props.includeFilters ? (
					<div className="listing-actions__filters">
						{this.props.postRecentness && (
							<button
								className={
									"listing-actions__news-recent-button " +
									(this.props.postRecentness === postRecentness[1]
										? "listing-actions__news-recent-button-active"
										: "")
								}
								onMouseDown={() => {
									const val =
										this.props.postRecentness === postRecentness[0]
											? postRecentness[1]
											: postRecentness[0];
									this.props.onRecentnessChange &&
										this.props.onRecentnessChange(val);
								}}
							>
								<span style={{ borderBottom: "1px dashed" }}>Свежие</span>
							</button>
						)}
						<Select
							items={postLevels.map(x => x.title)}
							value={this.props.postLevel.title}
							onChange={(e) =>
								this.props.onPostLevelChange && this.props.onPostLevelChange(e as PostLevelString)
							}
							className={`listing-actions__news-type-select ${
								this.props.postLevel.title !== postLevels[0].title
									? "listing-actions__news-type-select-selected"
									: ""
							}`}
						/>
					</div>
				) : (
					<div />
				)}
				<div className="listing-actions__sortings">
					<ul className="sortings-list">
						{(this.props.sortings || sortings).map(x =>
							x.title === this.props.sort.title ? (
								<li
									role="button"
									className="sortings-list__item sortings-list__current-item"
									key={x.title}
								>
									<label
										className="sortings-list__item-content sortings-list__current-item-content"
										tabIndex={0}
									>
										<input
											type="radio"
											className="sortings-list__item-input"
											checked={true}
											name="post-sortings"
											value={x.title}
										/>
										{x.title}
									</label>
								</li>
							) : (
								<li
									role="button"
									className="sortings-list__item"
									onMouseDown={() =>
										this.props.onSortingChange && this.props.onSortingChange(x)
									}
									key={x.title}
								>
									<label
										className="sortings-list__item-content"
										tabIndex={0}
										onKeyPress={e => {
											if (e.keyCode === 13) {
												e.preventDefault();
												this.props.onSortingChange &&
													this.props.onSortingChange(x);
											}
										}}
									>
										<input
											type="radio"
											className="sortings-list__item-input"
											name="post-sortings"
											value={x.title}
										/>
										{x.title}
									</label>
								</li>
							)
						)}
					</ul>
				</div>
			</div>
		);
	}
}
