function formatLastEdited(updatedAt: string): string {
	const date = new Date(updatedAt);

	const now = new Date();

	const today = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate()
	);

	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);

	const updatedDay = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate()
	);

	const time = date.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});

	if (updatedDay.getTime() === today.getTime()) {
		return `Last edited today at ${time}`;
	}

	if (updatedDay.getTime() === yesterday.getTime()) {
		return `Last edited yesterday at ${time}`;
	}

	const formattedDate = date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit'
	});

	return `Last edited ${formattedDate}`;
}

function replaceSpacesWithDashes(title: string){
	return title.trim().toLowerCase().replace(/\s+/g, '-')
}

export {
    formatLastEdited,
	replaceSpacesWithDashes
}