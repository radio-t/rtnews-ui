import {
	getArticleBySlug,
	getIssueNumber,
	getPrepTopicsURL,
	safeLink,
	sanitizeHTML,
} from "./api";

const softHyphen = "\u00AD";

const fetch = (window as any).fetch;

describe("getPrepTopicsURL", () => {
	test("ok", async () => {
		const response = {
			status: 200,
			json: async () => [
				{
					title: "Темы для 650",
					url: "https://example.com",
				},
			],
		};
		(window as any).fetch = async () => response;
		expect(await getPrepTopicsURL()).toBe("https://example.com");
	});
	test("empty", async () => {
		const response = {
			status: 200,
			json: async () => [],
		};
		(window as any).fetch = async () => response;
		expect(await getPrepTopicsURL()).toBe(null);
	});
	test("network error", async () => {
		expect.assertions(1);
		(window as any).fetch = async () => {
			throw new Error("Network Error");
		};
		return expect(getPrepTopicsURL()).rejects.toBeInstanceOf(Error);
	});
	test("server error", async () => {
		expect.assertions(1);
		const response = {
			status: 500,
			json: async () => JSON.parse(""),
		};
		(window as any).fetch = async () => response;
		return expect(getPrepTopicsURL()).rejects.toBeInstanceOf(Error);
	});
});

describe("getIssueNumber", () => {
	test("ok", async () => {
		const response = {
			status: 200,
			json: async () => [
				{
					title: "Темы для 650",
					url: "https://example.com/",
				},
			],
		};
		(window as any).fetch = async () => response;
		expect(await getIssueNumber()).toEqual({
			number: 650,
			link: "https://example.com/#remark42",
		});
	});
	test("okFuture", async () => {
		const response = {
			status: 200,
			json: async () => [
				{
					title: "Радио-Т 650",
					url: "https://example.com/",
				},
			],
		};
		(window as any).fetch = async () => response;
		expect(await getIssueNumber()).toEqual({
			number: 651,
			link: null,
		});
	});
	test("absent", async () => {
		const response = {
			status: 200,
			json: async () => [],
		};
		(window as any).fetch = async () => response;
		expect(await getIssueNumber()).toEqual(null);
	});
	test("network error", async () => {
		(window as any).fetch = async () => {
			throw new Error("Network Error");
		};
		expect(await getIssueNumber()).toEqual(null);
	});
	test("server error", async () => {
		const response = {
			status: 500,
			json: async () => JSON.parse(""),
		};
		(window as any).fetch = async () => response;
		expect(await getIssueNumber()).toEqual(null);
	});
});

describe("sanitizeHTML", () => {
	test("drops script tags", () => {
		expect(sanitizeHTML("<p>text</p><script>alert(1)</script>")).toBe(
			"<p>text</p>"
		);
	});
	test("drops event handlers", () => {
		expect(
			sanitizeHTML('<img src="https://example.com/p.png" onerror="alert(1)">')
		).toBe('<img src="https://example.com/p.png">');
	});
	test("drops javascript urls", () => {
		expect(sanitizeHTML('<a href="javascript:alert(1)">link</a>')).toBe(
			"<a>link</a>"
		);
	});
	test("keeps rich text", () => {
		const html =
			'<h2>header</h2><p class="ql-align-center"><strong>bold</strong>' +
			'<em>italic</em><a href="https://example.com/">link</a></p>' +
			"<blockquote>quote</blockquote><ul><li>item</li></ul>" +
			"<pre><code>code</code></pre>" +
			'<figure><img src="https://example.com/p.png">' +
			"<figcaption>caption</figcaption></figure>";
		expect(sanitizeHTML(html)).toBe(html);
		expect(
			sanitizeHTML('<img src="https://example.com/p.png" alt="pic">')
		).toContain('alt="pic"');
	});
	test("drops inline styles covering the page", () => {
		expect(
			sanitizeHTML(
				'<div style="position:fixed;top:0;width:100vw;height:100vh">text</div>'
			)
		).toBe("<div>text</div>");
	});
	test("drops styles affecting the whole page", () => {
		expect(
			sanitizeHTML("<div><style>body { display: none }</style>text</div>")
		).toBe("<div>text</div>");
	});
	test("drops target outside of links", () => {
		expect(
			sanitizeHTML('<form target="_blank"><input></form>')
		).not.toContain("target");
		expect(
			sanitizeHTML(
				'<svg><a target="_blank" href="https://example.com/">x</a></svg>'
			)
		).not.toContain("target");
	});
	test("drops iframes", () => {
		expect(
			sanitizeHTML('<iframe src="https://example.com/embed/x"></iframe><p>ok</p>')
		).toBe("<p>ok</p>");
	});
	test("adds rel to links opening a new tab", () => {
		expect(
			sanitizeHTML('<a href="https://example.com/" target="_blank">link</a>')
		).toBe(
			'<a target="_blank" href="https://example.com/" rel="noopener noreferrer">link</a>'
		);
	});
});

describe("safeLink", () => {
	test("keeps http links", () => {
		expect(safeLink("https://example.com/news/1")).toBe(
			"https://example.com/news/1"
		);
		expect(safeLink("http://example.com/news/1")).toBe(
			"http://example.com/news/1"
		);
	});
	test("empties javascript links", () => {
		expect(safeLink("javascript:alert(1)")).toBe("");
	});
	test("empties links it cannot parse", () => {
		expect(safeLink("not a link")).toBe("");
	});
});

describe("getArticleBySlug", () => {
	// jsdom used by jest has no fetch, so Headers request() relies on is missing too
	const headers = (global as any).Headers;
	beforeAll(() => {
		(global as any).Headers = class {
			append() {}
		};
	});
	afterAll(() => {
		(global as any).Headers = headers;
	});

	test("sanitizes snippet, content and original link", async () => {
		const response = {
			status: 200,
			json: async () => ({
				id: "1",
				slug: "malicious",
				snippet: '<b>hi</b><img src="https://example.com/p.png" onerror="alert(1)">',
				content: "<p>text</p><script>alert(document.cookie)</script>",
				origlink: "javascript:alert(1)",
			}),
		};
		(window as any).fetch = async () => response;
		const article = await getArticleBySlug("malicious");
		expect(article!.snippet).toBe(
			'<b>hi</b><img src="https://example.com/p.png">'
		);
		expect(article!.content).toBe("<p>text</p>");
		expect(article!.origlink).toBe("");
	});
	test("breaks up long words in snippet text only", async () => {
		const link = "https://example.com/a/very/long/path/to/an/article";
		const response = {
			status: 200,
			json: async () => ({
				id: "2",
				slug: "long-words",
				snippet: `<a href="${link}">${"a".repeat(20)}</a>`,
			}),
		};
		(window as any).fetch = async () => response;
		const article = await getArticleBySlug("long-words");
		expect(article!.snippet).toBe(
			`<a href="${link}">${"a".repeat(16)}${softHyphen}${"a".repeat(4)}</a>`
		);
	});
});

afterEach(() => {
	window.fetch = fetch;
});
