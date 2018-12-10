import { addNotification } from "./store.jsx";
import { listingRef } from "./symbols.js";
import { sleep, waitFor, scrollIntoView } from "./utils.ts";

import { Link } from "react-router-dom";

const onMissingArticle = async () => {
	window[listingRef] && (await window[listingRef].update(true));
	await waitFor(
		async () => window[listingRef] && window[listingRef].state.loaded
	);
	const el = document.getElementById("active-article");
	if (el) {
		scrollIntoView(el);
		return;
	}

	addNotification(r => ({
		data: (
			<b>
				Не могу найти тему,{" "}
				<span
					class="pseudo"
					onClick={async () => {
						r();
						await sleep(1500);
						onMissingArticle();
					}}
				>
					обновить список?
				</span>
			</b>
		),
		time: 30000,
	}));
};

export default function LinkToCurrent(props) {
	return (
		<Link
			to="/"
			onClick={async e => {
				if (window.location.pathname === "/") e.preventDefault();
				props.onClick && props.onClick(e);
				await sleep(100);
				await waitFor(
					() => window[listingRef] && window[listingRef].state.loaded
				);
				await waitFor(() => !!document.getElementById("active-article"), 2000)
					.then(() => {
						document.title = "Новости для Радио-Т";
						const el = document.getElementById("active-article");
						scrollIntoView(el);
					})
					.catch(() => {
						onMissingArticle();
					});
			}}
			className={props.className}
		>
			{props.title}
		</Link>
	);
}
