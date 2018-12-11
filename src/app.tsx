declare const BUILDTIME: string;

import { Component } from "react";

import { postsPrefix } from "./settings";

import Head from "./head";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect,
	RouteComponentProps,
} from "react-router-dom";
import { ScrollContext } from "react-router-scroll-4";
import AddArticle from "./add";
import {
	ListingWithAutoUpdate,
	ArchiveListingWithAutoUpdate,
	DeletedListingWithAutoUpdate,
	SorterWithAutoUpdate,
} from "./articleListings";
import { Article, EditableArticle } from "./article";
import Feeds from "./feeds";
import LoginForm from "./login";
import NotFound from "./notFound";
import Notifications from "./notifications";
import { Notification } from "./notificationInterface";

import { listingRef } from "./symbols";
import { ThemeType } from "./themeInterface";

type AppProps = {
	issueNumber: {
		link?: string;
		number: number;
	} | null;
	isAdmin: boolean;
	activeId: null | string;
	theme: ThemeType;
	notifications: Notification[];
};

export default class App extends Component<AppProps> {
	router: Router;
	render() {
		return (
			<Router ref={(router: Router) => (this.router = router)}>
				<div className="page">
					<Route
						render={({ history }: RouteComponentProps) => (
							<Head {...this.props} history={history} />
						)}
					/>
					<div className="content page__content">
						<Switch>
							<Route
								path="/"
								exact={true}
								render={() => (
									<ScrollContext scrollKey="main">
										<ListingWithAutoUpdate
											{...this.props}
											ref={ref => ((window as any)[listingRef] = ref)}
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
										<DeletedListingWithAutoUpdate {...this.props} />
									</ScrollContext>
								)}
							/>
							<Route
								path="/archive/"
								exact={true}
								render={() => (
									<ScrollContext>
										<ArchiveListingWithAutoUpdate {...this.props} />
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
										<SorterWithAutoUpdate {...this.props} />
									</ScrollContext>
								)}
							/>
							<Route
								path={`${postsPrefix}/:slug`}
								render={(props: RouteComponentProps) =>
									this.props.isAdmin ? (
										<ScrollContext
											scrollKey="post"
											shouldUpdateScroll={(_: any, cur: any) =>
												!!cur.location.key
											}
										>
											<EditableArticle
												slug={(props.match.params as any).slug}
											/>
										</ScrollContext>
									) : (
										<ScrollContext
											scrollKey="post"
											shouldUpdateScroll={(_: any, cur: any) =>
												!!cur.location.key
											}
										>
											<Article slug={(props.match.params as any).slug} />
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
						<span className="footer__buildtime">built on {BUILDTIME}</span>
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
