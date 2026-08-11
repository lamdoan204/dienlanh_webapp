#!/bin/bash
sed -i 's/async addTechnician(tech: { first_name: string, last_name: string, phone_number: string, email: string, password?: string }): Promise<boolean> {/async addTechnician(tech: { first_name: string, last_name: string, phone_number: string, email: string }): Promise<{ success: boolean; message?: string }> {/g' src/services/adminService.ts

sed -i "s/password: tech.password || '123456',/password: null,/g" src/services/adminService.ts

sed -i "s/return false;/return { success: false, message: error?.message || workerError?.message || 'Lỗi không xác định' };/g" src/services/adminService.ts

sed -i "s/return true;/return { success: true };/g" src/services/adminService.ts
