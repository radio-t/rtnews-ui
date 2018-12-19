import { Component, MouseEvent } from "react";

import {
	logout,
	startShow,
	setTheme as saveTheme,
	getShowStartTime,
} from "./api";
import { setState, setTheme as commitTheme } from "./store";
import {
	addNotification,
	removeNotification,
	removeNotificationsWithContext,
} from "./notifications";
import { Notification } from "./notificationInterface";
import {
	postsPrefix,
	maxShowDuration,
	showStartTime,
	showStartTimeDeadline,
} from "./settings";

import { Link, NavLink, Route } from "react-router-dom";
import LinkToCurrent from "./linkToCurrent";
import TimeFrom from "./timefrom";
import { sleep, scrollIntoView, waitFor, formatDate } from "./utils";
import { getListingInstance } from "./references";

// @ts-ignore
import SVGInline from "react-svg-inline";
// @ts-ignore
import MoonIcon from "./static/svg/moon.svg";
// @ts-ignore
import SunIcon from "./static/svg/sun.svg";
import { ThemeType } from "./themeInterface";

const setTheme = (v: ThemeType) => {
	commitTheme(v);
	saveTheme(v);
};

function ThemeSwitchButton({ theme }: { theme: ThemeType }) {
	return (
		<button
			onClick={() => setTheme(theme === "day" ? "night" : "day")}
			title={
				theme === "day" ? "Поставить ночную тему" : "Поставить дневную тему"
			}
			className="inline-button navigation__item navigation__theme-switcher"
		>
			<SVGInline
				svg={theme === "day" ? MoonIcon : SunIcon}
				className="icon navigation__theme-switcher-icon"
			/>
		</button>
	);
}

interface History {
	push: (location: string) => void;
}

type Props = {
	issueNumber: {
		number: number;
		link: string | null;
	} | null;
	isAdmin: boolean;
	activeId: string | null;
	theme: ThemeType;
	history: History;
};

type State = {
	showStartTime?: Date | null;
};

// Returns null if show duration over max duration
async function getShowStartTimeWithMaxDuration(): Promise<Date | null> {
	const showServerStartTime = await getShowStartTime();
	if (!showServerStartTime) return null;
	const durationIsLegit: boolean = Boolean(
		new Date().getTime() - showServerStartTime.getTime() < maxShowDuration
	);
	return durationIsLegit ? showServerStartTime : null;
}

const ShowStartNotificationcontext = Symbol();

