import { setState, store } from "./store";
import { Notification } from "./notificationInterface";

type Props = {
	notifications: Notification[];
	className?: string;
};

export function Notifications(props: Props) {
	return (
		<div className="notifications">
			{props.notifications &&
				props.notifications
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

let notificationId: number = 0;

type DeferredNotification = (remove: () => void) => Partial<Notification>;

function createNotification(
	notification: string | Partial<Notification>
): Notification {
	if (typeof notification === "string") {
		notification = {
			data: <span dangerouslySetInnerHTML={{ __html: notification }} />,
			time: 3000,
			level: "default",
		};
	} else if (typeof notification.data === "string") {
		notification.data = (
			<span dangerouslySetInnerHTML={{ __html: notification.data }} />
		);
	}
	notification.id = notificationId++;
	notification = Object.assign(
		{
			context: null,
			level: "default",
			time: 3000,
			closable: true,
		},
		notification
	);
	//inject key into react component to avoid misrendering
	(notification.data as JSX.Element).key = notification.id || null;
	return notification as Notification;
}

export function addNotification(
	notification: DeferredNotification | string | Partial<Notification>
): Notification {
	if (typeof notification === "function") {
		// fuckery with indirection
		const n = {};
		const remover = () => {
			store.dispatch({
				type: "removeNotification",
				notification: n,
			});
		};
		Object.assign(n, createNotification(notification(remover)));
		notification = n;
	} else {
		notification = createNotification(notification);
	}
	store.dispatch({
		type: "addNotification",
		notification,
	});
	if (notification.time) {
		window.setTimeout(() => {
			store.dispatch({
				type: "removeNotification",
				notification: notification as Partial<Notification>,
			});
		}, notification.time);
	}
	return notification as Notification;
}

export function removeNotification(notification: Notification): void {
	store.dispatch({
		type: "removeNotification",
		notification,
	});
}

export function removeNotificationsWithContext(context: any): void {
	setState({
		notifications: store
			.getState()
			.notifications.filter((n: Notification) => n.context !== context),
	});
}
