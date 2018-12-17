import { Component } from "react";

import { Notification, NotificationInit } from "./notificationInterface";

type Props = {
	className?: string;
};

type State = {
	notifications: Notification[];
};

const InstanceRef = Symbol();

function getInstance(): Notifications {
	return (window as any)[InstanceRef];
}

export class Notifications extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			notifications: [],
		};
	}
	componentDidMount() {
		(window as any)[InstanceRef] = this;
	}
	add(notification: Notification): void {
		this.setState({
			notifications: [...this.state.notifications, notification],
		});
	}
	remove(notification: Notification): void {
		this.setState({
			notifications: this.state.notifications.filter(n => n !== notification),
		});
	}
	removeWithContext(context: any): void {
		this.setState({
			notifications: this.state.notifications.filter(
				n => n.context !== context
			),
		});
	}
	render() {
		return (
			<div className="notifications">
				{this.state.notifications &&
					this.state.notifications
						.slice(0)
						.reverse()
						.map(n => (
							<div
								className={
									"notifications__item " +
									(n.level ? `notifications__item-level-${n.level}` : "")
								}
								key={n.id}
							>
								{n.data}
								{n.closable && (
									<div
										role="button"
										className="notifications__close-item"
										onClick={() => removeNotification(n)}
									>
										×︎
									</div>
								)}
							</div>
						))}
			</div>
		);
	}
}

let notificationId: number = 0;

type DeferredNotification = (remove: () => void) => NotificationInit;

function createNotification(
	notification: string | NotificationInit
): Notification {
	let result: Notification;
	if (typeof notification === "string") {
		result = {
			data: <span dangerouslySetInnerHTML={{ __html: notification }} />,
			time: 3000,
			level: "default",
		} as Notification;
	} else if (typeof notification.data === "string") {
		result = {
			...notification,
			data: <span dangerouslySetInnerHTML={{ __html: notification.data }} />,
		} as Notification;
	} else {
		result = { ...notification } as Notification;
	}
	result.id = notificationId++;
	Object.assign(
		result,
		Object.assign(
			{
				context: null,
				level: "default",
				time: 3000,
				closable: true,
			},
			result
		)
	);
	//inject key into react component to avoid misrendering
	(result.data as any).key = result.id;
	return result;
}

export function addNotification(
	notification: DeferredNotification | string | NotificationInit
): Notification {
	let result: Notification;
	if (typeof notification === "function") {
		// fuckery with indirection
		const n = {} as Notification;
		const remover = () => {
			getInstance().remove(n);
		};
		Object.assign(n, createNotification(notification(remover)));
		result = n;
	} else {
		result = createNotification(notification);
	}
	getInstance().add(result);
	if (result.time) {
		window.setTimeout(() => {
			getInstance().remove(result);
		}, result.time);
	}
	return result;
}

export function removeNotification(notification: Notification): void {
	getInstance().remove(notification);
}

export function removeNotificationsWithContext(context: any): void {
	getInstance().removeWithContext(context);
}
