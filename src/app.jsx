import { Component } from "react";

import { postsPrefix } from "./settings";

import Head from "./head";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect,
} from "react-router-dom";
import { ScrollContext } from "react-router-scroll-4";
import AddArticle from "./add";
import {
	Listing,
	ArchiveListing,
	DeletedListing,
	Sorter,
} from "./articleListings";
import { Article, EditableArticle } from "./article";
import Feeds from "./feeds";
import LoginForm from "./login";
import NotFound from "./notFound";
import Notifications from "./notifications";

import { listingRef } from "./symbols";

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
