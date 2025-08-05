# Visual Prompt Builder Database

## Overview

This directory contains the complete database schema and infrastructure for the Visual Prompt Builder application using PostgreSQL via Supabase.

## Directory Structure

```
database/
├── migrations/          # SQL migration files
├── types/              # TypeScript type definitions
├── policies/           # Row Level Security policies
├── functions/          # Database functions and stored procedures
├── QUERY_PATTERNS.md   # Common query patterns and optimization tips
└── README.md           # This file
```

## Database Schema

### Core Tables

#### Authentication System
- `users` - User profiles and authentication data
- `accounts` - OAuth provider connections
- `sessions` - Active user sessions
- `verification_tokens` - Email verification tokens

#### Application Core
- `projects` - User projects with visual layouts
- `project_components` - Draggable UI components
- `audio_recordings` - Audio file metadata
- `prompt_generations` - AI prompt history
- `collaborators` - Project sharing permissions

#### Analytics & Monitoring
- `user_activity` - User action tracking
- `api_usage` - API consumption and costs
- `error_logs` - System error tracking
- `performance_metrics` - Performance monitoring

## Key Features

### Security
- Row Level Security (RLS) on all tables
- User data isolation by default
- Secure file storage with signed URLs
- Column-level encryption support

### Performance
- Optimized indexes on all foreign keys
- Composite indexes for complex queries
- Database functions for common operations
- Connection pooling configuration

### Scalability
- UUID primary keys
- Partitioning ready for high-volume tables
- Efficient cascade deletes
- Automatic cleanup functions

## Migration Guide

### Running Migrations

1. **Sequential Execution**: Run migrations in order (001, 002, 003...)
2. **Transaction Safety**: Each migration is wrapped in a transaction
3. **Rollback Support**: Keep rollback scripts for each migration

### Migration Files

1. `001_auth_tables.sql` - Authentication system tables
2. `002_application_tables.sql` - Core application tables
3. `003_analytics_monitoring_tables.sql` - Analytics and monitoring
4. `004_row_level_security.sql` - RLS policies
5. `005_storage_buckets.sql` - File storage configuration
6. `006_database_functions.sql` - Helper functions and triggers

## TypeScript Integration

Import database types in your application:

```typescript
import { Database } from '@/database/types/database.types'

type User = Database['public']['Tables']['users']['Row']
type Project = Database['public']['Tables']['projects']['Row']
```

## Storage Configuration

### Audio Files
- Bucket: `audio-recordings`
- Max file size: 50MB
- Allowed types: MP3, WAV, WebM, OGG, MP4, AAC
- Path structure: `{user_id}/{project_id}/{timestamp}_{filename}`

## Database Functions

### Available Functions

1. `get_user_project_stats(user_id)` - Get user statistics
2. `get_monthly_api_costs(user_id, month)` - Calculate monthly costs
3. `check_project_quota(user_id, max)` - Check project limits
4. `soft_delete_project(project_id, user_id)` - Soft delete projects
5. `duplicate_project(source_id, user_id, name)` - Clone projects

## Performance Tips

1. Use database functions instead of multiple queries
2. Leverage indexes for filtering and sorting
3. Implement cursor-based pagination for large datasets
4. Monitor slow queries using performance_metrics table
5. Use EXPLAIN ANALYZE for query optimization

## Security Best Practices

1. Never bypass RLS policies
2. Use parameterized queries
3. Validate input at application level
4. Monitor access patterns
5. Regular security audits

## Backup Strategy

1. **Automated backups**: Daily via Supabase
2. **Point-in-time recovery**: Available for Pro plans
3. **Export scripts**: Regular data exports
4. **Test restores**: Monthly restore testing

## Monitoring

### Key Metrics
- Query performance (response times)
- Storage usage growth
- API usage patterns
- Error rates and types
- User activity trends

### Alerts
- Storage quota warnings
- Slow query notifications
- Error spike detection
- Unusual access patterns

## Support

For database-related issues:
1. Check error_logs table for details
2. Review performance_metrics for bottlenecks
3. Consult QUERY_PATTERNS.md for optimization
4. Contact the Database Assistant for help