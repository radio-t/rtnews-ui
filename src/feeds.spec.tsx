import { mount } from "enzyme";
import * as API from "./api";
import Feeds from "./feeds";
import { Feed } from "./feedInterface";
import { sleep } from "./utils";

jest.mock("./api");

describe("Feeds", () => {
	test("ok", async () => {
		(API.getFeeds as any).mockImplementation(
			async (): Promise<Feed[]> => [
				{
					active: true,
					feedlink: "https://example.com/feed1",
					id: "dkkdk",
					updated: "01.01.2012 12:12:00",
				},
				{
					active: true,
					feedlink: "https://example.com/feed2",
					id: "dkkdk2",
					updated: "01.01.2014 12:12:12",
				},
			]
		);
		const host = mount(
			<div>
				<Feeds isAdmin={true} />
			</div>
		);
		await sleep(100);
		host.update();
		expect(API.getFeeds).toBeCalled();
		(API.getFeeds as any).mockClear();
	});
});
