import { createElement, Component } from "react";

export default class NotFound extends Component {
	componentDidMount() {
		document.title = "Ошибка | Новости для Радио-Т";
	}
	render() {
		return (
			<div className="not-found">
				{this.props.code && (
					<h1 className="not-found__header">{this.props.code}</h1>
				)}
				{this.props.message && (
					<p className="not-found__text">{this.props.message}</p>
				)}
				<a
					href=""
					className="not-found__link"
					onClick={e => {
						e.preventDefault();
						window.location.reload();
					}}
				>
					Обновить
				</a>
			</div>
		);
	}
}
