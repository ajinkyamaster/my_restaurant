/**
 * Typed application errors.
 *
 * Every error that the API intentionally returns to a client carries a HTTP
 * status so the central error handler never has to guess (and never leaks an
 * internal implementation detail).
 */
class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = "AppError";
        this.status = status;
        this.expose = status < 500;
    }
}

class ValidationError extends AppError {
    constructor(message = "Invalid request") {
        super(message, 400);
        this.name = "ValidationError";
    }
}

class AuthError extends AppError {
    constructor(message = "Not authenticated") {
        super(message, 401);
        this.name = "AuthError";
    }
}

class ForbiddenError extends AppError {
    constructor(message = "Not allowed") {
        super(message, 403);
        this.name = "ForbiddenError";
    }
}

class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super(message, 404);
        this.name = "NotFoundError";
    }
}

class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
        this.name = "ConflictError";
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthError,
    ForbiddenError,
    NotFoundError,
    ConflictError
};
