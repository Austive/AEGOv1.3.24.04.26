import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Clock, MapPin, Star } from 'lucide-react';

import Chat from '../Chat';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [reviewingBooking, setReviewingBooking] = useState<any>(null);
  const [cancellingBooking, setCancellingBooking] = useState<any>(null);
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'bookings'),
      where('clientId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort chronologically (newest first)
      allBookings.sort((x, y) => (y.createdAt?.toMillis() || 0) - (x.createdAt?.toMillis() || 0));
      
      const upcoming = allBookings.filter(b => !['completed', 'cancelled'].includes(b.status));
      const past = allBookings.filter(b => ['completed', 'cancelled'].includes(b.status));
      
      setUpcomingBookings(upcoming);
      setPastBookings(past);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [user]);

  const submitReview = async () => {
    if (!user || !reviewingBooking) return;
    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        bookingId: reviewingBooking.id,
        companyId: reviewingBooking.assignedCompanyId,
        clientId: user.uid,
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      
      // Mark booking as reviewed
      await updateDoc(doc(db, 'bookings', reviewingBooking.id), {
        reviewed: true
      });

      setReviewingBooking(null);
      setRating(5);
      setComment('');
    } catch (error) {
      console.error("Error submitting review", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const cancelBooking = async () => {
    if (!user || !cancellingBooking) return;
    setIsCancelling(true);
    try {
      await updateDoc(doc(db, 'bookings', cancellingBooking.id), {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin', // In a real app we might target specific admins or a dedicated role
        type: 'cancellation',
        title: 'Booking Cancelled',
        message: `Client cancelled booking ${cancellingBooking.id.slice(0,8)}.`,
        read: false,
        createdAt: serverTimestamp(),
      });

      if (cancellingBooking.assignedCompanyId) {
        await addDoc(collection(db, 'notifications'), {
          userId: cancellingBooking.assignedCompanyId,
          type: 'cancellation',
          title: 'Booking Cancelled',
          message: `Client cancelled an assigned booking at ${cancellingBooking.location}.`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setCancellingBooking(null);
    } catch (error) {
      console.error("Error cancelling booking", error);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-zinc-300">No bookings yet</h3>
          <p className="text-zinc-500 mt-2">Request security services from the home page.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {upcomingBookings.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-zinc-300">Upcoming Bookings</h2>
              <div className="grid gap-6">
                {upcomingBookings.map(booking => (
                  <div key={booking.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-white/10 text-zinc-300 text-xs font-medium uppercase tracking-wider rounded-full border border-zinc-700">
                            {booking.serviceType}
                          </span>
                          <span className="text-sm font-medium text-blue-500">
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{booking.location}</h3>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {booking.date} ({booking.duration} hrs)</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between gap-2">
                        {['assigned', 'deployed'].includes(booking.status) && (
                          <button
                            onClick={() => setActiveChatBookingId(activeChatBookingId === booking.id ? null : booking.id)}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded transition-colors"
                          >
                            {activeChatBookingId === booking.id ? 'Close Chat' : 'Open Chat'}
                          </button>
                        )}
                        <button 
                          onClick={() => setCancellingBooking(booking)}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                    {activeChatBookingId === booking.id && (
                      <Chat bookingId={booking.id} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {pastBookings.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-zinc-400">Past Bookings</h2>
              <div className="grid gap-6">
                {pastBookings.map(booking => (
                  <div key={booking.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-medium uppercase tracking-wider rounded-full border border-zinc-700">
                          {booking.serviceType}
                        </span>
                        <span className={`text-sm font-medium ${
                          booking.status === 'completed' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{booking.location}</h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {booking.date} ({booking.duration} hrs)</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end justify-between gap-2">
                      {booking.status === 'completed' && !booking.reviewed && (
                        <button 
                          onClick={() => setReviewingBooking(booking)}
                          className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-semibold rounded transition-colors"
                        >
                          Rate & Review
                        </button>
                      )}
                      {booking.status === 'completed' && booking.reviewed && (
                        <span className="text-sm text-zinc-500 flex items-center gap-1"><Star className="w-4 h-4 fill-zinc-500" /> Reviewed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCancellingBooking(null)} />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Cancel Booking</h3>
            <p className="text-zinc-400 mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
              >
                Keep Booking
              </button>
              <button 
                onClick={cancelBooking}
                disabled={isCancelling}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReviewingBooking(null)} />
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Rate Your Experience</h3>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star className={`w-8 h-8 ${star <= rating ? 'text-zinc-300 fill-zinc-300' : 'text-zinc-700'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a comment (optional)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-zinc-300 h-24 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setReviewingBooking(null)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitReview}
                disabled={isSubmittingReview}
                className="flex-1 py-2 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold rounded-lg transition-colors"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
