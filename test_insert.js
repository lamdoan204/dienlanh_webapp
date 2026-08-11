import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('users').insert([{
    first_name: 'Test',
    last_name: 'Tech',
    email: 'testtech12345@example.com',
    phone_number: '0999999999',
    role: 'customer'
  }]).select().single();
  console.log("Error users:", error);
  console.log("Data users:", data);
  if (data) {
     const { error: workerError } = await supabase.from('worker').insert([{
        user_id: data.id,
        status: 'đang chờ',
        stars: 5
     }]);
     console.log("Error worker:", workerError);
     
     await supabase.from('users').delete().eq('id', data.id);
  }
}
run();
