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
