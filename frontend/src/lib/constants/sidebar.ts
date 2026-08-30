import {
    Star,
    Sun,
    Briefcase,
    Group,
    Folder as FolderBoxIcon,
    Book,
    LightBulbAlt,
    Heart,
    HomeAlt2,
    Note,
    Video,
    Link,
    Trash,
    Image
} from '@boxicons/svelte';

const sidebarIconMap: Record<string, any> = {
	// System pages
	home: HomeAlt2,
	notes: Note,

	// User folder icons
	folder: FolderBoxIcon,
	star: Star,
	sun: Sun,
	briefcase: Briefcase,
	group: Group,
	book: Book,
	bulb: LightBulbAlt,
	heart: Heart,

	// Media pages
	video: Video,
	photo: Image,
	link: Link,
	trash: Trash
};

const primaryItems = [
    {
        id: 'home',
        title: 'Home',
        href: '/home',
        icon: 'home',
        isLocked: false,
        desc: 'Your workspace at a glance'
    },
    {
        id: 'all-notes',
        title: 'All Notes',
        href: '/folders/all-notes',
        icon: 'notes',
        isLocked: false,
        desc: 'Browse every note in one place'
    }
];

const mediaItems = [
    { id: 'videos', label: 'Videos', href: '/media/videos', icon: 'video' },
    { id: 'photos', label: 'Photos', href: '/media/photos', icon: 'photo' },
    { id: 'links', label: 'Links', href: '/links', icon: 'link' },
    { id: 'trash', label: 'Trash', href: '/trash', icon: 'trash' }
];

export {
    sidebarIconMap,
    primaryItems,
    mediaItems
}