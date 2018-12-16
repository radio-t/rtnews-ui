export function first<T>(arr: T[], fn: (item: T) => boolean): T | null {
	for (let item of arr) {
		if (fn(item)) return item;
	}
	return null;
}

export function firstIndex<T>(
	arr: T[],
	fn: (item: T) => boolean
): number | null {
	for (let i = 0; i < arr.length; i++) {
		if (fn(arr[i])) return i;
	}
	return null;
}

export function formatDate(date: Date): string {
	const day = ("0" + date.getDate()).slice(-2);
	const month = ("0" + (date.getMonth() + 1)).slice(-2);
	const year = date.getFullYear();
	const hours = ("0" + date.getHours()).slice(-2);
	const mins = ("0" + date.getMinutes()).slice(-2);

	return day + "." + month + "." + year + " в&nbsp;" + hours + ":" + mins;
}

export function oneOf<T>(subject: T, ...objects: T[]): boolean {
	for (let obj of objects) {
		if (subject === obj) return true;
	}
	return false;
}

/**
 *
 * @param n sleep duration in ms
 */
export function sleep(n: number): Promise<void> {
	return new Promise(resolve => window.setTimeout(resolve, n));
}

export function animate(
	fn: (stop: () => void, timestamp: number) => void,
	interval: number = 1000,
	immediate: boolean = true
): Promise<void> {
	return new Promise(resolve => {
		let stopped = false;
		const stop = () => {
			stopped = true;
		};
		let t = performance.now();
		if (immediate) fn(stop, t);
		let runner = async (timestamp = t) => {
			if (timestamp - interval > t) {
				await fn(stop, timestamp);
				t = timestamp;
			}
			if (!stopped) requestAnimationFrame(runner);
			else resolve();
		};
		requestAnimationFrame(runner);
	});
}

/**
 * waits for readystate === complete
 */
export async function waitDOMReady(): Promise<void> {
	while (true) {
		if (document.readyState === "complete") return;
		await sleep(200);
	}
}

export async function retry<T>(
	fn: () => T | Promise<T>,
	retries: number = 3,
	retryInterval: number = 0
): Promise<T> {
	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (e) {
			if (i === retries - 1) throw e;
			if (retryInterval) await sleep(retryInterval);
		}
	}
	throw new Error("Error while retry");
}

/**
 *
 * @param fn
 * @param max timeout in ms
 * @param error error to throw in case of timeout
 */
export async function waitFor(
	fn: () => boolean | Promise<boolean>,
	max: number | null = null,
	error: Error | null = null,
	interval: number = 100
) {
	const timestamp = new Date().getTime();
	while (true) {
		if (await fn()) return;
		if (max !== null) {
			const delta = new Date().getTime();
			if (delta - timestamp > max) throw error || new Error("Time passed");
		}
		await sleep(interval);
	}
}

export const scrollIntoView = (() => {
	if ("scrollBehavior" in document.documentElement!.style) {
		return (el: HTMLElement, behavior: "smooth" | "auto" = "smooth") =>
			el.scrollIntoView({ behavior, block: "start" });
	} else {
		// easeOutQuart
		const timingfn = (t: number) => -(Math.pow(t - 1, 4) - 1);

		const easing = (
			time: number,
			duration: number,
			from: number,
			to: number
		) => {
			if (time >= duration) return to;
			const percentage = timingfn(time / duration);
			const delta = to - from;
			return from + percentage * delta;
		};

		const requestAnimationFrame =
			window.requestAnimationFrame || window.webkitRequestAnimationFrame;

		return (el: HTMLElement, behavior: "smooth" | "auto" = "smooth") => {
			if (behavior !== "smooth")
				return el.scrollIntoView({ behavior, block: "start" });
			else {
				const startPosition = window.scrollY || window.pageYOffset;
				const rect = el.getBoundingClientRect();
				const targetPosition =
					startPosition + (((rect as any).y as number) || rect.top);
				const timeStart = performance.now();
				const duration = 500;

				function loop(timeCurrent: number) {
					const elapsed = timeCurrent - timeStart;
					const next = easing(elapsed, duration, startPosition, targetPosition);
					window.scrollTo(0, next);
					if (elapsed <= duration) {
						requestAnimationFrame(loop);
					} else {
						window.scrollTo(0, targetPosition);
					}
				}

				requestAnimationFrame(loop);
			}
		};
	}
})();

export function debounce(
	fn: Function,
	wait: number = 100,
	immediate: boolean = false
): (this: any, ...args: any[]) => void {
	let timeout: number | null;
	return function(this: any, ...args: any[]): void {
		const later = () => {
			timeout = null;
			if (!immediate) fn.apply(this, args);
		};
		const callNow = immediate && !timeout;
		if (timeout) clearTimeout(timeout);
		timeout = window.setTimeout(later, wait);
		if (callNow) fn.apply(this, args);
	};
}

export const requestIdleCallback: (
	fn: Function,
	options?: { timeout?: number }
) => number = (() => {
	if ("requestIdleCallback" in window)
		return (window as any).requestIdleCallback;
	return (fn: () => void) => {
		fn();
		return 0;
	};
})();

export function padStart(
	input: string | number,
	length: number,
	filler: string = " "
): string {
	const strInput = input.toString();
	if (strInput.length >= length) return strInput;
	const appendix = new Array(length - strInput.length).fill(filler).join("");
	return appendix + strInput;
}

/**
 * Converts date to string interopable with server "2018-12-31T12:50:34.000000000+01:00"
 *
 * @param date
 * @param offset offset in minutes
 */
export function toServerTime(date: Date, offset: number = 6 * 60): string {
	const iso = new Date(date.getTime() - offset * 60000)
		.toISOString()
		.slice(0, -1);
	const hourOffset = Math.floor(offset / 60);
	const minutesOffset = offset - hourOffset * 60;
	const formatDate = `${iso}000000${hourOffset < 0 ? "+" : "-"}${padStart(
		Math.abs(hourOffset),
		2,
		"0"
	)}:${padStart(minutesOffset, 2, "0")}`;
	return formatDate;
}

/**
 *
 * @param time string in interop format "2018-12-31T12:50:34.000000000+01:00"
 */
export function fromServerTime(time: string): Date {
	return new Date(time);
}

export function intervalToString(interval: number): string {
	const secinterval = interval / 1000;
	const hours = Math.floor(secinterval / 3600);
	const minutes = Math.floor((secinterval % 3600) / 60);
	const seconds = Math.floor(secinterval % 60);
	return `${padStart(hours, 2, "0")}:${padStart(minutes, 2, "0")}:${padStart(
		seconds,
		2,
		"0"
	)}`;
}
