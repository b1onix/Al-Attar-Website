-- Create a default admin user
-- Email: admin@al-attar.com
-- Password: AdminPassword123!

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@al-attar.com',
    crypt('AdminPassword123!', gen_salt('bf')),
    now(),
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- Note: You might also need to insert into auth.identities depending on your Supabase version
INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    id,
    id::text,
    format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
    'email',
    now(),
    now(),
    now()
FROM auth.users 
WHERE email = 'admin@al-attar.com';