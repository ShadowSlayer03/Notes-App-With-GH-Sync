import {
    Star,
    Sun,
    Briefcase,
    Group,
    Folder as FolderBoxIcon,
    Book,
    LightBulbAlt,
    Heart
} from '@boxicons/svelte';

import type { FolderIcon, FolderTheme, Theme } from "../../types/pages/folder.types";

const themes = [
	{
		id: 'paper',
		label: 'Paper',
		class: 'bg-[#e2e4e6] border-zinc-300'
	},
	{
		id: 'midnight',
		label: 'Midnight',
		class: 'bg-[#1c1e22] border-zinc-700'
	},
	{
		id: 'amethyst',
		label: 'Amethyst',
		class: 'bg-violet-500 border-violet-400'
	},
	{
		id: 'ocean',
		label: 'Ocean',
		class: 'bg-sky-500 border-sky-400'
	},
	{
		id: 'forest',
		label: 'Forest',
		class: 'bg-emerald-500 border-emerald-400'
	},
	{
		id: 'amber',
		label: 'Amber',
		class: 'bg-amber-500 border-amber-400'
	}
] satisfies Theme[];

const icons = [
	{ id: 'folder', component: FolderBoxIcon },
	{ id: 'star', component: Star },
	{ id: 'sun', component: Sun },
	{ id: 'briefcase', component: Briefcase },
	{ id: 'group', component: Group },
	{ id: 'book', component: Book },
	{ id: 'bulb', component: LightBulbAlt },
	{ id: 'heart', component: Heart }
] satisfies FolderIcon[];

const iconMap = Object.fromEntries(
	icons.map(({ id, component }) => [id, component])
) as Record<FolderIcon['id'], FolderIcon['component']>;

const themeMap: Record<
    FolderTheme,
    {
        bg: string;
        text: string;
        border: string;
        shadow: string;
        spine: string;
        bookmark: string;
        dots: string;
        icon: string;
        noteCount: string;
    }
> = {
    paper: {
        bg: 'bg-[#e2e4e6]',
        text: 'text-zinc-800',
        border: 'border border-white/20',
        shadow: 'shadow-[0_15px_25px_-8px_rgba(0,0,0,0.5)]',
        spine: 'bg-linear-to-r from-black/15 to-transparent',
        bookmark: 'bg-[#f4f5f6] border-x border-black/5',
        dots: 'bg-zinc-600',
        icon: 'text-zinc-700',
        noteCount: 'text-zinc-500'
    },

    midnight: {
        bg: 'bg-[#1c1e22]',
        text: 'text-[#c1a875]',
        border: 'border border-zinc-800',
        shadow: 'shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)]',
        spine: 'bg-linear-to-r from-black/40 to-transparent',
        bookmark: 'bg-[#32363d] border-x border-zinc-700/30',
        dots: 'bg-zinc-400',
        icon: 'text-amber-500/80',
        noteCount: 'text-[#c1a875]'
    },

    amethyst: {
        bg: 'bg-violet-200',
        text: 'text-violet-900',
        border: 'border border-violet-300',
        shadow: 'shadow-[0_15px_25px_-8px_rgba(0,0,0,0.5)]',
        spine: 'bg-linear-to-r from-violet-900/15 to-transparent',
        bookmark: 'bg-violet-100 border-x border-violet-300',
        dots: 'bg-violet-700',
        icon: 'text-violet-700',
        noteCount: 'text-violet-700'
    },

    ocean: {
        bg: 'bg-sky-200',
        text: 'text-sky-900',
        border: 'border border-sky-300',
        shadow: 'shadow-[0_15px_25px_-8px_rgba(0,0,0,0.5)]',
        spine: 'bg-linear-to-r from-sky-900/15 to-transparent',
        bookmark: 'bg-sky-100 border-x border-sky-300',
        dots: 'bg-sky-700',
        icon: 'text-sky-700',
        noteCount: 'text-sky-700'
    },

    forest: {
        bg: 'bg-emerald-200',
        text: 'text-emerald-900',
        border: 'border border-emerald-300',
        shadow: 'shadow-[0_15px_25px_-8px_rgba(0,0,0,0.5)]',
        spine: 'bg-linear-to-r from-emerald-900/15 to-transparent',
        bookmark: 'bg-emerald-100 border-x border-emerald-300',
        dots: 'bg-emerald-700',
        icon: 'text-emerald-700',
        noteCount: 'text-emerald-700'
    },

    amber: {
        bg: 'bg-amber-200',
        text: 'text-amber-900',
        border: 'border border-amber-300',
        shadow: 'shadow-[0_15px_25px_-8px_rgba(0,0,0,0.5)]',
        spine: 'bg-linear-to-r from-amber-900/15 to-transparent',
        bookmark: 'bg-amber-100 border-x border-amber-300',
        dots: 'bg-amber-700',
        icon: 'text-amber-700',
        noteCount: 'text-amber-700'
    }
};

export {
    themes,
    icons,
    iconMap,
    themeMap
}