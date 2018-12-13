import { Component, FormEvent } from "react";

import { setState } from "./store";
import { login, loginViaStorage } from "./api";

import { Redirect } from "react-router-dom";
import { waitFor } from "./utils";

type Props = {};

type State = {
	user: string;
	password: string;
	denied: number;
	loggedIn: boolean;
};

export default class LoginForm extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			user: "",
			password: "",
			denied: 0,
			loggedIn: false,
		};
	}
	componentDidMount() {
		loginViaStorage().then(loggedIn => {
			this.setState({ loggedIn });
		});
		document.title = "Вход | Новости Радио-Т";
		waitFor(() => !!document.querySelector("input.login-form__user")).then(
			() => {
				(document.querySelector(
					"input.login-form__user"
				) as HTMLInputElement).focus();
			}
		);
	}
	render() {
		if (this.state.loggedIn) return <Redirect to="/" />;
		return (
			<form className="login-form" onSubmit={e => this.onSubmit(e)}>
				<p className="login-form__header">Авторизуйтесь:</p>
				<input
					className="login-form__user"
					type="text"
					placeholder="Логин"
					value={this.state.user}
					onChange={e => this.setState({ user: e.target.value })}
				/>
				<input
					className="login-form__password"
					type="password"
					placeholder="Пароль"
					value={this.state.password}
					onChange={e => this.setState({ password: e.target.value })}
				/>
				<input
					className="login-form__submit"
					type="submit"
					value="Войти"
					disabled={
						this.state.user.length === 0 || this.state.password.length === 0
					}
					title={
						this.state.user.length === 0 || this.state.password.length === 0
							? "Поля Логин и Пароль должны быть заполнены"
							: ""
					}
				/>
				{this.state.denied > 0 && (
					<p className="login-form__denied">You shall not pass!</p>
				)}
			</form>
		);
	}
	protected async onSubmit(e: FormEvent) {
		e.preventDefault();
		const loginAttempt = await login(
			this.state.user,
			this.state.password
		).catch(e => {
			console.error(e);
			return false;
		});
		if (!loginAttempt) {
			this.setState(state => {
				return { denied: state.denied + 1 };
			});
			window.setTimeout(() => {
				this.setState(state => {
					const d = state.denied - 1;
					return { denied: d < 0 ? 0 : d };
				});
			}, 7000);
			return;
		}
		setState({ isAdmin: true });
		this.setState({ loggedIn: true });
	}
}
