import { newsCacheValidInterval } from "./settings";
import { getNews, getArchiveNews, getDeletedNews } from "./api";
import { Article } from "./articleInterface";

type CacheLabel = "common" | "archive" | "deleted";

/**
 * Article cache which stores articles
 * imlements smooth back/forward history navigation
 */
export default (() => {
	if (newsCacheValidInterval === null) {
		return {
			async get(
				label: CacheLabel = "common",
				force: boolean = false
			): Promise<Article[]> {
				let data;
				switch (label) {
					case "common":
						data = await getNews();
						break;
					case "archive":
						data = await getArchiveNews();
						break;
					case "deleted":
						data = await getDeletedNews();
						break;
					default:
						throw new Error("Unknown Label");
				}
				return data;
			},
			invalidate(label: CacheLabel | null = null) {},
		};
	}

	const cache: Map<
		CacheLabel,
		{
			data: Article[];
			timestamp: number;
		}
	> = new Map();

	/**
	 * label options are: common, arrhive, deleted
	 */
	const get = async (
		label: CacheLabel = "common",
		force: boolean = false
	): Promise<Article[]> => {
		const timestamp = new Date().getTime();
		if (!force && cache.has(label)) {
			const v = cache.get(label);
			if (
				timestamp - v.timestamp <
				Math.max(60000 * newsCacheValidInterval - 500, 0)
			) {
				return v.data;
			}
		}
		let data: Article[];
		switch (label) {
			case "common":
				data = await getNews();
				break;
			case "archive":
				data = await getArchiveNews();
				break;
			case "deleted":
				data = await getDeletedNews();
				break;
			default:
				throw new Error("Unknown Label");
		}
		cache.set(label, {
			data,
			timestamp,
		});
		return data;
	};

	const invalidate = (label: CacheLabel | null = null) => {
		if (label === null) {
			cache.clear();
			return;
		}
		cache.delete(label);
	};
	return { get, invalidate };
})();
