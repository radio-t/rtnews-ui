import React from "react";

export default class Loading extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			numberOfDots: (props.numberOfDots || 3) - 1,
		};
		this.interval = setInterval(() => {
			this.setState(state => {
				return {
					numberOfDots:
						(state.numberOfDots + 1) % (this.props.numberOfDots || 3),
				};
			});
		}, 500);
	}
	render() {
		return (
			<div className="loading" {...this.props}>
				{this.props.text || "Загружаю"}
				<span className="loading__dots">
					.{".".repeat(this.state.numberOfDots)}
				</span>
			</div>
		);
	}
	componentWillUnmount() {
		clearInterval(this.interval);
	}
}
