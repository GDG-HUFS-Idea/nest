export const ENUM = {
  PERMISSION: {
    GENERAL: 'general',
    ADMIN: 'admin',
  },
  SUBSCRIPTION_PLAN: {
    FREE: 'free',
    PRO: 'pro',
  },
  TERM_TYPE: {
    TERMS_OF_SERVICE: 'terms_of_service',
    PRIVACY_POLICY: 'privacy_policy',
    MARKETING: 'marketing',
  },
  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
  },
} as const
