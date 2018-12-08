import { PureComponent } from "react";

import { getFeeds, addFeed, removeFeed } from "./api.js";
import { formatDate, sleep, waitFor } from "./utils.js";
import { Redirect } from "react-router-dom";

import Loading from "./loading.jsx";
import Error from "./error.jsx";

export default class FeedsForm extends PureComponent {
	constructor(props) {
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
		waitFor(() => this.input, 10000).then(() => {
			this.input.focus();
		});
	}
	render() {
		if (!this.props.isAdmin) return <Redirect to="/login/" />;
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
						ref={ref => (this.input = ref)}
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
	async removeFeed(feed) {
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
	async onSubmit(e) {
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
