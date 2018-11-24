export function first(arr, fn) {
	for (let item of arr) {
		if (fn(item)) return item;
	}
	return null;
}

export function firstIndex(arr, fn) {
	for (let i = 0; i < arr.length; i++) {
		if (fn(arr[i])) return i;
	}
	return null;
}

export function formatDate(date) {
	const day = ("0" + date.getDate()).slice(-2);
	const month = ("0" + (date.getMonth() + 1)).slice(-2);
	const year = date.getFullYear();
	const hours = ("0" + date.getHours()).slice(-2);
	const mins = ("0" + date.getMinutes()).slice(-2);

	return day + "." + month + "." + year + " в&nbsp;" + hours + ":" + mins;
}

export function oneOf(subject, ...objects) {
	for (let obj of objects) {
		if (subject === obj) return true;
	}
	return false;
}

export function sleep(n) {
	return new Promise(resolve => setTimeout(resolve, n));
}

export async function animate(fn, interval = 1000, immediate = true) {
	if (immediate) fn();
	let t = 0;
	let runner = async (timestamp = 0) => {
		if (timestamp - interval > t) {
			await fn();
			t = timestamp;
		}
		requestAnimationFrame(runner);
	};
	requestAnimationFrame(runner);
}

export async function waitDOMReady() {
	while (true) {
		if (document.readyState === "complete") return;
		await sleep(200);
	}
}

export async function retry(fn, retries = 3, retryInterval = 0) {
	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (e) {
			if (retryInterval) await sleep(retryInterval);
		}
	}
	throw new Error("Retry failed");
}

export async function waitFor(fn, max = null) {
	const timestamp = new Date().getTime();
	while (true) {
		if (fn()) return;
		await sleep(100);
		if (max !== null) {
			const delta = new Date().getTime();
			if (delta - timestamp > max) {
				throw new Error("Time passed");
			}
		}
	}
}

export const scrollIntoView = (() => {
	if ("scrollBehavior" in document.documentElement.style) {
		return (el, behavior = "smooth") =>
			el.scrollIntoView({ behavior, block: "start" });
	} else {
		// easeOutQuart
		const timingfn = t => -(Math.pow(t - 1, 4) - 1);

		const easing = (time, duration, from, to) => {
			if (time >= duration) return to;
			const percentage = timingfn(time / duration);
			const delta = to - from;
			return from + percentage * delta;
		};

		const requestAnimationFrame =
			window.requestAnimationFrame || window.webkitRequestAnimationFrame;

		return (el, behavior = "smooth") => {
			if (behavior !== "smooth")
				return el.scrollIntoView({ behavior, block: "start" });
			else {
				const startPosition = window.scrollY || window.pageYOffset;
				const targetPosition = startPosition + el.getBoundingClientRect().y;
				const timeStart = performance.now();
				const duration = 500;

				function loop(timeCurrent) {
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

export function debounce(fn, wait = 100, immediate = false) {
	let timeout;
	return function(...args) {
		const later = () => {
			timeout = null;
			if (!immediate) fn.apply(this, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) fn.apply(this, args);
	};
}

export const requestIdleCallback = (() => {
	if ("requestIdleCallback" in window) return window.requestIdleCallback;
	return fn => {
		fn();
		return 0;
	};
})();
