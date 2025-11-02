-- Verify Supabase setup
SELECT 
    u.email,
    u.name,
    u.role,
    u."onboardingCompleted",
    l.plan as license_plan,
    l.status as license_status
FROM "users" u
LEFT JOIN "licenses" l ON l."userId" = u.id
WHERE u.email = 'varangian@admin.com';
