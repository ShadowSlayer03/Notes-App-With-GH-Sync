import matter from "@11ty/gray-matter";

const encoder = new TextEncoder();

function stringToBase64(value: string): string {
	const bytes = encoder.encode(value);

	let binary = '';

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary);
}


const decoder = new TextDecoder();

function base64ToString(base64: string): string {
	const binary = atob(base64.replace(/\n/g, ''));

	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

	return decoder.decode(bytes);
}

function rawContentToDetails(rawContent: string){
	const { data: frontMatter, content } = matter(rawContent);
	return { frontMatter, content };
}

function createOrUpdateFrontMatter(content: string, details: Object): string {
	return matter.stringify(content, details);
}

function isValidUUIDv4(uuid: string): boolean {
  const v4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return v4Regex.test(uuid);
}

export {
	stringToBase64,
	base64ToString,
	rawContentToDetails,
	createOrUpdateFrontMatter,
	isValidUUIDv4
}