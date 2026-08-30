import { noteColors } from "$lib/constants/notes";
import type { EditorOptions, Notes } from "../../types/pages/notes.types";

function replaceSpacesWithUnderscores(title: string) {
	return title.trim().toLowerCase().replace(/\s+/g, '_');
}

function replaceUnderscoresWithBlankAndCapitalize(id: string): string {
	return id
		.split('_')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function normalizeTitlesOfNotes(notes: Notes[]) {
	return notes.map(
		(note) => ({
			...note,
			id: note.title,
			title: replaceUnderscoresWithBlankAndCapitalize(note.title)
		})
	);
}

function formatLastEditedDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();

	const sameDay =
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth() &&
		date.getDate() === now.getDate();

	if (sameDay) {
		return `Today at ${date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		})}`;
	}

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);

	const isYesterday =
		date.getFullYear() === yesterday.getFullYear() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getDate() === yesterday.getDate();

	if (isYesterday) {
		return `Yesterday at ${date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		})}`;
	}

	const diffDays = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
	);

	if (diffDays < 7) {
		return `${date.toLocaleDateString([], {
			weekday: 'long'
		})} at ${date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		})}`;
	}

	if (date.getFullYear() === now.getFullYear()) {
		return `${date.toLocaleDateString([], {
			month: 'short',
			day: 'numeric'
		})} at ${date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		})}`;
	}

	return date.toLocaleDateString([], {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}

function sortNotes(notes: Notes[], sortedBy: string) {
	if (sortedBy === 'lastEdited') {
		return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	}
	return notes.sort((a, b) => a.title.localeCompare(b.title));
}

function getNoteColor(key: string) {
	let hash = 0;

	for (let i = 0; i < key.length; i++) {
		hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
	}

	return noteColors[hash % noteColors.length];
}

function compareOptions(noteDetails: EditorOptions, selectedNoteDetails: EditorOptions) {
	for (const savedKey in noteDetails) {
		const key = savedKey as keyof EditorOptions;

		if (noteDetails[key] !== selectedNoteDetails[key])
			return true;
	}
	return false;
}

export {
	replaceSpacesWithUnderscores,
	replaceUnderscoresWithBlankAndCapitalize,
	normalizeTitlesOfNotes,
	formatLastEditedDate,
	sortNotes,
	getNoteColor,
	compareOptions
}