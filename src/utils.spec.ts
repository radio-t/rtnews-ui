import {
	first,
	firstIndex,
	formatDate,
	oneOf,
	animate,
	padStart,
	toServerTime,
	fromServerTime,
	intervalToString,
	getNextShowDate,
} from "./utils";

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

describe("padStart", () => {
	test("ok", async () => {
		expect(padStart(12, 4, "0")).toBe("0012");
		expect(padStart("hello", 10)).toBe("     hello");
	});
});

describe("toServerTime", () => {
	test("ok", async () => {
		const subjects: [Date, string][] = [
			[new Date("2018-01-01 06:05:04"), "2018-01-01T00:05:04.000000000-06:00"],
			[
				new Date("1964-12-30 03:04:01.128"),
				"1964-12-29T21:04:01.128000000-06:00",
			],
			[
				new Date("2018-12-16 01:00:00.5678"),
				"2018-12-15T19:00:00.567000000-06:00",
			],
		];
		for (const [date, result] of subjects) {
			expect(toServerTime(date)).toBe(result);
		}
	});
});

describe("fromServerTime", () => {
	test("ok", async () => {
		const date = fromServerTime("2018-12-15T19:00:00.567000000-06:00");
		expect(date.getFullYear()).toBe(2018);
		expect(date.getUTCDate()).toBe(16);
		expect(date.getUTCHours()).toBe(1);
	});
});

describe("intervalToString", () => {
	test("ok", async () => {
		expect(intervalToString(1000)).toBe("00:00:01");
		expect(intervalToString((2 * 60 + 35) * 1000)).toBe("00:02:35");
		expect(intervalToString(3 * 60 * 1000)).toBe("00:03:00");
		expect(intervalToString((72 * 60 + 25) * 1000)).toBe("01:12:25");
	});
});

describe("getNextShowDate", () => {
	const cases: [string, string][] = [
		["2018-04-10", "2018-04-14"],
		["2018-09-06", "2018-09-08"],
		["2018-12-07", "2018-12-08"],
		["2018-12-08", "2018-12-08"],
		["2018-12-16", "2018-12-22"],
		["2018-12-17", "2018-12-22"],
		["2018-12-18", "2018-12-22"],
		["2018-12-19", "2018-12-22"],
		["2018-12-20", "2018-12-22"],
		["2018-12-21", "2018-12-22"],
		["2018-12-22", "2018-12-22"],
		["2019-01-02", "2019-01-05"],
		["2019-02-13", "2019-02-16"],
	];
	for (const [date, result] of cases) {
		test(date, async () => {
			const d = getNextShowDate(new Date(date + " 10:10:10+000"));
			expect(d.toISOString().substr(0, 19)).toBe(result + "T20:00:00");

			const nt = getNextShowDate(new Date(date + " 22:10:10+000"));
			expect(nt.toISOString().substr(0, 19)).toBe(result + "T20:00:00");

			const lt = getNextShowDate(new Date(date + " 03:10:10+180"));
			expect(lt.toISOString().substr(0, 19)).toBe(result + "T20:00:00");
		});
	}
});
