// Datei: src/js/supabase.js
import { createClient } from '@supabase/supabase-js';

// ERSETZE DIESE WERTE MIT DEINEN SUPABASE DATEN:
const supabaseUrl = 'https://zjktxqcdqvxodccfrumo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqa3R4cWNkcXZ4b2RjY2ZydW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MjY1NzQsImV4cCI6MjA4NDIwMjU3NH0.l6TMo5vpVPw8TzSff9piDctae80Ky8oqby-2x_kQWZU';

export const supabase = createClient(supabaseUrl, supabaseKey);