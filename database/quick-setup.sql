-- Quick setup: Create users table and add your email
-- Run this in Supabase SQL Editor

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add your email to authorized users
INSERT INTO users (email, name) 
VALUES ('roncymondllave25@gmail.com', 'Ron Cymond Llave')
ON CONFLICT (email) DO NOTHING;

-- Check if user was added
SELECT * FROM users WHERE email = 'roncymondllave25@gmail.com';