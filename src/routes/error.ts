import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    let title = 'Error'
    let message = err.message
    let statusError = 500

    if (err instanceof SyntaxError) {
        title = 'Invalid JSON'
        message = 'The request body is not valid JSON'
        statusError = 400
    }else if ('status' in err && typeof err.status === 'number') {
        statusError = err.status
        title = err.message
    }

    res.status(statusError).render('pages/error', { title, message });
};