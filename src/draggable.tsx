import { Component } from "react";
import { isSafari } from "./settings";

const draggable = Symbol();
const initialTouch = Symbol();
const initialTransform = Symbol();
const clientY = Symbol();
const dragInterval = Symbol();

interface DraggableProps {
	draggable?: boolean;
	onMove?: (data: any, positionA: number, positionB: number) => void;
}

interface DraggableComponentInterface<
	P extends DraggableProps,
	S extends object
> extends Component<P, S> {
	mainElement?: HTMLElement;
	dragHandle?: HTMLElement;
	/**
	 * should return position of dragged item
	 */
	getPosition: () => number;
	getData: () => any;
}

interface DraggableComponent<P extends DraggableProps, S extends object>
	extends DraggableComponentInterface<P, S> {
	[draggable]: boolean;
	[initialTouch]: Touch | null;
	[initialTransform]: string | null;
	[clientY]: number | null;
	[dragInterval]: number | null;
}

type TDragEvent = TouchEvent & {
	position: number;
	data: any;
	absoluteCoords: any;
	relativeCoords: any;
};

const eventIdentifier = "VYRTSEVDATADRAG";

/**
 *
 * @param BaseClass class to be extended
 * @param dataIdentifier id which will be used indrag event
 */
export default function Draggable<P extends DraggableProps, S extends object>(
	BaseClass: new (props: P) => DraggableComponentInterface<P, S>,
	dataIdentifier: string
) {
	/**
	 * touchmove targets used by ArticleBase.onHandleTouchMove
	 */
	let moveTargets: Element[] = [];

	/**
	 * Name of an event which occurs when touch-driven dragg occurs over element
	 */

	return class Draggable extends BaseClass implements DraggableComponent<P, S> {
		[draggable]: boolean;
		[initialTouch]: Touch | null;
		[initialTransform]: string | null;
		[clientY]: number | null;
		[dragInterval]: number | null;
		constructor(props: P) {
			super(props);
			this[draggable] = false;
			this[initialTouch] = null;
			this[initialTransform] = null;
			this[clientY] = null;
			this[dragInterval] = null;
		}
		componentDidMount() {
			super.componentDidMount && super.componentDidMount();
			if (!(this.dragHandle && this.mainElement)) return;

			this.onHandleMouseEnter = this.onHandleMouseEnter.bind(this);
			this.dragHandle.addEventListener("mouseenter", this.onHandleMouseEnter);
			this.onHandleMouseLeave = this.onHandleMouseLeave.bind(this);
			this.dragHandle.addEventListener("mouseleave", this.onHandleMouseLeave);

			this.onHandleTouchStart = this.onHandleTouchStart.bind(this);
			this.dragHandle.addEventListener("touchstart", this
				.onHandleTouchStart as (e: Event) => void);
			this.onHandleTouchMove = this.onHandleTouchMove.bind(this);
			this.dragHandle.addEventListener("touchmove", this.onHandleTouchMove as (
				e: Event
			) => void);
			this.onHandleTouchEnd = this.onHandleTouchEnd.bind(this);
			this.dragHandle.addEventListener("touchend", this.onHandleTouchEnd as (
				e: Event
			) => void);

			this.onTouchDrag = this.onTouchDrag.bind(this);
			this.mainElement.addEventListener(eventIdentifier, this.onTouchDrag as (
				e: Event
			) => void);
			this.onTouchDragLeave = this.onTouchDragLeave.bind(this);
			this.mainElement.addEventListener(
				`${eventIdentifier}Leave`,
				this.onTouchDragLeave
			);
			this.onTouchDragEnd = this.onTouchDragEnd.bind(this);
			this.mainElement.addEventListener(`${eventIdentifier}End`, this
				.onTouchDragEnd as (e: Event) => void);

			this.onDrop = this.onDrop.bind(this);
			this.mainElement.addEventListener("drop", this.onDrop);
			this.onDrag = this.onDrag.bind(this);
			this.mainElement.addEventListener("drag", this.onDrag);
			this.onDragStart = this.onDragStart.bind(this);
			this.mainElement.addEventListener("dragstart", this.onDragStart);
			this.onDragOver = this.onDragOver.bind(this);
			this.mainElement.addEventListener("dragover", this.onDragOver);
			this.onDragLeave = this.onDragLeave.bind(this);
			this.mainElement.addEventListener("dragleave", this.onDragLeave);
			this.onDragEnd = this.onDragEnd.bind(this);
			this.mainElement.addEventListener("dragend", this.onDragEnd);
		}
		componentWillUnmount() {
			super.componentWillUnmount && super.componentWillUnmount();
			if (this.mainElement) {
				this.mainElement.removeEventListener(eventIdentifier, this
					.onTouchDrag as (e: Event) => void);
				this.mainElement.removeEventListener(
					`${eventIdentifier}Leave`,
					this.onTouchDragLeave
				);
				this.mainElement.removeEventListener(`${eventIdentifier}End`, this
					.onTouchDragEnd as (e: Event) => void);

				this.mainElement.removeEventListener("drop", this.onDrop);
				this.mainElement.removeEventListener("drag", this.onDrag);
				this.mainElement.removeEventListener("dragstart", this.onDragStart);
				this.mainElement.removeEventListener("dragover", this.onDragOver);
				this.mainElement.removeEventListener("dragleave", this.onDragLeave);
				this.mainElement.removeEventListener("dragend", this.onDragEnd);
			}

			if (this.dragHandle) {
				this.dragHandle.removeEventListener("touchend", this
					.onHandleTouchEnd as (e: Event) => void);
				this.dragHandle.removeEventListener("touchmove", this
					.onHandleTouchMove as (e: Event) => void);
				this.dragHandle.removeEventListener("touchstart", this
					.onHandleTouchStart as (e: Event) => void);

				this.dragHandle.removeEventListener(
					"mouseenter",
					this.onHandleMouseEnter
				);
				this.dragHandle.removeEventListener(
					"mouseleave",
					this.onHandleMouseLeave
				);
			}
		}
		protected onHandleMouseEnter() {
			if (this.mainElement)
				this.mainElement.draggable = this.props.draggable! || false;
		}
		protected onHandleMouseLeave() {
			if (this.mainElement) this.mainElement.draggable = false;
		}
		protected onTouchDrag(e: TDragEvent) {
			const rect = this.mainElement!.getBoundingClientRect();
			const ratio = (e.relativeCoords.y / rect.height) * 100;
			if (ratio < 50) {
				this.mainElement!.classList.remove("touch-drag-target-bottom");
				this.mainElement!.classList.add("touch-drag-target-top");
			} else {
				this.mainElement!.classList.remove("touch-drag-target-top");
				this.mainElement!.classList.add("touch-drag-target-bottom");
			}
		}
		protected onTouchDragLeave() {
			this.mainElement!.classList.remove("touch-drag-target-top");
			this.mainElement!.classList.remove("touch-drag-target-bottom");
		}
		protected onTouchDragEnd(e: TDragEvent) {
			this.mainElement!.classList.remove("touch-drag-target-top");
			this.mainElement!.classList.remove("touch-drag-target-bottom");
			if (e.position === this.getPosition()) return;
			const append = (() => {
				const rect = this.mainElement!.getBoundingClientRect();
				const ratio = (e.relativeCoords.y / rect.height) * 100;
				let append = ratio < 60 ? 1 : 0;
				if (e.position < this.getPosition()) append -= 1;
				return append;
			})();
			if (e.position === this.getPosition() + append) return;
			this.props.onMove &&
				this.props.onMove(e.data, e.position, this.getPosition() + append);
		}

		protected onHandleTouchStart(e: TDragEvent) {
			if (e.touches.length > 1) return;
			e.preventDefault();

			this.mainElement!.classList.add("touch-drag-item__start");
			this.mainElement!.classList.add("touch-drag-item");
			this.mainElement!.classList.remove("touch-drag-item__start");
			this[initialTouch] = e.touches[0];
			this[initialTransform] = this.mainElement!.style.transform;

			// handle scroll over borders
			this[clientY] = e.touches[0].clientY;
			this[dragInterval] = window.setInterval(() => {
				if (this[clientY] && this[clientY]! <= 80) {
					window.scrollBy(0, -((80 - this[clientY]!) / 2));
				} else if (this[clientY] && this[clientY]! >= window.innerHeight - 80) {
					window.scrollBy(0, (80 - (window.innerHeight - this[clientY]!)) / 2);
				}
			}, 30);
		}
		protected onHandleTouchMove(e: TDragEvent) {
			this[clientY] = e.touches[0].clientY;
			const deltaY = e.touches[0].pageY - this[initialTouch]!.pageY;
			this.mainElement!.style.transform = `translate(0, ${deltaY}px)`;

			const targets = document.elementsFromPoint(
				e.touches[0].clientX,
				e.touches[0].clientY
			);

			const left = moveTargets.filter(x => targets.indexOf(x) === -1);
			const lEvent = new Event(`${eventIdentifier}Leave`, {
				bubbles: false,
				cancelable: false,
			});
			left.forEach(x => x.dispatchEvent(lEvent));

			moveTargets = targets;

			moveTargets.forEach(x => {
				if (!x) return;
				const event = (new Event(eventIdentifier, {
					bubbles: false,
					cancelable: true,
				}) as unknown) as TDragEvent;
				const tRect = x.getBoundingClientRect();
				event.absoluteCoords = {
					x: e.touches[0].clientX,
					y: e.touches[0].clientY,
				};
				event.relativeCoords = {
					x: e.touches[0].clientX - ((tRect as any).x || tRect.left),
					y: e.touches[0].clientY - ((tRect as any).y || tRect.top),
				};
				x.dispatchEvent(event);
			});
		}
		protected onHandleTouchEnd(e: TDragEvent) {
			this[dragInterval] && clearInterval(this[dragInterval]!);
			this.mainElement!.classList.remove("touch-drag-item");
			if (this[initialTransform]) {
				this.mainElement!.style.transform = this[initialTransform];
			} else {
				this.mainElement!.style.transform = "";
			}

			const targets = document.elementsFromPoint(
				e.changedTouches[0].clientX,
				e.changedTouches[0].clientY
			);
			const position = this.getPosition();
			const data = this.getData();
			targets.forEach(x => {
				if (!x) return;
				const event = new Event(`${eventIdentifier}End`, {
					bubbles: false,
					cancelable: true,
				}) as TDragEvent;
				event.position = position;
				event.data = data;
				const rect = x.getBoundingClientRect();
				event.absoluteCoords = {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY,
				};
				event.relativeCoords = {
					x: e.changedTouches[0].clientX - ((rect as any).x || rect.left),
					y: e.changedTouches[0].clientY - ((rect as any).y || rect.top),
				};
				x.dispatchEvent(event);
			});
		}

		protected onDragStart(e: DragEvent) {
			if (!this.mainElement!.draggable) return;
			this.mainElement!.classList.add("drop-item");
			e.dataTransfer!.setData(
				`${dataIdentifier}/position`,
				this.getPosition().toString()
			);
			e.dataTransfer!.setData(
				`${dataIdentifier}/data`,
				JSON.stringify(this.getData())
			);

			if (isSafari) {
				this[clientY] = e.clientY;
				this[dragInterval] = window.setInterval(() => {
					if (this[clientY]! <= 80) {
						window.scrollBy(0, -((80 - this[clientY]!) / 2));
					} else if (this[clientY]! >= window.innerHeight - 80) {
						window.scrollBy(
							0,
							(80 - (window.innerHeight - this[clientY]!)) / 2
						);
					}
				}, 30);
			}
		}
		protected onDrag(e: DragEvent) {
			if (isSafari) {
				this[clientY] = e.clientY;
			}
		}
		protected onDragOver(e: DragEvent) {
			if (e.dataTransfer!.types.indexOf(`${dataIdentifier}/position`) === -1)
				return;
			e.preventDefault();
			if (
				e.dataTransfer!.getData(`${dataIdentifier}/position`) ===
				this.getPosition().toString()
			) {
				this.mainElement!.classList.remove("drop-top");
				this.mainElement!.classList.remove("drop-bottom");
				return;
			}
			let append = (() => {
				const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
				const y = e.clientY - ((rect as any).y || rect.top);
				const proportion = (y / rect.height) * 100;
				return proportion < 60 ? 1 : 0;
			})();
			if (append === 1) {
				this.mainElement!.classList.remove("drop-bottom");
				this.mainElement!.classList.add("drop-top");
			} else {
				this.mainElement!.classList.remove("drop-top");
				this.mainElement!.classList.add("drop-bottom");
			}
		}
		protected onDragLeave() {
			this.mainElement!.classList.remove("drop-top");
			this.mainElement!.classList.remove("drop-bottom");
		}
		protected onDragEnd() {
			this[dragInterval] && clearInterval(this[dragInterval]!);
			this.mainElement!.classList.remove("drop-item");
			this.mainElement!.classList.remove("drop-top");
			this.mainElement!.classList.remove("drop-bottom");
		}
		protected async onDrop(e: DragEvent) {
			this[dragInterval] && clearInterval(this[dragInterval]!);
			this.mainElement!.classList.remove("drop-item");
			this.mainElement!.classList.remove("drop-top");
			this.mainElement!.classList.remove("drop-bottom");
			if (e.dataTransfer!.types.indexOf(`${dataIdentifier}/position`) === -1)
				return;
			e.preventDefault();
			const position = parseInt(
				e.dataTransfer!.getData(`${dataIdentifier}/position`),
				10
			);
			if (position === this.getPosition()) return;
			let append = (() => {
				const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
				const y = e.clientY - ((rect as any).y || rect.top);
				const proportion = (y / rect.height) * 100;
				return proportion < 60 ? 1 : 0;
			})();
			if (position < this.getPosition()) append -= 1;
			if (position === this.getPosition() + append) return;
			const data = JSON.parse(
				e.dataTransfer!.getData(`${dataIdentifier}/data`)
			);
			this.props.onMove &&
				this.props.onMove(data, position, this.getPosition() + append);
		}
		render() {
			return super.render();
		}
	};
}
