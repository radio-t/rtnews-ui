class A<T extends object> {
	props: T;
	constructor(a: T) {
		this.props = a;
	}
}

function create<T extends object>(BaseClass: { new (a: T): A<T> }) {
	return class<P extends T> extends BaseClass {
		state: boolean;
		constructor(ch: P) {
			super(ch);
			this.state = false;
		}
	};
}

type BProps = {
	looped: boolean;
};

class B<T extends BProps> extends create(A)<T> {
	bstate: T;
	constructor(n: T) {
		super(n);
		this.bstate = n;
	}
}

const bb = new B({
	looped: true,
});
