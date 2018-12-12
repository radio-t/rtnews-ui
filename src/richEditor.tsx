import { PureComponent } from "react";
import { waitFor } from "./utils";

type Quill = import("quill").default;

type QuillType = typeof import("quill").default;

let Quill: QuillType | null = null;

type Props = {
	rich?: boolean;
	className?: string;
	placeholder?: string;
	content: string;
};

type State = {
	loaded: boolean;
};

export default class RichEditor extends PureComponent<Props, State> {
	editor?: HTMLDivElement;
	quill?: Quill;
	constructor(props: Props) {
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
				// @ts-ignore
				"quill/dist/quill.core.css"
			),
			import(
				/* webpackChunkName: "quill" */
				/* webpackMode: "lazy" */
				// @ts-ignore
				"quill/dist/quill.snow.css"
			),
			import(
				/* webpackChunkName: "quill" */
				/* webpackMode: "lazy" */
				// @ts-ignore
				"./quill-overloads.css"
			),
		]).then(([ImportedQuill]) => {
			this.setState({loaded: true})
			Quill = ImportedQuill.default;
		});
	}
	componentDidMount() {
		super.componentDidMount && super.componentDidMount();

		waitFor(() => Quill !== null).then(() => {
			if (this.props.rich) {
				this.quill = new Quill!(this.editor!, {
					theme: "snow",
					placeholder: this.props.placeholder || "",
					modules: {
						toolbar: [
							[{ header: [1, 2, 3, 4, 5, 6, false] }],
							["bold", "italic", "underline", "strike", "link"],
							["blockquote", "code-block"],
							[{ align: [] }],
							[{ list: "ordered" }, { list: "bullet" }],
							[{ script: "sub" }, { script: "super" }],
							["clean"],
						],
					},
				});
			} else {
				this.quill = new Quill!(this.editor!, {
					theme: "snow",
					placeholder: this.props.placeholder || "",
					modules: {
						toolbar: null,
					},
					formats: [],
				});
			}
		});
	}
	getContent(): string {
		if (!this.props.rich)
			return this.quill!.root.innerHTML
				.replace(/(<br\/?>|<\/p><p>)/gi, " ")
				.replace(/(<([^>]+)>)/gi, "");
		return this.quill!.root.innerHTML;
	}
	focus(): void {
		setTimeout(() => {
			this.quill!.root.focus();
		}, 100);
	}
	render() {
		if (!this.state.loaded) return "Загружаю";
		return (
			<div
				className={
					"editor-container " +
					(!this.props.rich ? "editor-container--poor " : "") +
					(this.props.className || "")
				}
			>
				<div
					className="editor"
					ref={ref => (this.editor = ref || undefined)}
					dangerouslySetInnerHTML={{ __html: this.props.content }}
				/>
			</div>
		);
	}
}
