import { Context } from "hono";
import type { ContentfulStatusCode } from 'hono/utils/http-status';

type SuccessResponse<T> = {
    c: Context;
    message: string;
    data?: T;
    statusCode: ContentfulStatusCode;
}

type ErrorResponse<T> = {
    c: Context;
    message: string;
    statusCode: ContentfulStatusCode;
}

const error = <T>({ c, message, statusCode }: ErrorResponse<T>) => {
    return c.json(
        {
            message
        },
        statusCode
    );
}

const success = <T>({ c, message, data, statusCode }: SuccessResponse<T>) => {
    return c.json(
        {
            message,
            data
        },
        statusCode
    );
}

export {
    error,
    success
}