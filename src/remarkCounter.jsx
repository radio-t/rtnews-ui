import React from "react";

import { getRemarkCommentsCount } from "./api.js";

export default class RemarkCounter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			count: 0,
		};
	}
	componentWillMount() {
		super.componentDidMount && super.componentDidMount();
		getRemarkCommentsCount(this.props.url).then(data => {
			this.setState({ count: data.count });
		});
	}
	render() {
		return <span>{this.state.count}</span>;
	}
}
