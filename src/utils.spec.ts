import { first, firstIndex, formatDate, oneOf, animate } from "./utils";

describe("first", () => {
	test("ok", () => {
		const arr = [{ value: "a" }, { value: "b" }, { value: "c" }];
		expect(first(arr, x => x.value === "b")).toBe(arr[1]);
	});
	test("null", () => {
		const arr = [{ value: "a" }, { value: "b" }, { value: "c" }];
		expect(first(arr, x => x.value === "d")).toBe(null);
	});
});

describe("firstIndex", () => {
	test("ok", () => {
		const arr = [{ value: "a" }, { value: "b" }, { value: "c" }];
		expect(firstIndex(arr, x => x.value === "b")).toBe(1);
	});
	test("null", () => {
		const arr = [{ value: "a" }, { value: "b" }, { value: "c" }];
		expect(firstIndex(arr, x => x.value === "d")).toBe(null);
	});
});

test("formatDate", () => {
	const date = new Date("1970-01-01 12:03:04");
	expect(formatDate(date)).toBe("01.01.1970 в&nbsp;12:03");
});

describe("oneOf", () => {
	test("ok", () => {
		expect(oneOf("item", "hey", "item", "none")).toBe(true);
	});
	test("notOneOf", () => {
		expect(oneOf("item", "hey", "there", "is", "nothing")).toBe(false);
	});
});

describe("animate", () => {
	test("ok", async () => {
		jest.useFakeTimers();
		let i = 0;
		const fn = jest.fn((stop: Function) => {
			if (++i === 5) stop();
		});
		await animate(fn, 10, true);
		expect(fn).toBeCalledTimes(5);
		jest.useRealTimers();
	});
});
