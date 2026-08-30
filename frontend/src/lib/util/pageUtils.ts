import { primaryItems } from '$lib/constants/sidebar';

function extractPageName(fullPath: string) {
	const pageLower = fullPath.split('/').filter(Boolean).pop() || '';

	const letters = pageLower.split('');

	const capitalizedLetters = letters.map((letter, index) =>
		index === 0 ? letter.toUpperCase() : letter === '-' ? ' ' : letter
	);

	return capitalizedLetters.join('');
}

function extractPageDesc(fullPath: string) {
	const reqObj = primaryItems.find((item) => item.href === fullPath);

	return reqObj?.desc ?? '';
}

function extractPageIcon(fullPath: string) {
	const reqObj = primaryItems.find((item) => item.href === fullPath);

	return reqObj?.icon;
}

function isFolderPage(fullPath: string) {
	return fullPath.startsWith('/folders/');
}

function isNotePage(fullPath: string) {
	return fullPath.startsWith('/notes/');
}

export {
	extractPageName,
	extractPageDesc,
	extractPageIcon,
	isFolderPage,
	isNotePage
};