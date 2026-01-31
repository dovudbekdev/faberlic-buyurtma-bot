export const ERROR_CODES = {
  // SERVER ERRORS
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCodeType = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
