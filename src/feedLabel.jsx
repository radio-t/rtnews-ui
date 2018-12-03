export default function FeedLabel(props) {
	if (props.feed.length === 0) return null;
	if (props.feed === "manual") return null;
	try {
		const url = new URL(props.feed);
		return (
			<span className={"feed-label " + (props.className || "")}>
				via {url.hostname}
			</span>
		);
	} catch (e) {
		return null;
	}
}
