import type { NoteTheme } from "../../types/pages/notes.types";

export const noteThemes: {
	id: NoteTheme;
	label: string;
	description: string;
	preview: string;
}[] = [
		{
			id: 'default',
			label: 'Default',
			description: 'Clean editor',
			preview: 'bg-zinc-900'
		},
		{
			id: 'paper',
			label: 'Paper',
			description: 'Subtle notebook',
			preview: 'bg-stone-100'
		},
		{
			id: 'parchment',
			label: 'Parchment',
			description: 'Warm vintage paper',
			preview: 'bg-amber-100'
		},
		{
			id: 'graph',
			label: 'Graph',
			description: 'Engineering graph',
			preview: 'bg-sky-100'
		},
		{
			id: 'grid',
			label: 'Grid',
			description: 'Square grid',
			preview: 'bg-slate-200'
		},
		{
			id: 'dots',
			label: 'Dots',
			description: 'Bullet journal',
			preview: 'bg-neutral-200'
		},
		{
			id: 'linen',
			label: 'Linen',
			description: 'Soft textured paper',
			preview: 'bg-stone-200'
		},
		{
			id: 'terminal',
			label: 'Terminal',
			description: 'Green on black',
			preview: 'bg-black'
		},
		{
			id: 'midnight',
			label: 'Midnight',
			description: 'Dark editor',
			preview: 'bg-slate-900'
		},
		{
			id: 'sepia',
			label: 'Sepia',
			description: 'Comfortable reading',
			preview: 'bg-yellow-100'
		}
	];

export const sortOptions = [
	{ id: 'lastEdited', name: 'Latest Edited' },
	{ id: 'alphabetical', name: 'Name' },
	{ id: 'updatedBy', name: 'Updated By' }
];

export const noteColors = [
	'bg-blue-900/40 text-blue-400',
	'bg-violet-900/40 text-violet-400',
	'bg-emerald-900/40 text-emerald-400',
	'bg-amber-900/40 text-amber-400',
	'bg-rose-900/40 text-rose-400',
	'bg-cyan-900/40 text-cyan-400',
	'bg-indigo-900/40 text-indigo-400',
	'bg-orange-900/40 text-orange-400',
	'bg-pink-900/40 text-pink-400',
	'bg-lime-900/40 text-lime-400',
	'bg-sky-900/40 text-sky-400',
	'bg-teal-900/40 text-teal-400'
];

export const autoSyncOptions = [
	{ label: 'Manual only', time: null },
	{ label: '2 minutes', time: 2 * 60 * 1000 },
	{ label: '5 minutes', time: 5 * 60 * 1000 },
	{ label: '10 minutes', time: 10 * 60 * 1000 },
	{ label: '15 minutes', time: 15 * 60 * 1000 },
	{ label: '30 minutes', time: 30 * 60 * 1000 }
];