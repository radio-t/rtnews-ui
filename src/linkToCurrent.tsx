import { MouseEvent } from "react";

import { addNotification, removeNotification } from "./notifications";
import { activeArticleID } from "./settings";
import { listingRef } from "./symbols";
import { sleep, waitFor, scrollIntoView } from "./utils";
import { Listing } from "./articleListings";

import { Link } from "react-router-dom";

const defaultTitle = "Новости для Радио-Т";

const onMissingArticle = async () => {
	await waitFor(async () => (window as any)[listingRef]);
	const notification = addNotification({
		data: "Обновляю список",
		time: 10000,
	});
	const listing = (window as any)[listingRef] as Listing;
	listing.update(true);
	await waitFor(async () => listing.state.loaded);
	await waitFor(async () => !!document.getElementById(activeArticleID), 5000);
	removeNotification(notification);
	const el = document.getElementById(activeArticleID);
	document.title = defaultTitle;
	if (el) {
		scrollIntoView(el);
		return;
	}

	addNotification(r => ({
		data: (
			<b>
				Не могу найти тему,{" "}
				<span
					className="pseudo"
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

type Props = {
	onClick?: (event: Event) => void;
	title: string;
	className: string;
};

export default function LinkToCurrent(props: Props) {
	return (
		<Link
			to="/"
			onClick={async (e: MouseEvent<HTMLAnchorElement>) => {
				if (window.location.pathname === "/") e.preventDefault();
				props.onClick && props.onClick((e as unknown) as Event);
				await waitFor(
					() =>
						(window as any)[listingRef] &&
						(window as any)[listingRef].state.loaded
				);
				await waitFor(() => !!document.getElementById(activeArticleID), 500)
					.then(() => {
						document.title = defaultTitle;
						const el = document.getElementById(activeArticleID);
						if (el) scrollIntoView(el);
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
