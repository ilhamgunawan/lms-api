const code = {
  general: '99999',
  invalidRoute: '10000',
  unauthenticated: '10001',
  loginFailure: '10001',
  expiredToken: '10002',
  invalidAuthToken: '10003',
};

const message = {
  general: 'General error',
  badRequest: 'Bad request',
  invalidRoute: 'Invalid route',
  unauthenticated: 'No token provided',
  loginFailure: 'Login failed, please provide valid email and password',
  expiredToken: 'Expired token',
  invalidAuthToken: 'Invalid token',
};

const errors = { code, message };
export default errors;
