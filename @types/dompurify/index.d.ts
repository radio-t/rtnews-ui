declare module "dompurify" {
	type Config = {
		ADD_ATTR?: string[];
		ADD_TAGS?: string[];
		FORBID_ATTR?: string[];
		FORBID_TAGS?: string[];
	};

	type Hook = (node: Element) => void;

	const DOMPurify: {
		addHook(entryPoint: string, hook: Hook): void;
		sanitize(dirty: string, config?: Config): string;
	};

	export = DOMPurify;
}
