export default interface Article {
	active: boolean;
	/**
	 * activation timestamp
	 */
	activets: string;
	/**
	 * activets converted to Date
	 */
	parsedactivets: Date;
	archived: boolean;
	/**
	 *  added timestamp
	 */
	ats: string;
	/**
	 * ats converted to Date
	 */
	parsedats: Date;
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
	/**
	 * ts converted to Date
	 */
	parsedts: Date;
	votes: number;
}
