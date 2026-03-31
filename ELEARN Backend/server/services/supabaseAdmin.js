// services/supabaseAdmin.js
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// optional helper
export async function createTeacher(email, password) {
  return await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    app_metadata: { role: "teacher" }
  });
}