import { Component } from "react";

declare module "react-router-scroll-4" {
	class ScrollContext<P, S> extends Component<P, S> {}
}
