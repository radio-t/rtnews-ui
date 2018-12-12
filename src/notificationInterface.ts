export type NotificationLevel = "default" | "error" | "info" | "success";

export type NotificationInit = {
	data: JSX.Element | string;
	time?: number | null;
	level?: NotificationLevel;
	closable?: boolean;
	context?: any;
};

export type Notification = NotificationInit & {
	id?: number;
};
