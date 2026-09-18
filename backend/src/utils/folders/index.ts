function toBase64(data: unknown): string {
    return btoa(
        String.fromCharCode(
            ...new TextEncoder().encode(
                JSON.stringify(data, null, 2)
            )
        )
    );
}

function toJsonObject<T>(base64: string): T {
	return JSON.parse(
		new TextDecoder().decode(
			Uint8Array.from(
				atob(base64),
				(char) => char.charCodeAt(0)
			)
		)
	) as T;
}

export {
    toBase64,
    toJsonObject
}