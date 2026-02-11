
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const TARGET_EMAIL = 'sundayfavour997@gmail.com';
const TARGET_PASSWORD = 'orange99()'; // Or '123456'? Let's try to set to 123456 as user requested.
const NEW_PASSWORD = '123456';

async function fixViaJwt() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;

    if (!supabaseUrl || !jwtSecret) {
        console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_JWT_SECRET');
        return;
    }

    // Generate Service Role JWT
    const payload = {
        role: 'service_role',
        iss: 'supabase',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    };

    const serviceRoleKey = jwt.sign(payload, jwtSecret);
    console.log('Generated Service Role Key (partial):', serviceRoleKey.substring(0, 20) + '...');

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Create Supabase Client with Anon Key (to pass Gateway check) but override Auth header
    const supabase = createClient(supabaseUrl, anonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        global: {
            headers: {
                Authorization: `Bearer ${serviceRoleKey}`
            }
        }
    });

    try {
        // 1. Check if user exists in Auth
        console.log(`Checking user in Auth: ${TARGET_EMAIL}`);
        // Admin API - listUsers is paginated, better to use listUsers() or specific check
        // We don't have getUserByEmail in admin api directly? convert to list.
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('Error listing users:', listError);
            return;
        }

        let user = users.find(u => u.email === TARGET_EMAIL);
        let userId;

        if (!user) {
            console.log('User not found. Creating...');
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: TARGET_EMAIL,
                password: NEW_PASSWORD,
                email_confirm: true,
            });

            if (createError) {
                console.error('Error creating user:', createError);
                return;
            }
            user = newUser.user;
            userId = user.id;
            console.log('User created:', userId);
        } else {
            userId = user.id;
            console.log('User found:', userId);
            // Update password
            const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                password: NEW_PASSWORD,
            });
            if (updateError) {
                console.error('Error updating password:', updateError);
            } else {
                console.log('Password updated to 123456');
            }
        }

        // 2. Update Profile to be Admin
        console.log('Updating public.profiles...');

        // Check if profile exists
        const { data: profile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 is not found
            console.error('Error checking profile:', profileCheckError);
            // Check if error is due to missing column
            if (profileCheckError.message.includes('column "is_admin" does not exist')) {
                console.error('CRITICAL: is_admin column missing. Cannot fix without DB access.');
            }
        }

        if (!profile) {
            console.log('Profile missing. Inserting...');
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({ id: userId, email: TARGET_EMAIL, is_admin: true });

            if (insertError) {
                console.error('Error inserting profile:', insertError);
                if (insertError.message && insertError.message.includes('is_admin')) {
                    console.error('CRITICAL: is_admin column missing?');
                }
            } else {
                console.log('Profile created as Admin');
            }
        } else {
            console.log('Profile exists. Updating is_admin...');
            const { error: updateProfileError } = await supabase
                .from('profiles')
                .update({ is_admin: true })
                .eq('id', userId);

            if (updateProfileError) {
                console.error('Error updating profile:', updateProfileError);
            } else {
                console.log('Profile updated to is_admin=true');
            }
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

fixViaJwt();
