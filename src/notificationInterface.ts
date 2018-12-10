export type NotificationLevel = "default" | "error" | "info" | "success";

export type Notification = {
	data: JSX.Element;
	time: number | null;
	level: NotificationLevel;
	closable: boolean;
	context: any;
	id?: number;
};
