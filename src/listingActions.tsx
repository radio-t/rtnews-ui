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
								type="button"
								aria-pressed={this.props.postRecentness === postRecentness[1]}
								className={
									"listing-actions__news-recent-button " +
									(this.props.postRecentness === postRecentness[1]
										? "listing-actions__news-recent-button-active"
										: "")
								}
								onClick={() => {
									const val =
										this.props.postRecentness === postRecentness[0]
											? postRecentness[1]
											: postRecentness[0];
									this.props.onRecentnessChange &&
										this.props.onRecentnessChange(val);
								}}
							>
								Свежие
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
						{(this.props.sortings || sortings).map(x => {
							const current = x.title === this.props.sort.title;
							return (
								<li className="sortings-list__item" key={x.title}>
									<button
										type="button"
										className="sortings-list__button"
										aria-pressed={current}
										onClick={() =>
											!current &&
											this.props.onSortingChange &&
											this.props.onSortingChange(x)
										}
									>
										{x.title}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
}
