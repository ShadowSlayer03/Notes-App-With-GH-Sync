const generateSessionToken = (): string => {
	const bytes = new Uint8Array(32);

	crypto.getRandomValues(bytes);

	return Array.from(
		bytes,
		(byte) => byte.toString(16).padStart(2, '0')
	).join('');
};

const hashSessionToken = async (
	token: string
): Promise<string> => {
	const encodedToken = new TextEncoder().encode(token);

	const hashBuffer = await crypto.subtle.digest(
		'SHA-256',
		encodedToken
	);

	return Array.from(
		new Uint8Array(hashBuffer),
		(byte) => byte.toString(16).padStart(2, '0')
	).join('');
};

export{
    generateSessionToken,
    hashSessionToken
}