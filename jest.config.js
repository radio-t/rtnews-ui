module.exports = {
	roots: ["<rootDir>/src/"],
	transform: {
		"^.+\\.tsx?$": "ts-jest",
	},
	testRegex: "(\\.|/)(test|spec)\\.tsx?$",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	moduleNameMapper: {
		"^react$": "preact-compat-enzyme",
		"^react-dom$": "preact-compat-enzyme",
		"^react-dom/test-utils$": "preact-test-utils",
		"^react-dom/server$": "preact-render-to-string",
		"^react-test-renderer/shallow$": "preact-test-utils",
		"^react-test-renderer$": "preact-test-utils",
		"^react-addons-test-utils$": "preact-test-utils",
	},
	globals: {
		APIROOT: "https://example.com",
		"ts-jest": {
			diagnostics: {
				ignoreCodes: ["TS151001"],
			},
		},
	},
	setupFiles: ["<rootDir>/testSetup/main.ts"],
};
