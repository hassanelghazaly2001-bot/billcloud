import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iamyzgvipappqceurrwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbXl6Z3ZpcGFwcHFjZXVycndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODg2MzIsImV4cCI6MjA4OTM2NDYzMn0.P2N4I3wmwq83tvGigl-usCsbCjag37FsSnIvXquM3Xo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
