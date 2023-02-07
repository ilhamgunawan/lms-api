export const messages = {
  general: 'Internal server error, please try again later.',
  missingFields: (fields: string) => `Missing fields: ${fields}`,
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
};
