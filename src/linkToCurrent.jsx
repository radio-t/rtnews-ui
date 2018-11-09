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
							window[listingRef] && (await window[listingRef].update());
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
			onClick={e => {
				if (window.location.pathname === "/") e.preventDefault();
				setTimeout(() => {
					props.onClick && props.onClick(e);
					waitFor(() => {
						return !!document.getElementById("active-article");
					}, 6000)
						.then(() => {
							const el = document.getElementById("active-article");
							el.scrollIntoView({ behavior: "smooth", block: "start" });
						})
						.catch(() => {
							onMissingArticle();
						});
				}, 100);
			}}
			className={props.className}
		>
			{props.title}
		</Link>
	);
}
