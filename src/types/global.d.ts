export { };

declare global {
    interface IResponse<T> {
        status: boolean;
        error?: string | string[];
        message: string | string[];
        statusCode: number | string;
        data?: T;
    }
}