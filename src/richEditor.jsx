import { createElement, PureComponent } from "react";
import { waitFor } from "./utils";

let Quill = null;

export default class RichEditor extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			loaded: false,
		};
		if (Quill !== null) {
			this.setState({ loaded: true });
			return;
		}

		// prettier-ignore
		Promise.all([
			import(
				/* webpackChunkName: "quill" */
				/* webpackMode: "lazy" */
				"quill"
			),
			import(
				/* webpackChunkName: "quill" */
				/* webpackMode: "lazy" */
				"quill/dist/quill.core.css"
			),
			import(
				/* webpackChunkName: "quill" */
				/* webpackMode: "lazy" */
				"quill/dist/quill.snow.css"
			),
			import(
				/* webpackChunkName: "quill" */
				/* webpackMode: "lazy" */
				"./quill-overloads.css"
			),
		]).then(([ImportedQuill]) => {
			this.setState({loaded: true})
			Quill = ImportedQuill.default;
		});
	}
	componentDidMount(...args) {
		super.componentDidMount && super.componentDidMount(...args);

		waitFor(() => Quill !== null).then(() => {
			if (this.props.rich) {
				this.quill = new Quill(this.editor, {
					theme: "snow",
					placeholder: this.props.placeholder || "",
					modules: {
						toolbar: [
							[{ header: [1, 2, 3, 4, 5, 6, false] }],
							["bold", "italic", "underline", "strike"],
							[{ align: [] }],
							[{ list: "ordered" }, { list: "bullet" }],
							[{ script: "sub" }, { script: "super" }],
							["clean"],
						],
					},
				});
			} else {
				this.quill = new Quill(this.editor, {
					theme: "snow",
					placeholder: this.props.placeholder || "",
					modules: {
						toolbar: [],
					},
					formats: [],
				});
			}
		});
	}
	getContent() {
		if (!this.props.rich)
			return this.quill.root.innerHTML
				.replace(/(<br\/?>|<\/p><p>)/gi, " ")
				.replace(/(<([^>]+)>)/gi, "");
		return this.quill.root.innerHTML;
	}
	focus() {
		setTimeout(() => {
			this.quill.root.focus();
		}, 100);
	}
	render() {
		if (!this.state.loaded) return "Загружаю";
		return (
			<div
				class={
					"editor-container " +
					(!this.props.rich ? "editor-container--poor " : "") +
					(this.props.className || "")
				}
			>
				<div
					class="editor"
					ref={ref => (this.editor = ref)}
					dangerouslySetInnerHTML={{ __html: this.props.content }}
				/>
			</div>
		);
	}
}
