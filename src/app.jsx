import { Component } from "react";

import { postsPrefix } from "./settings.js";

import Head from "./head.jsx";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect,
} from "react-router-dom";
import { ScrollContext } from "react-router-scroll-4";
import AddArticle from "./add.jsx";
import {
	Listing,
	ArchiveListing,
	DeletedListing,
	Sorter,
} from "./articleListings.jsx";
import { Article, EditableArticle } from "./article.jsx";
import Feeds from "./feeds.jsx";
import LoginForm from "./login.jsx";
import NotFound from "./notFound.jsx";
import Notifications from "./notifications.jsx";

import { listingRef } from "./symbols.js";

export default class App extends Component {
	render() {
		return (
			<Router ref={router => (this.router = router)}>
				<div className="page">
					<Route
						render={({ history }) => <Head {...this.props} history={history} />}
					/>
					<div class="content page__content">
						<Switch>
							<Route
								path="/"
								exact={true}
								render={() => (
									<ScrollContext scrollKey="main">
										<Listing
											{...this.props}
											ref={ref => (window[listingRef] = ref)}
										/>
									</ScrollContext>
								)}
							/>
							<Route
								path="/admin/"
								exact={true}
								render={() => <Redirect to="/login/" />}
							/>
							<Route
								path="/deleted/"
								exact={true}
								render={() => (
									<ScrollContext>
										<DeletedListing {...this.props} />
									</ScrollContext>
								)}
							/>
							<Route
								path="/archive/"
								exact={true}
								render={() => (
									<ScrollContext>
										<ArchiveListing {...this.props} />
									</ScrollContext>
								)}
							/>
							<Route
								path="/add/"
								exact={true}
								render={() => {
									document.title = "Добавить новость | Новости Радио-Т";
									return <AddArticle {...this.props} />;
								}}
							/>
							<Route
								path="/feeds/"
								exact={true}
								render={() => <Feeds {...this.props} />}
							/>
							<Route
								path="/sort/"
								render={() => (
									<ScrollContext>
										<Sorter {...this.props} />
									</ScrollContext>
								)}
							/>
							<Route
								path={`${postsPrefix}/:slug`}
								render={props =>
									this.props.isAdmin ? (
										<ScrollContext
											scrollKey="post"
											shouldUpdateScroll={(_, cur) => !!cur.location.key}
										>
											<EditableArticle slug={props.match.params.slug} />
										</ScrollContext>
									) : (
										<ScrollContext
											scrollKey="post"
											shouldUpdateScroll={(_, cur) => !!cur.location.key}
										>
											<Article slug={props.match.params.slug} />
										</ScrollContext>
									)
								}
							/>
							<Route path="/login/" exact={true} render={() => <LoginForm />} />
							<Route component={NotFound} />
						</Switch>
					</div>
					<div className="footer page__footer">
						<hr />
						<a href="http://radio-t.com/">Radio-T</a>,{" "}
						{new Date().getFullYear()}
						<br />
						<span class="footer__buildtime">built on {BUILDTIME}</span>
					</div>
					<Notifications
						className="page__notifications"
						notifications={this.props.notifications}
					/>
				</div>
			</Router>
		);
	}
}
