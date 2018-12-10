import { Component } from "react";

type Props = {
	numberOfDots?: number;
	text?: string;
};

type State = {
	numberOfDots: number;
};

export default class Loading extends Component<Props, State> {
	interval?: number;
	constructor(props) {
		super(props);
		this.state = {
			numberOfDots: (props.numberOfDots || 3) - 1,
		};
		this.interval = (setInterval(() => {
			this.setState(state => {
				return {
					numberOfDots:
						(state.numberOfDots + 1) % (this.props.numberOfDots || 3),
				};
			});
		}, 500) as unknown) as number;
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