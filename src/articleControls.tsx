export type ControlID =
	| "make-current"
	| "make-geek"
	| "make-ungeek"
	| "make-first"
	| "archive"
	| "remove"
	| "restore";

type ControlData = {
	title: string;
	id: string;
};

export const controls: { [P in ControlID]: ControlData } = {
	"make-current": {
		title: "Сделать текущей",
		id: "make-current",
	},
	"make-geek": {
		title: "Гиковское",
		id: "make-geek",
	},
	"make-ungeek": {
		title: "Не гиковское",
		id: "make-ungeek",
	},
	"make-first": {
		title: "Сделать первой",
		id: "make-first",
	},
	archive: {
		title: "В архив",
		id: "archive",
	},
	remove: {
		title: "Удалить",
		id: "remove",
	},
	restore: {
		title: "Восстановить",
		id: "restore",
	},
};

type Props = {
	controls: ControlID[];
	onChange?: (id: ControlID) => void;
	className?: string;
};

export default function ArticleControls(props: Props) {
	return (
		<div className={"post-controls " + props.className ? props.className : ""}>
			{props.controls.map(c => (
				<span
					role="button"
					className={"post-controls__control " + `post-controls__control-${c}`}
					key={c}
					onClick={() => props.onChange && props.onChange(c)}
				>
					{controls[c].title}
				</span>
			))}
		</div>
	);
}
