// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mxltbckcsnliznewhfbo.supabase.co/rest/v1/'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14bHRiY2tjc25saXpuZXdoZmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjI4NTQsImV4cCI6MjA5MjU5ODg1NH0.qGsam61OK24Fg1x5ZCUjMH1mzQ4gicL8vwJxXr_zesQ'        

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)