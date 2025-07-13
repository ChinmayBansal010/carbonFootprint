import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pkolzwhsurngvwqarsop.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrb2x6d2hzdXJuZ3Z3cWFyc29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjkxODcsImV4cCI6MjA2NzIwNTE4N30.nz0jgkW2h8aX10r4DW6jhkqqR7PW0H0i5tOyL42WKd4"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
