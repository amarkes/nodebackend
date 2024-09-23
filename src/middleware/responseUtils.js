const { ValidationError, UniqueConstraintError } = require('sequelize');

exports.successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
};

exports.errorResponse = (res, message = 'Bad Request', statusCode = 400, errors = []) => {
    return res.status(statusCode).json({
        status: 'error',
        message,
        errors,
    });
};

exports.serverErrorResponse = (res, message = 'Internal Server Error', errors = []) => {
    if (Array.isArray(errors) && errors.length > 0) {
        return res.status(500).json({
            status: 500,
            message,
            errors: [{error: errors[0].message}],
        });
    }
    return res.status(500).json({
        status: 500,
        message,
        errors,
    });
};
exports.defaultErrorResponse = (res, err, statusCode = 500) => {
    const response = {
        status: statusCode
    };

    if (err.message) {
        response.message = err.message;
    }
    if (err.data) {
        response.data = err.data;
    }
    if (Array.isArray(err.errors) && err.errors.length > 0) {
        response.errors = err.errors;
    }

    return res.status(statusCode).json(response);
};

exports.defaultErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode;
    if (!err.statusCode) {
        return this.serverErrorResponse(res, err.message, err.errors);
    }
    return this.defaultErrorResponse(res, err, err.statusCode);
}