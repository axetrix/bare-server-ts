export abstract class HTTPError extends Error {
  status: number = 500;

  constructor(message: string) {
    super(message);
    this.name = 'Error';
  }
}

export class NotFoundError extends HTTPError {
  status = 404;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends HTTPError {
  status = 401;

  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HTTPError {
  status = 403;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class InternalServerError extends HTTPError {
  status = 500;

  constructor(message: string) {
    super(message);
    this.name = 'InternalServerError';
  }
}

export class BadRequestError extends HTTPError {
  status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class ValidationError extends HTTPError {
  status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
