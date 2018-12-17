import { createStore } from "redux";
import { ThemeType } from "./themeInterface";

export interface State {
	issueNumber: {
		number: number;
		link: string | null;
	} | null;
	isAdmin: boolean;
	activeId: string | null;
	theme: ThemeType;
}

const initialState: State = {
	issueNumber: null,
	isAdmin: false,
	activeId: null,
	theme: "day",
};

export interface StateAction {
	type: "setState";
	state: Partial<State>;
}

const rootReducer = (
	state: State = initialState,
	action: StateAction
): State => {
	switch (action.type) {
		case "setState":
			return { ...state, ...action.state };
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
		document.documentElement!.dataset.theme = theme;
		return;
	}

	++themeCounter;
	document.documentElement!.classList.add("switch-transition");
	window.setTimeout(() => {
		document.documentElement!.dataset.theme = theme;
		window.setTimeout(() => {
			--themeCounter;
			if (themeCounter < 1)
				document.documentElement!.classList.remove("switch-transition");
		}, 1500);
	}, 10);
}
