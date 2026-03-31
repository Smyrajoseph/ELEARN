import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function runTest() {
  // 1. Log in user
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "ashritatondlekar@gmail.com",       // replace with a real user
    password: "Ashrita@07022006"          // replace with their password
  });

  if (error) {
    console.error("Login failed:", error.message);
    return;
  }

  const token = data.session.access_token;
  console.log("Access token:", token);

  // 2. Call backend route with token
  const response = await fetch("http://localhost:5000/profiles", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json();
  console.log("Backend response:", result);
}

runTest();