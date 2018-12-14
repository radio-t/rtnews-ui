// @ts-ignore
import { createElement } from "react";
// @ts-ignore
import { configure } from "enzyme";
// @ts-ignore
import { Adapter } from "enzyme-adapter-preact";

(window as any).createElement = createElement;

configure({ adapter: new Adapter() });

(window as any).fetch = async () => {
	throw new Error("Network Error");
};

document.title = "Новости для Радио-Т";
