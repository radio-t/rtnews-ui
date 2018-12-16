import { PureComponent } from "react";
import { intervalToString } from "./utils";

type Props = {
	from?: Date;
	withSeconds?: boolean;
	className?: string;
	id?: string;
};

export default class TimeFrom extends PureComponent<Props> {
	root?: HTMLElement;
	interval?: number;
	componentDidMount() {
		this.start();
	}
	componentWillUnmount() {
		this.stop();
	}
	componentDidUpdate() {
		this.stop();
		this.start();
	}
	private start() {
		const ts = (this.props.from || new Date()).getTime();
		const start = new Date().getTime() - performance.now();
		const looper = () => {
			const time = this.props.withSeconds
				? intervalToString(start + performance.now() - ts)
				: intervalToString(start + performance.now() - ts).slice(0, -3);
			if (time !== this.root!.textContent) this.root!.textContent = time;
		};
		looper();
		this.interval = window.setInterval(
			looper,
			this.props.withSeconds ? 200 : 5000
		);
	}
	private stop() {
		this.interval && window.clearInterval(this.interval);
	}
	render() {
		return (
			<div
				id={this.props.id || ""}
				ref={ref => (this.root = ref!)}
				className={`counter ${this.props.className || ""}`}
			/>
		);
	}
}
