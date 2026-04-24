import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, arrayUnion, getDoc, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, MapPin, CheckCircle, XCircle, UserCheck } from 'lucide-react';

import Chat from '../Chat';

export default function PersonnelDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial status
    const fetchStatus = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setIsOnline(userDoc.data().isOnline || false);
      }
    };
    fetchStatus();

    const q = query(collection(db, 'bookings'), where('assignedPersonnelId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    return () => unsubscribe();
  }, [user]);

  const toggleStatus = async () => {
    if (!user) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isOnline: newStatus
      });
    } catch (error) {
      console.error("Error updating status", error);
      setIsOnline(!newStatus); // revert on error
    }
  };

  const updateJobStatus = async (bookingId: string, status: string, additionalUpdates = {}) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: serverTimestamp(),
        ...additionalUpdates
      });
    } catch (error) {
      console.error("Error updating job", error);
    }
  };

  const handleAccept = async (booking: any) => {
    if (!user) return;
    await updateJobStatus(booking.id, 'deployed');
    
    // Notify Company/Admin
    if (booking.assignedCompanyId) {
      await addDoc(collection(db, 'notifications'), {
        userId: booking.assignedCompanyId,
        type: 'personnel_accepted',
        title: 'Personnel Accepted',
        message: `Personnel has accepted the booking at ${booking.location}.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
    await addDoc(collection(db, 'notifications'), {
      userId: 'admin',
      type: 'personnel_accepted',
      title: 'Personnel Accepted',
      message: `Personnel accepted booking at ${booking.location}.`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  const handleReject = async (booking: any) => {
    if (!user) return;
    await updateJobStatus(booking.id, 'assigned', { 
      assignedPersonnelId: null,
      rejectedBy: arrayUnion(user.uid)
    });

    if (booking.assignedCompanyId) {
      await addDoc(collection(db, 'notifications'), {
        userId: booking.assignedCompanyId,
        type: 'personnel_rejected',
        title: 'Personnel Rejected',
        message: `Personnel has rejected the booking at ${booking.location}. Please reassign.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
    await addDoc(collection(db, 'notifications'), {
      userId: 'admin',
      type: 'personnel_rejected',
      title: 'Personnel Rejected',
      message: `Personnel rejected booking at ${booking.location}.`,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Personnel Dashboard</h1>
        
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full py-2 px-4">
          <span className="text-sm text-zinc-400 font-medium">Status:</span>
          <button 
            onClick={toggleStatus}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-zinc-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-semibold ${isOnline ? 'text-green-500' : 'text-zinc-500'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <p className="text-zinc-500">No active assignments.</p>
        ) : (
          assignments.map(booking => (
            <div key={booking.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/10 text-zinc-300 text-xs font-medium uppercase tracking-wider rounded-full border border-zinc-700">
                    {booking.serviceType}
                  </span>
                  <span className={`text-sm font-medium ${
                    booking.status === 'completed' ? 'text-green-500' :
                    booking.status === 'deployed' ? 'text-blue-500' :
                    'text-zinc-300'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{booking.location}</h3>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {booking.date} ({booking.duration} hrs)</span>
                </div>
                {booking.status === 'assigned' && (
                  <p className="text-sm text-white mt-2">You have been assigned to this request. Please accept or reject.</p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {booking.status === 'assigned' && (
                  <>
                    <button 
                      onClick={() => handleAccept(booking)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                    >
                      <UserCheck className="w-5 h-5" />
                      Accept
                    </button>
                    <button 
                      onClick={() => handleReject(booking)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-lg transition-colors border border-red-500/20"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </>
                )}
                {booking.status === 'deployed' && (
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button 
                      onClick={() => updateJobStatus(booking.id, 'completed')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-400 text-zinc-950 font-semibold rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Completed
                    </button>
                    <button
                      onClick={() => setActiveChatBookingId(activeChatBookingId === booking.id ? null : booking.id)}
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors border border-zinc-700"
                    >
                      {activeChatBookingId === booking.id ? 'Close Chat' : 'Open Chat'}
                    </button>
                  </div>
                )}
              </div>
              
              {activeChatBookingId === booking.id && (
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <Chat bookingId={booking.id} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
