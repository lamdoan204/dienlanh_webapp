import { supabase } from './supabaseClient';

export interface TimeSlotRecord {
  id: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
  created_at?: string;
  label?: string;
}

export const timeSlotService = {
  /**
   * Fetch time slots from public.time_slots table
   */
  async fetchTimeSlots(): Promise<TimeSlotRecord[]> {
    if (!supabase) {
      return timeSlotService.getFallbackTimeSlots();
    }

    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.info('time_slots table query info:', error.message);
        return timeSlotService.getFallbackTimeSlots();
      }

      if (!data || data.length === 0) {
        return timeSlotService.getFallbackTimeSlots();
      }

      const activeSlots = data.filter((item: any) => item.is_active !== false);
      if (activeSlots.length === 0) {
        return timeSlotService.getFallbackTimeSlots();
      }

      return activeSlots.map((item: any) => {
        const startStr = String(item.start_time || '08:00').slice(0, 5);
        const endStr = String(item.end_time || '10:00').slice(0, 5);
        return {
          id: item.id,
          start_time: item.start_time,
          end_time: item.end_time,
          is_active: item.is_active ?? true,
          created_at: item.created_at,
          label: `${startStr} - ${endStr}`,
        };
      });
    } catch (err) {
      console.error('Error fetching time_slots:', err);
      return timeSlotService.getFallbackTimeSlots();
    }
  },

  getFallbackTimeSlots(): TimeSlotRecord[] {
    return [
      { id: 1, start_time: '08:00:00', end_time: '10:00:00', is_active: true, label: '08:00 - 10:00' },
      { id: 2, start_time: '10:00:00', end_time: '12:00:00', is_active: true, label: '10:00 - 12:00' },
      { id: 3, start_time: '13:30:00', end_time: '15:30:00', is_active: true, label: '13:30 - 15:30' },
      { id: 4, start_time: '15:30:00', end_time: '17:30:00', is_active: true, label: '18:00 - 20:00' },
    ];
  },
};
