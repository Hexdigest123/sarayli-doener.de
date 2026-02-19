const statusLabels: Record<string, string> = {
	pending: 'Ausstehend',
	paid: 'Bezahlt',
	in_process: 'In Bearbeitung',
	fulfilled: 'Abgeschlossen',
	cancelled: 'Storniert',
	refunded: 'Erstattet',
	cancellation_requested: 'Stornierung angefragt'
};

export function statusLabel(status: string): string {
	return statusLabels[status] ?? status;
}
