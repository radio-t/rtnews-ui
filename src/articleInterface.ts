export type ArticleInit = {
	active: boolean;
	/**
	 * activation timestamp
	 */
	activets: string;
	archived: boolean;
	/**
	 *  added timestamp
	 */
	ats: string;
	author: string;
	/**
	 * number of comments
	 */
	comments: number;
	/**
	 * full article's content
	 */
	content?: string;
	/**
	 * Is article deleted
	 */
	del: boolean;
	domain: string;
	exttitle: string;
	feed: string;
	geek: boolean;
	id: string;
	likes: number;
	/**
	 * direct link after redirects
	 */
	link: string;
	/**
	 * orignal article's link
	 */
	origlink: string;
	/**
	 * article's picture url
	 */
	pic: string;
	position: number;
	slug: string;
	/**
	 * short article's description
	 */
	snippet: string;
	title: string;
	/**
	 * original article's timestamp
	 */
	ts: string;
	votes: number;
};

export type Article = ArticleInit & {
	/**
	 * activets converted to timestamp
	 */
	parsedactivets: number;
	/**
	 * ats converted to timestamp
	 */
	parsedats: number;
	/**
	 * ts converted to timestamp
	 */
	parsedts: number;
};
