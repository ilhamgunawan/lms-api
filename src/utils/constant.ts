export const messages = {
  general: 'Internal server error, please try again later.',
  missingFields: (fields: string) => `Missing fields: ${fields}`,
  notFound: 'No such records found.',
  badTimestampFormat: 'Invalid timestamp format.',
  duplicateUsername: (username: string) => `${username} has been taken, please use another username.`,
  invalidLogin: 'Username or password not match.',
  invalidJwtSecret: 'Jwt secret is invalid or undefined.',
};

export const responseStatus = {
  ok: 200,
  created: 201,
  movedPermanent: 301,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  internalServerError: 500,
};

export const errorName = {
  missingFields: 'MissingField',
  notFound: 'NotFound',
  badTimestampFormat: 'BadTimestampFormat',
  duplicateUsername: 'DuplicateUsername',
  invalidLogin: 'InvalidLogin',
  invalidJwtSecret: 'InvalidJwtSecret',
};
