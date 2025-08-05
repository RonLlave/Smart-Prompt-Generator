# Database Query Patterns

## Common Query Patterns

### Authentication Queries

#### Get User by Email
```sql
SELECT * FROM users WHERE email = $1;
```

#### Get User with Active Sessions
```sql
SELECT u.*, s.session_token, s.expires
FROM users u
JOIN sessions s ON u.id = s.user_id
WHERE s.session_token = $1 AND s.expires > NOW();
```

### Project Queries

#### Get User's Projects with Stats
```sql
SELECT 
    p.*,
    COUNT(DISTINCT pc.id) as component_count,
    COUNT(DISTINCT ar.id) as audio_count,
    COUNT(DISTINCT pg.id) as prompt_count
FROM projects p
LEFT JOIN project_components pc ON p.id = pc.project_id
LEFT JOIN audio_recordings ar ON p.id = ar.project_id
LEFT JOIN prompt_generations pg ON p.id = pg.project_id
WHERE p.user_id = $1
GROUP BY p.id
ORDER BY p.updated_at DESC;
```

#### Get Project with All Components
```sql
SELECT 
    p.*,
    json_agg(
        json_build_object(
            'id', pc.id,
            'type', pc.component_type,
            'position', json_build_object('x', pc.position_x, 'y', pc.position_y),
            'size', json_build_object('width', pc.width, 'height', pc.height),
            'z_index', pc.z_index,
            'properties', pc.properties
        ) ORDER BY pc.z_index
    ) as components
FROM projects p
LEFT JOIN project_components pc ON p.id = pc.project_id
WHERE p.id = $1
GROUP BY p.id;
```

#### Get Shared Projects
```sql
SELECT 
    p.*,
    c.role as user_role,
    u.name as owner_name,
    u.email as owner_email
FROM projects p
JOIN collaborators c ON p.id = c.project_id
JOIN users u ON p.user_id = u.id
WHERE c.user_id = $1 AND c.accepted_at IS NOT NULL
ORDER BY p.updated_at DESC;
```

### Audio Recording Queries

#### Get Project Audio Files
```sql
SELECT 
    ar.*,
    u.name as uploaded_by_name
FROM audio_recordings ar
JOIN users u ON ar.user_id = u.id
WHERE ar.project_id = $1
ORDER BY ar.created_at DESC;
```

#### Get User's Total Storage Usage
```sql
SELECT 
    COALESCE(SUM(file_size), 0) as total_bytes,
    COUNT(*) as file_count
FROM audio_recordings
WHERE user_id = $1;
```

### Analytics Queries

#### Get User Activity Summary
```sql
SELECT 
    activity_type,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as day
FROM user_activity
WHERE user_id = $1 
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY activity_type, day
ORDER BY day DESC, count DESC;
```

#### Get API Usage by Endpoint
```sql
SELECT 
    endpoint,
    COUNT(*) as request_count,
    SUM(tokens_used) as total_tokens,
    SUM(cost_usd) as total_cost,
    AVG(response_time_ms) as avg_response_time
FROM api_usage
WHERE user_id = $1
AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY endpoint
ORDER BY request_count DESC;
```

### Performance Queries

#### Get Slow Queries
```sql
SELECT 
    metric_type,
    metric_value,
    context->>'query' as query,
    created_at
FROM performance_metrics
WHERE metric_type = 'query_duration'
AND metric_value > 1000 -- queries slower than 1 second
ORDER BY created_at DESC
LIMIT 20;
```

### Collaboration Queries

#### Get Project Collaborators
```sql
SELECT 
    c.*,
    u.name,
    u.email,
    u.image,
    inviter.name as invited_by_name
FROM collaborators c
JOIN users u ON c.user_id = u.id
JOIN users inviter ON c.invited_by = inviter.id
WHERE c.project_id = $1
ORDER BY 
    CASE c.role 
        WHEN 'admin' THEN 1 
        WHEN 'editor' THEN 2 
        WHEN 'viewer' THEN 3 
    END,
    c.created_at;
```

## Query Optimization Tips

### 1. Use Indexes
- Always filter by indexed columns when possible
- Composite indexes for multi-column queries
- Partial indexes for filtered queries

### 2. Pagination
```sql
-- Use cursor-based pagination for large datasets
SELECT * FROM projects
WHERE user_id = $1 AND created_at < $2
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Batch Operations
```sql
-- Insert multiple components at once
INSERT INTO project_components (project_id, component_type, position_x, position_y, width, height)
VALUES 
    ($1, $2, $3, $4, $5, $6),
    ($1, $7, $8, $9, $10, $11),
    ($1, $12, $13, $14, $15, $16)
RETURNING *;
```

### 4. Use Database Functions
```sql
-- Instead of multiple queries, use functions
SELECT * FROM get_user_project_stats($1);
```

### 5. Avoid N+1 Queries
```sql
-- Get projects with their component counts in one query
SELECT 
    p.*,
    COALESCE(pc.component_count, 0) as component_count
FROM projects p
LEFT JOIN LATERAL (
    SELECT COUNT(*) as component_count
    FROM project_components
    WHERE project_id = p.id
) pc ON true
WHERE p.user_id = $1;
```

## Security Best Practices

1. **Always use parameterized queries** - Never concatenate user input
2. **Leverage RLS policies** - Let the database handle access control
3. **Use SECURITY DEFINER functions carefully** - Only for specific operations
4. **Validate input at application level** - Don't rely solely on database constraints
5. **Monitor slow queries** - Use the performance_metrics table

## Connection Pooling

### Recommended Settings
```typescript
{
  max: 20,           // Maximum pool size
  min: 5,            // Minimum pool size
  idleTimeoutMs: 30000,  // 30 seconds
  connectionTimeoutMs: 2000,  // 2 seconds
}
```

## Migration Best Practices

1. **Always test migrations** on a copy of production data
2. **Use transactions** for DDL operations when possible
3. **Create rollback scripts** for every migration
4. **Version control** all migration files
5. **Document breaking changes** clearly