export default class Head extends Component<Props, State> {
	async componentDidMount() {
		if (this.props.isAdmin) this.pollForShowStartTime();
	}
	render() {
		return (
			<div className="header wrapper page__header">
				<h1 className="title header__title">
					Новости для <span className="no-break">Радио-Т</span>
					{this.props.issueNumber && (
						<span className="header__issue-number">
							{this.props.issueNumber.link ? (
								<a href={this.props.issueNumber.link} title="Темы слушателей">
									{this.props.issueNumber.number}
								</a>
							) : (
								this.props.issueNumber.number
							)}
						</span>
					)}
					{this.props.isAdmin && this.state.showStartTime && (
						<TimeFrom
							className="header__show-start-counter"
							from={this.state.showStartTime}
							title={formatDate(this.state.showStartTime).replace(
								"&nbsp;",
								" "
							)}
						/>
					)}
				</h1>
				<ul
					className="navigation header__navigation"
					role="navigation"
					aria-label="Main navigation"
				>
					{this.props.isAdmin && (
						<li className="navigation__item navigation__item_admin navigation__item_right navigation__item_logout">
							<span
								role="button"
								className="pseudo navigation__item-link"
								onClick={() => this.logout()}
							>
								Выйти
							</span>
						</li>
					)}
					<li className="navigation__item navigation__item_user">
						<NavLink to="/" exact={true} className="link navigation__item-link">
							Все темы
						</NavLink>
					</li>
					{this.props.isAdmin && (
						<li
							className="navigation__item navigation__item_admin"
							id="dels-wrap"
						>
							<NavLink
								to="/deleted/"
								exact={true}
								className="link navigation__item-link"
							>
								Удалённые
							</NavLink>
						</li>
					)}
					<li className="navigation__item">
						<NavLink
							to="/archive/"
							exact={true}
							className="link navigation__item-link"
						>
							Архив
						</NavLink>
					</li>
					{this.props.isAdmin && [
						<li className="navigation__item navigation__item_admin">
							<NavLink
								to="/sort/"
								exact={true}
								className="link navigation__item-link"
								title="Сортировать Темы"
							>
								Сортировать
							</NavLink>
						</li>,
						<li className="navigation__item navigation__item_admin">
							<NavLink
								to="/feeds/"
								exact={true}
								className="link navigation__item-link"
								title="Управление фидами"
							>
								Фиды
							</NavLink>
						</li>,
						<li className="navigation__item navigation__item_admin">
							<span
								role="button"
								className="pseudo navigation__item-link"
								onClick={() => this.poehali()}
							>
								Поехали!
							</span>
						</li>,
						<li className="navigation__item navigation__item_admin">
							<span
								role="button"
								className="pseudo navigation__item-link"
								onClick={() => this.startPrepTopics()}
								title="Начать темы слушателей"
							>
								Темы слушателей
							</span>
						</li>,
						<ThemeSwitchButton theme={this.props.theme} />,
						<div className="navigation__separator" />,
					]}
					{this.props.activeId !== null && (
						<li className="navigation__item navigation__item_to-current">
							<span>
								<LinkToCurrent
									title="К текущей теме"
									className="pseudo navigation__item-link"
								/>
							</span>
						</li>
					)}
					<Route
						path={`${postsPrefix}/:slug`}
						render={() => (
							<li className="navigation__item navigation__item_to-comments">
								<Link
									to="#to-comments"
									onClick={(event: MouseEvent<HTMLAnchorElement>) => {
										event.preventDefault();
										const el = document.getElementById("to-comments");
										if (!el) {
											console.error("Comments node not found");
											return;
										}
										scrollIntoView(el);
										sleep(500).then(() => {
											window.location.hash = "to-comments";
										});
									}}
									className="pseudo navigation__item-link"
								>
									К комментариям
								</Link>
							</li>
						)}
					/>
					{!this.props.isAdmin && (
						<ThemeSwitchButton theme={this.props.theme} />
					)}
				</ul>
				<hr />
			</div>
		);
	}
	protected async pollForShowStartTime() {
		this.setState({
			showStartTime: await getShowStartTimeWithMaxDuration(),
		});

		// start show start time polling
		if (new Date().getUTCDay() === showStartTime.getUTCDay()) {
			Promise.resolve()
				.then(async () => {
					let notification: Notification | null = null;
					while (!this.state.showStartTime) {
						const startTime = await getShowStartTimeWithMaxDuration();
						if (startTime) {
							this.setState({ showStartTime: startTime });
							break;
						}
						if (
							new Date().getTime() >=
								showStartTime.getTime() + showStartTimeDeadline &&
							notification === null
						) {
							notification = addNotification(remove => ({
								data: (
									<span>
										Может{" "}
										<span
											className="pseudo"
											onClick={async () => {
												await this.poehali();
												remove();
											}}
										>
											поехали?
										</span>
									</span>
								),
								time: null,
							}));
						} else {
							await sleep(60000);
						}
					}
					if (notification) removeNotification(notification);
				})
				.catch(e => console.error(e));
		}
	}
	protected logout() {
		logout();
		setState({ isAdmin: false });
	}
	poehali() {
		let promptResult = prompt("Таки поехали?\n\nСколько минут назад?", "0");
		if (promptResult === null) return;
		let offset = parseInt(promptResult, 10);

		const starter =
			offset === 0
				? startShow
				: async () => {
						const d = new Date();
						d.setUTCMinutes(d.getUTCMinutes() - offset);
						return startShow(d);
				  };

		addNotification({
			data: "Стартую",
			context: ShowStartNotificationcontext,
		});
		starter()
			.then(async () => {
				removeNotificationsWithContext(ShowStartNotificationcontext);
				addNotification({
					data: <b>Шоу началось</b>,
					context: ShowStartNotificationcontext,
				});
				this.setState({
					showStartTime: await getShowStartTimeWithMaxDuration(),
				});
			})
			.catch((e: any) => {
				console.error(e);
				removeNotificationsWithContext(ShowStartNotificationcontext);
				addNotification({
					data: <b>Ошибка при старте шоу</b>,
					context: ShowStartNotificationcontext,
					level: "error",
				});
			});
	}
	async startPrepTopics() {
		if (!confirm("Таки темы слушателей?")) return;

		try {
			if (!getListingInstance()) this.props.history.push("/");
			await waitFor(
				() => !!getListingInstance(),
				15000,
				new Error(`Can't navigate to "/"`)
			);
			getListingInstance()!.startPrepTopics();
		} catch (e) {
			console.error(e);
			addNotification({
				data: "Произошла ошибка при активации тем слушателей",
				level: "error",
			});
		}
	}
}
