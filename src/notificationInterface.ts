export type NotificationLevel = "default" | "error" | "info" | "success";

export type Notification = {
	data: JSX.Element | string;
	time: number | null;
	level: NotificationLevel;
	closable: boolean;
	context: any;
	id?: number;
};
