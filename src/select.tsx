import { PureComponent } from "react";

type Props = {
	className?: string;
	items: string[];
	value: string;
	onChange: (string) => void;
};

type State = {
	expanded: boolean;
	selected: number;
};

export default class Select extends PureComponent<Props, State> {
	ref: HTMLDivElement;

	constructor(props: Props) {
		super(props);
		this.state = {
			expanded: false,
			selected: props.items.indexOf(props.value),
		};
	}
	render() {
		return (
			<div
				ref={ref => (this.ref = ref)}
				className={
					"select " + (this.props.className ? this.props.className : "")
				}
				tabIndex={0}
				onFocus={e =>
					this.setState({
						expanded: true,
						selected: this.props.items.indexOf(this.props.value),
					})
				}
				onBlur={e =>
					this.setState({
						expanded: false,
					})
				}
				onKeyPress={e => {
					switch (e.keyCode) {
						//arrow down
						case 38:
							e.preventDefault();
							this.setState(state => ({
								selected:
									(state.selected + this.props.items.length - 1) %
									this.props.items.length,
							}));
							break;
						//arrow up
						case 40:
							e.preventDefault();
							this.setState(state => ({
								selected:
									(state.selected + this.props.items.length + 1) %
									this.props.items.length,
							}));
							break;
						// enter
						case 13:
							e.preventDefault();
							this.props.onChange &&
								this.props.onChange(this.props.items[this.state.selected]);
							this.ref.blur();
							break;
						// esc
						case 27:
							e.preventDefault();
							this.ref.blur();
					}
				}}
			>
				<div className="select__current">
					<span className="select__current-value">{this.props.value}</span>
				</div>
				{this.state.expanded && (
					<ul className="select__items" role="listbox">
						{this.props.items.map((x, i) => (
							<li
								role="option"
								className={
									"select__item " +
									(x === this.props.value ? "select__item--current " : "") +
									(i === this.state.selected ? "select__item--selected " : "")
								}
								aria-selected={x === this.props.value ? true : null}
								onClick={e => {
									this.ref.blur();
									if (x !== this.props.value) {
										this.props.onChange(x);
									}
								}}
								onMouseEnter={() => {
									this.setState({ selected: i });
								}}
							>
								<span>{x}</span>
							</li>
						))}
					</ul>
				)}
			</div>
		);
	}
}
