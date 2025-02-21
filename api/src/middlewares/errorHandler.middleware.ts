import { NextFunction, Request, Response } from 'express';

const ErrorHandlerMiddleware = (error: any, request: Request, response: Response, next: NextFunction) : void => {
    let status = error.status || 500;
    let internalStatus = error.internalStatus;
    let message = error.internalStatus ? error.message : 'Internal server error.';
    let requestId = undefined;
    let errors = undefined;

    if(error.response) {
        status = error.response.status;
        internalStatus = error.response.data?.internalStatus;
        message = error.response.data?.message;
        requestId = error.response.headers['x-requestid'];
        errors = error.response.data?.errors;
    }

    if (error.name === "BadRequestException") {
        response.status(400).send({
            internalStatus: "BAD_REQUEST",
            message: error.message,
            errors: error?.errors
        });
    } else {
        response.status(status).send({ internalStatus, message, errors });
    }

};

export default ErrorHandlerMiddleware;
