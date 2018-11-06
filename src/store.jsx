import React from "react";
import { createStore } from "redux";

const initialState = {
	isAdmin: false,
	notifications: [],
	activeId: null,
	autoScroll: false,
	theme: "day",
};
const rootReducer = (state = initialState, action) => {
	switch (action.type) {
		case "setState":
			return { ...state, ...action.state };
		case "addNotification":
			return {
				...state,
				notifications: [...state.notifications, action.notification],
			};
		case "removeNotification":
			const index = state.notifications.indexOf(action.notification);
			if (index < 0) return state;
			return {
				...state,
				notifications: [
					...state.notifications.slice(0, index),
					...state.notifications.slice(index + 1),
				],
			};
		default:
			return state;
	}
};

export const store = createStore(rootReducer);

export function setState(state) {
	store.dispatch({
		type: "setState",
		state,
	});
}

let notificationId = 0;

const createNotification = notification => {
	if (typeof notification === "string") {
		notification = {
			data: <span dangerouslySetInnerHTML={{ __html: notification }} />,
			time: 3000,
			level: "default",
		};
	}
	if (typeof notification.data === "string") {
		notification.data = (
			<span dangerouslySetInnerHTML={{ __html: notification.data }} />
		);
	}
	notification.id = notificationId++;
	notification = Object.assign(
		{
			level: "default",
			time: 3000,
			closable: true,
		},
		notification
	);
	//inject key into react component to avoid misrendering
	notification.data.key = notification.id;
	return notification;
};

export function addNotification(notification) {
	if (typeof notification === "function") {
		// fuckery with indirection
		const n = {};
		const remover = () => {
			console.log("hey!");
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
	if (notification.time !== null) {
		setTimeout(() => {
			store.dispatch({
				type: "removeNotification",
				notification,
			});
		}, notification.time);
	}
	return notification;
}

export function removeNotification(notification) {
	store.dispatch({
		type: "removeNotification",
		notification,
	});
}

export function removeNotificationsWithContext(context) {
	setState({
		notifications: store
			.getState()
			.notifications.filter(n => n.context !== context),
	});
}

export function setTheme(theme, immediate = false) {
	setState({ theme });

	if (immediate) {
		document.documentElement.dataset.theme = theme;
		return;
	}

	document.documentElement.classList.add("switch-transition");
	setTimeout(() => {
		document.documentElement.dataset.theme = theme;
		setTimeout(() => {
			document.documentElement.classList.remove("switch-transition");
		}, 1500);
	}, 10);
}
