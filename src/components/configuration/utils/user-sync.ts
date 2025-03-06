
// Re-export types
export { type AppUser, type AuthUserInfo } from './types/user-types';

// Re-export the sync function
export { syncUsers } from './user-sync-service';

// Optionally re-export other utilities that might be used elsewhere
export { getCurrentUserInfo } from './auth-user-utils';
export { syncCurrentUserWithAppUsers } from './app-user-utils';
