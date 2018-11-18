import { createElement, PureComponent } from "react";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import Quill from "quill";

export default class RichEditor extends PureComponent {
	constructor(props) {
		super(props);
	}
	componentDidMount(...args) {
		super.componentDidMount && super.componentDidMount(...args);
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
	}
	getContent() {
		return this.quill.root.innerHTML;
	}
	focus() {
		setTimeout(() => {
			this.quill.root.focus();
		}, 100);
	}
	render() {
		return (
			<div class={"editor-container " + (this.props.className || "")}>
				<div
					class="editor"
					ref={ref => (this.editor = ref)}
					dangerouslySetInnerHTML={{ __html: this.props.content }}
				/>
			</div>
		);
	}
}
