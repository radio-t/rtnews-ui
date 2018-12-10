export type NotificationLevel = "default" | "error" | "info" | "success";

export type Notification = {
	data: "string" | HTMLElement | ReactElement;
	time: number | null;
	level: NotificationLevel;
	closable: boolean;
	context: any;
	id?: number;
};
