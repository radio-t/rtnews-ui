import { createElement as ce } from "react";

declare global {
	var createElement: typeof ce;
}

declare namespace JSX {
	interface IntrinsicElements {
		[elemName: string]: any;
	}
}
