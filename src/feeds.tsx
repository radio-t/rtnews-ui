import { PureComponent, FormEvent } from "react";

import { getFeeds, addFeed, removeFeed } from "./api";
import { formatDate, sleep, waitFor } from "./utils";

import { Feed } from "./feedInterface";

import Loading from "./loading";
import ErrorComponent from "./error";

type Props = {};

type State = {
	feeds: Feed[];
	loaded: boolean;
	posting: boolean;
	feedurl: string;
	error: {
		status?: number;
		statusText?: string;
		message?: string;
	} | null;
};

export default class FeedsForm extends PureComponent<Props, State> {
	protected input?: HTMLInputElement;
	constructor(props: Props) {
		super(props);
		this.state = {
			feeds: [],
			loaded: false,
			posting: false,
			feedurl: "",
			error: null,
		};
		getFeeds()
			.then(feeds => {
				this.setState({ feeds, loaded: true });
			})
			.catch(error => {
				this.setState({ error });
			});
	}
	componentWillMount() {
		document.title = "Управление фидами | Новости Радио-Т";
	}
	componentDidMount() {
		waitFor(() => !!this.input, 10000).then(() => {
			this.input!.focus();
		});
	}
	render() {
		if (this.state.error)
			return (
				<ErrorComponent
					code={this.state.error.status || 500}
					message={
						this.state.error.statusText ||
						this.state.error.message ||
						"Произошла ошибка"
					}
				/>
			);
		if (!this.state.loaded) return <Loading />;
		return (
			<div className="feeds">
				<div className="feeds__container">
					{this.state.feeds.map(feed => (
						<div className="feeds__item" key={feed.id}>
							<h2 className="feeds__item-header">
								<a className="feeds__item-link" href={feed.feedlink}>
									{feed.feedlink}
								</a>
							</h2>
							<span
								className="feeds__updated-at"
								dangerouslySetInnerHTML={{
									__html:
										"Обновлено " +
										formatDate(new Date(Date.parse(feed.updated))),
								}}
							/>
							<span
								className="pseudo feeds__remove-feed"
								onClick={() => this.removeFeed(feed)}
							>
								Удалить
							</span>
						</div>
					))}
				</div>
				<form className="feeds__add-form" onSubmit={e => this.onSubmit(e)}>
					<input
						className="feeds__add-input"
						type="text"
						placeholder="Добавить фид"
						value={this.state.feedurl}
						onChange={e => this.setState({ feedurl: e.target.value })}
						ref={ref => (this.input = ref!)}
					/>
					<input
						className="feeds__add-submit"
						type="submit"
						value="Добавить"
						disabled={this.state.feedurl.length === 0}
					/>
				</form>
				{this.state.posting && <span>работаю...</span>}
			</div>
		);
	}
	protected async removeFeed(feed: Feed): Promise<void> {
		if (confirm(`Удалить ${feed.feedlink}?`)) {
			this.setState({ posting: true });
			try {
				await removeFeed(feed.id);
				await sleep(1000);
				await getFeeds().then(feeds => {
					this.setState({ feeds });
				});
			} finally {
				this.setState({ posting: false });
			}
		}
	}
	protected async onSubmit(e: FormEvent): Promise<void> {
		e.preventDefault();
		this.setState({ posting: true });
		try {
			await addFeed(this.state.feedurl);
			await sleep(1000);
			await getFeeds().then(feeds => {
				this.setState({ feeds, feedurl: "" });
			});
		} finally {
			this.setState({ posting: false });
		}
	}
}
