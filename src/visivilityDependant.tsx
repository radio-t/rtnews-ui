import { Component } from "react";

interface ComponentWithVisibilityInterface<P extends object, S extends object>
	extends Component<P, S> {
	/**
	 * reference that should point to root element of component
	 */
	mainElement?: Element;
}

const visible = Symbol();

interface ComponentWithVisibility<P extends object, S extends object>
	extends ComponentWithVisibilityInterface<P, S> {
	[visible]: boolean;
}

/**
 * Map which connects HTMLElement with React.Component
 */
const refToComponentMap: WeakMap<
	Element,
	ComponentWithVisibility<any, any>
> = new WeakMap();

const componentToPropsStateMap: WeakMap<
	Component<any, any>,
	[object, object]
> = new WeakMap();

const observer = new IntersectionObserver(entries => {
	entries.forEach(e => {
		if (refToComponentMap.has(e.target)) {
			const component = refToComponentMap.get(e.target)!;
			component[visible] = e.isIntersecting;
			if (component[visible]) {
				component.setState({});
			} else {
				componentToPropsStateMap.set(component, [
					component.props,
					component.state,
				]);
			}
		}
	});
});

function shallowCompare(objectA: object, objectB: object): boolean {
	const ka = Object.keys(objectA);
	const kb = Object.keys(objectB);
	if (ka.length !== kb.length) return false;
	const keys = new Set([...ka, ...kb]);
	for (let key of keys) {
		if ((objectA as any)[key] !== (objectB as any)[key]) return false;
	}
	return true;
}

/**
 * Applies "should update only if visible" logic to component
 *
 * @param BaseClass
 * @param activeProps props that must be checked despite of component visibility
 */
export default function UpdateOnlyIfVisible<P extends object, S extends object>(
	BaseClass: new (props: P) => ComponentWithVisibilityInterface<P, S>,
	activeProps?: (keyof P)[]
) {
	return class UpdateOnlyIfVisible extends BaseClass
		implements ComponentWithVisibility<P, S> {
		[visible]: boolean;
		constructor(props: P) {
			super(props);
			this[visible] = true;
		}
		shouldComponentUpdate(nextProps: P, nextState: S, nextContext: any) {
			if (activeProps) {
				for (let propName of activeProps) {
					if (nextProps[propName] !== this.props[propName]) return true;
				}
			}
			if (!this[visible]) return false;
			if (componentToPropsStateMap.has(this)) {
				const [props, state]: [object, object] = componentToPropsStateMap.get(
					this
				)!;
				const result = !(
					shallowCompare(props, nextProps) &&
					shallowCompare(state, nextState) &&
					shallowCompare(this.context, nextContext)
				);
				componentToPropsStateMap.delete(this);
				return result;
			}
			if (super.shouldComponentUpdate) {
				return super.shouldComponentUpdate(nextProps, nextState, nextContext);
			}
			return true;
		}
		componentWillMount() {
			super.componentWillMount && super.componentWillMount();
		}
		componentDidMount() {
			super.componentDidMount && super.componentDidMount();
			if (this.mainElement) {
				refToComponentMap.set(this.mainElement!, this);
				observer.observe(this.mainElement!);
			}
		}
		componentWillUnmount() {
			super.componentWillUnmount && super.componentWillUnmount();
			this.mainElement && observer.unobserve(this.mainElement);
		}
		render() {
			return super.render();
		}
	};
}
