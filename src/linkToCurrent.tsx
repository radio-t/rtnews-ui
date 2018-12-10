import { addNotification } from "./store";
import { listingRef } from "./symbols";
import { sleep, waitFor, scrollIntoView } from "./utils";

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
	onClick?: (MouseEvent) => void;
	title: string;
	className: string;
};

export default function LinkToCurrent(props: Props) {
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