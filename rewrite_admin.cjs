const fs = require('fs');
let code = fs.readFileSync('src/services/adminService.ts', 'utf8');

code = code.replace(
`  async addTechnician(tech: { first_name: string, last_name: string, phone_number: string, email: string }): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };
    
    // First insert into users
    const { data, error } = await supabase.from('users').insert([{
      first_name: tech.first_name,
      last_name: tech.last_name,
      phone_number: tech.phone_number,
      email: tech.email,
      password: null,
      role: 'worker'
    }]).select().single();

    if (error || !data) {
      console.error('Error adding tech (users):', error);
      return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };
    }

    // Then insert into worker
    const { error: workerError } = await supabase.from('worker').insert([{
      user_id: data.id,
      status: 'đang chờ',
      stars: 5
    }]);

    if (workerError) {
      console.error('Error adding tech (worker):', workerError);
      return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };
    }

    return { success: true };
  },`,
`  async addTechnician(tech: { first_name: string, last_name: string, phone_number: string, email: string }): Promise<{ success: boolean; message?: string }> {
    if (!supabase) return { success: false, message: 'Supabase client not initialized' };
    
    const { data, error } = await supabase.from('users').insert([{
      first_name: tech.first_name,
      last_name: tech.last_name,
      phone_number: tech.phone_number,
      email: tech.email,
      password: null,
      role: 'worker'
    }]).select().single();

    if (error || !data) {
      console.error('Error adding tech (users):', error);
      return { success: false, message: error?.message || 'Lỗi khi thêm user' };
    }

    const { error: workerError } = await supabase.from('worker').insert([{
      user_id: data.id,
      status: 'đang chờ',
      stars: 5
    }]);

    if (workerError) {
      console.error('Error adding tech (worker):', workerError);
      return { success: false, message: workerError?.message || 'Lỗi khi thêm worker' };
    }

    return { success: true };
  },`
);

code = code.replace(
`  async updateTechnician(id: string, tech: { first_name: string, last_name: string, phone_number: string, email: string, status: string }): Promise<boolean> {
    if (!supabase) return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };
    
    const { error: userError } = await supabase.from('users').update({
      first_name: tech.first_name,
      last_name: tech.last_name,
      phone_number: tech.phone_number,
      email: tech.email
    }).eq('id', Number(id));

    if (userError) {
      console.error('Error updating tech (users):', userError);
      return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };
    }

    const { error: workerError } = await supabase.from('worker').update({
      status: tech.status
    }).eq('user_id', Number(id));

    if (workerError) {
      console.error('Error updating tech (worker):', workerError);
      return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };
    }

    return { success: true };
  },`,
`  async updateTechnician(id: string, tech: { first_name: string, last_name: string, phone_number: string, email: string, status: string }): Promise<boolean> {
    if (!supabase) return false;
    
    const { error: userError } = await supabase.from('users').update({
      first_name: tech.first_name,
      last_name: tech.last_name,
      phone_number: tech.phone_number,
      email: tech.email
    }).eq('id', Number(id));

    if (userError) {
      console.error('Error updating tech (users):', userError);
      return false;
    }

    const { error: workerError } = await supabase.from('worker').update({
      status: tech.status
    }).eq('user_id', Number(id));

    if (workerError) {
      console.error('Error updating tech (worker):', workerError);
      return false;
    }

    return true;
  },`
);

code = code.replace(
`  async deleteTechnician(id: string): Promise<boolean> {
    if (!supabase) return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };
    const { error } = await supabase.from('users').delete().eq('id', Number(id));
    if (error) {
      console.error('Error deleting tech:', error);
      return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };
    }
    return { success: true };
  },`,
`  async deleteTechnician(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from('users').delete().eq('id', Number(id));
    if (error) {
      console.error('Error deleting tech:', error);
      return false;
    }
    return true;
  },`
);

fs.writeFileSync('src/services/adminService.ts', code);
