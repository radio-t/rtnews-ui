import { setState, store } from "./store";
import { Notification, NotificationInit } from "./notificationInterface";

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
		{
			context: null,
			level: "default",
			time: 3000,
			closable: true,
		},
		result
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
			store.dispatch({
				type: "removeNotification",
				notification: n,
			});
		};
		Object.assign(n, createNotification(notification(remover)));
		result = n;
	} else {
		result = createNotification(notification);
	}
	store.dispatch({
		type: "addNotification",
		notification: result,
	});
	if (result.time) {
		window.setTimeout(() => {
			store.dispatch({
				type: "removeNotification",
				notification: result,
			});
		}, result.time);
	}
	return result;
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
