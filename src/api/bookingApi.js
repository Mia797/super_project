// src/api/bookingApi.js
import api from './axios';

// Booking record id from a raw API booking object (id = booking id, NOT equipment_id)
export const getBookingRecordId = (booking) => {
  if (!booking) return null;
  return booking.id ?? booking.booking_id ?? booking.bookingId ?? null;
};

export const normalizeBookings = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.bookings)) return payload.bookings;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.bookings)) return payload.data.bookings;
  if (payload.data && typeof payload.data === 'object' && getBookingRecordId(payload.data)) {
    return [payload.data];
  }
  if (getBookingRecordId(payload)) return [payload];
  return [];
};

export const getBookingIdFromResponse = (payload) => {
  if (!payload) return null;

  const booking = payload.booking || payload.data?.booking || payload.data;
  if (booking && typeof booking === 'object' && !Array.isArray(booking)) {
    return getBookingRecordId(booking);
  }

  return payload.booking_id ?? null;
};

export const mapMachineBooking = (booking) => ({
  booking_id: getBookingRecordId(booking),
  equipment_id: booking.equipment_id ?? booking.machine_id,
  name: booking.equipment_name || booking.machine_name || booking.name || 'Booked Machine',
  image_url: booking.image_url || booking.equipment_image || booking.machine_image,
  bookingTime: booking.start_time || booking.booking_time,
  status: booking.status,
});

// Cancel a booking (POST /bookings/cancel with booking ID)
export const cancelBooking = (bookingId) =>
  api.post('/bookings/cancel', { booking_id: Number(bookingId) });

// Get equipment the user is currently using / checked into
export const getActiveBookings = () =>
  api.get('/bookings/use');

// Get user's bookings
export const getAllBookings = () =>
  api.get('/bookings');

// Legacy alias
export const getUserBookings = () =>
  api.get('/bookings/user');
