type Props = {
	href: string;
};

export default function(props: Props) {
	if (
		props.href === window.location.pathname ||
		props.href === window.location.href
	)
		return <span {...props as any} />;
	return <a {...props} />;
}
