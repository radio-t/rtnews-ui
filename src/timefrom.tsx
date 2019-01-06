import { PureComponent } from "react";
import { intervalToString } from "./utils";

type Props = {
	from?: Date;
	withSeconds?: boolean;
	className?: string;
	id?: string;
	title?: string;
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
		const start = new Date().getTime() - performance.now();
		const ts = (this.props.from || new Date()).getTime();
		const offset = start - ts;
		const looper = () => {
			const time = this.props.withSeconds
				? intervalToString(offset + performance.now())
				: intervalToString(offset + performance.now()).slice(0, -3);
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
			<span
				id={this.props.id || ""}
				ref={ref => (this.root = ref!)}
				title={this.props.title || undefined}
				className={`counter ${this.props.className || ""}`}
			/>
		);
	}
}
