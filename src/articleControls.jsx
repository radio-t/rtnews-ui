const controls = {
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
	},
};

export default function ArticleControls(props) {
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
