import React from "react";

import { addNotification } from "./store.jsx";
import { listingRef } from "./symbols.js";
import { sleep } from "./utils.js";

import { HashLink } from "react-router-hash-link";

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
		<HashLink
			to="/#active-article"
			onClick={e => {
				props.onClick && props.onClick(e);
				setTimeout(onMissingArticle, 1500);
			}}
			className={props.className}
			scroll={el => {
				if (location.pathname === "/") {
					el.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
					return;
				}
				setTimeout(() => {
					el.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				}, 500);
			}}
		>
			{props.title}
		</HashLink>
	);
}
