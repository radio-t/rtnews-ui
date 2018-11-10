import React from "react";

import { addNotification } from "./store.jsx";
import { listingRef } from "./symbols.js";
import { sleep, waitFor } from "./utils.js";

import { Link } from "react-router-dom";

const onMissingArticle = () => {
	const el = document.getElementById("active-article");
	if (!el) {
		addNotification(r => ({
			data: (
				<b>
					Не могу найти тему,{" "}
					<span
						class="pseudo"
						onClick={async e => {
							window[listingRef] && (await window[listingRef].update(true));
							r();
							const el = document.getElementById("active-article");
							if (el) {
								el.scrollIntoView({
									behavior: "smooth",
									block: "start",
								});
							} else {
								await sleep(1500);
								onMissingArticle();
							}
						}}
					>
						обновить список?
					</span>
				</b>
			),
			time: 30000,
		}));
	}
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
						el.scrollIntoView({ behavior: "smooth", block: "start" });
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
