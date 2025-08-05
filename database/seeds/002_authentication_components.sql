-- Authentication Components Seed Data

INSERT INTO component_library (
    component_id, display_name, category_id, description, icon, 
    complexity_score, configuration, features
) VALUES
-- Email/Password Login
(
    'auth-email-login',
    'Email/Password Login',
    (SELECT id FROM component_categories WHERE name = 'authentication'),
    'Standard login form with email and password fields',
    '📧',
    2,
    '{
        "fields": ["email", "password"],
        "showRememberMe": true,
        "showForgotPassword": true,
        "enablePasswordVisibility": true,
        "validationRules": {
            "email": "required|email",
            "password": "required|min:8"
        },
        "redirectOnSuccess": "/dashboard",
        "maxLoginAttempts": 5,
        "lockoutDuration": 900
    }'::jsonb,
    '["form-validation", "password-toggle", "remember-me", "error-handling", "csrf-protection", "rate-limiting"]'::jsonb
),
-- User Registration
(
    'auth-signup',
    'User Registration',
    (SELECT id FROM component_categories WHERE name = 'authentication'),
    'Complete signup flow with validation and email verification',
    '📝',
    3,
    '{
        "fields": ["name", "email", "password", "confirmPassword"],
        "requireEmailVerification": true,
        "captchaEnabled": true,
        "passwordStrengthIndicator": true,
        "termsAcceptance": true,
        "welcomeEmailTemplate": "welcome-new-user",
        "autoLogin": false,
        "customFields": []
    }'::jsonb,
    '["email-verification", "password-strength", "terms-acceptance", "captcha", "custom-fields", "welcome-email"]'::jsonb
),
-- Social Login
(
    'auth-oauth',
    'Social Login',
    (SELECT id FROM component_categories WHERE name = 'authentication'),
    'OAuth providers integration with multiple social platforms',
    '🔗',
    3,
    '{
        "providers": {
            "google": {"enabled": true, "scopes": ["email", "profile"]},
            "github": {"enabled": true, "scopes": ["user:email"]},
            "facebook": {"enabled": false, "scopes": ["email"]},
            "twitter": {"enabled": false, "scopes": ["email"]}
        },
        "buttonStyle": "default",
        "showProviderIcon": true,
        "autoLinkAccounts": false,
        "allowMultipleAccounts": true
    }'::jsonb,
    '["oauth-integration", "provider-selection", "account-linking", "scope-management", "error-handling"]'::jsonb
),
-- Two-Factor Authentication
(
    'auth-2fa',
    'Two-Factor Authentication',
    (SELECT id FROM component_categories WHERE name = 'authentication'),
    'SMS and authenticator app based two-factor authentication',
    '🔐',
    4,
    '{
        "methods": {
            "sms": {"enabled": true, "codeLength": 6},
            "authenticator": {"enabled": true, "qrSize": 200},
            "email": {"enabled": true, "codeLength": 6}
        },
        "codeExpiry": 300,
        "maxAttempts": 3,
        "backupCodes": 10,
        "rememberDevice": true,
        "rememberDuration": 2592000
    }'::jsonb,
    '["sms-verification", "totp", "backup-codes", "qr-generation", "device-remember", "recovery-options"]'::jsonb
),
-- Magic Link Login
(
    'auth-passwordless',
    'Magic Link Login',
    (SELECT id FROM component_categories WHERE name = 'authentication'),
    'Email-based passwordless authentication',
    '✨',
    2,
    '{
        "linkExpiry": 900,
        "emailTemplate": "magic-link",
        "allowMultipleDevices": true,
        "customMessage": "Click the link to sign in",
        "redirectUrl": "/dashboard",
        "rateLimit": 5
    }'::jsonb,
    '["email-verification", "link-generation", "token-management", "device-tracking", "rate-limiting"]'::jsonb
),
-- Role-Based Access Control
(
    'auth-rbac',
    'Role-Based Access Control',
    (SELECT id FROM component_categories WHERE name = 'authentication'),
    'User roles and permissions management system',
    '👥',
    4,
    '{
        "defaultRoles": ["admin", "user", "moderator", "guest"],
        "permissions": {
            "admin": ["all"],
            "moderator": ["read", "write", "moderate"],
            "user": ["read", "write:own"],
            "guest": ["read"]
        },
        "hierarchical": true,
        "customRoles": true,
        "permissionInheritance": true
    }'::jsonb,
    '["role-management", "permission-matrix", "hierarchical-roles", "custom-permissions", "access-control"]'::jsonb
),
-- Password Reset
(
    'auth-password-reset',
    'Password Reset',
    (SELECT id FROM component_categories WHERE name = 'authentication'),
    'Secure password reset flow with email verification',
    '🔑',
    2,
    '{
        "tokenExpiry": 3600,
        "requireOldPassword": false,
        "emailTemplate": "password-reset",
        "passwordRules": {
            "minLength": 8,
            "requireUppercase": true,
            "requireNumbers": true,
            "requireSpecialChars": true
        },
        "preventReuse": 5
    }'::jsonb,
    '["token-generation", "email-verification", "password-validation", "security-questions", "audit-logging"]'::jsonb
),
-- Session Management
(
    'auth-session-manager',
    'Session Management',
    (SELECT id FROM component_categories WHERE name = 'authentication'),
    'Active session monitoring and management',
    '📱',
    3,
    '{
        "sessionTimeout": 1800,
        "maxConcurrentSessions": 3,
        "showDeviceInfo": true,
        "allowRemoteLogout": true,
        "sessionPersistence": "database",
        "activityTracking": true
    }'::jsonb,
    '["session-tracking", "device-management", "remote-logout", "activity-monitoring", "concurrent-limits"]'::jsonb
)
ON CONFLICT (component_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    category_id = EXCLUDED.category_id,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    complexity_score = EXCLUDED.complexity_score,
    configuration = EXCLUDED.configuration,
    features = EXCLUDED.features,
    updated_at = CURRENT_TIMESTAMP;