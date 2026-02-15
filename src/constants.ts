export enum Status {
  PENDING = 'pending',
  INITIALIZING = 'initializing',
  WAITING_FOR_AUTHENTICATION = 'waiting_for_authentication',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

export const JWT_TOKEN_KEY = 'web3_jwt_token';
export const JWT_ADDRESS_KEY = 'web3_jwt_address';