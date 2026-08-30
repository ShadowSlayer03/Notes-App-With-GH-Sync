export class UnauthorizedError extends Error {}

export class ConflictError extends Error {}

export class ServerError extends Error {}

export class NetworkError extends Error {}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
	try {
		const response = await fetch(url, init);

		const result = await response.json();

		const errMessage = result.message ?? 'Something went wrong.';

		if (response.status === 401) {
			throw new UnauthorizedError(errMessage);
		}

		if (response.status === 409) {
			throw new ConflictError(errMessage);
		}

		if (response.status >= 500) {
			throw new ServerError(errMessage);
		}

		if (!response.ok) {
			throw new Error(errMessage);
		}

		return result.data;
	} catch (err) {
		if (
			err instanceof UnauthorizedError ||
			err instanceof ConflictError ||
			err instanceof ServerError
		) {
			throw err;
		}

		if (err instanceof TypeError) {
			throw new NetworkError(
				'Unable to connect to the Kairno backend.'
			);
		}

		throw err;
	}
}