import { firebaseDB } from '../../config/firebase';

/**
 * Giả lập thanh toán cho booking
 */
export const makePayment = async (bookingId: string) => {
  const bookingRef = firebaseDB.collection('bookings').doc(bookingId);
  const bookingSnap = await bookingRef.get();

  if (!bookingSnap.exists) {
    throw new Error('Booking không tồn tại');
  }

  const bookingData = bookingSnap.data();

  // Nếu đã thanh toán rồi thì không cần thanh toán lại
  if (bookingData?.status === 'paid') {
    return { ...bookingData, message: 'Đơn hàng đã được thanh toán' };
  }

  // Giả lập xử lý thanh toán (chờ 2s)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Cập nhật trạng thái booking
  await bookingRef.update({
    status: 'paid',
    paidAt: new Date(),
  });

  return {
    ...bookingData,
    status: 'paid',
    paidAt: new Date(),
  };
};
