import { createElement, Component } from "react";

import { Link } from "react-router-dom";

export default class NotFound extends Component {
	componentDidMount() {
		document.title = "404 | Новости для Радио-Т";
	}
	render() {
		return (
			<div className="not-found">
				<h1 className="not-found__header">404</h1>
				<p className="not-found__text">Страница не найдена</p>
				<Link to="/" className="not-found__link">
					На главную
				</Link>
			</div>
		);
	}
}
