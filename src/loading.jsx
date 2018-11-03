import React from "react";

export default class Loading extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			numberOfDots: 4,
		};
		this.interval = setInterval(() => {
			this.setState(state => {
				return { numberOfDots: (state.numberOfDots + 1) % 7 };
			});
		}, 500);
	}
	render() {
		return (
			<div className="loading" {...this.props}>
				{this.props.text || "Loading"}.{".".repeat(this.state.numberOfDots)}
			</div>
		);
	}
	componentWillUnmount() {
		clearInterval(this.interval);
	}
}
