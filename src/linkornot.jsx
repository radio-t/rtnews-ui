export default function(props) {
	if (
		props.href === window.location.pathname ||
		props.href === window.location.href
	)
		return <span {...props} />;
	return <a {...props} />;
}
