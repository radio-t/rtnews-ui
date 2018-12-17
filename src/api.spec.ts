import { getPrepTopicsURL, getIssueNumber } from "./api";

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

afterEach(() => {
	window.fetch = fetch;
});
