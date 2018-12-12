import { Notification } from "./notificationInterface";
import { createStore } from "redux";
import { ThemeType } from "./themeInterface";

export interface State {
	issueNumber: number | null;
	isAdmin: boolean;
	notifications: any[];
	activeId: string | null;
	theme: ThemeType;
}

const initialState: State = {
	issueNumber: null,
	isAdmin: false,
	notifications: [],
	activeId: null,
	theme: "day",
};

export interface StateAction {
	type: "setState";
	state: Partial<State>;
}

export interface NotificationAction {
	type: "addNotification" | "removeNotification";
	notification: Partial<Notification>;
}

const rootReducer = (
	state: State = initialState,
	action: StateAction | NotificationAction
): State => {
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

export function setState(state: Partial<State>): void {
	store.dispatch({
		type: "setState",
		state,
	});
}

let themeCounter: number = 0;

export function setTheme(theme: ThemeType, immediate: boolean = false) {
	setState({ theme });

	if (immediate) {
		document.documentElement.dataset.theme = theme;
		return;
	}

	++themeCounter;
	document.documentElement.classList.add("switch-transition");
	setTimeout(() => {
		document.documentElement.dataset.theme = theme;
		setTimeout(() => {
			--themeCounter;
			if (themeCounter < 1)
				document.documentElement.classList.remove("switch-transition");
		}, 1500);
	}, 10);
}
