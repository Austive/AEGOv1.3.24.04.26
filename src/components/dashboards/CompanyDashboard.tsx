import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import Chat from '../Chat';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({ services: [], specializations: [], teamSize: 0, responseTime: 5 });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedPersonnel, setSelectedPersonnel] = useState<Record<string, string>>({});
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Fetch profile
    const fetchProfile = async () => {
      const profileDoc = await getDoc(doc(db, 'company_profiles', user.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data());
      } else {
        // ...
        await setDoc(doc(db, 'company_profiles', user.uid), {
          companyId: user.uid,
          services: ['General Security'],
          teamSize: 1,
          specializations: [],
          rating: 0,
          reviewCount: 0,
          responseTime: 5
        });
      }
    };
    fetchProfile();

    // Listen to pending bookings
    const qPending = query(collection(db, 'bookings'), where('status', '==', 'pending'));
    const unsubPending = onSnapshot(qPending, (snapshot) => {
      setPendingBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings (pending)');
    });

    // Listen to assigned bookings
    const qAssigned = query(collection(db, 'bookings'), where('assignedCompanyId', '==', user.uid));
    const unsubAssigned = onSnapshot(qAssigned, (snapshot) => {
      setMyBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings (assigned)');
    });

    // Listen to online personnel
    const qPersonnel = query(collection(db, 'users'), where('role', '==', 'personnel'));
    const unsubPersonnel = onSnapshot(qPersonnel, (snapshot) => {
      setPersonnel(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users (personnel)');
    });

    return () => {
      unsubPending();
      unsubAssigned();
      unsubPersonnel();
    };
  }, [user]);

  const deployPersonnel = async (bookingId: string) => {
    if (!user) return;
    const pId = selectedPersonnel[bookingId];
    if (!pId) return; // Must select someone

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'assigned', // It's assigned to the personnel now
        assignedPersonnelId: pId,
        updatedAt: serverTimestamp()
      });

      // Notify personnel
      await addDoc(collection(db, 'notifications'), {
        userId: pId,
        type: 'assignment',
        title: 'New Assignment',
        message: `Your company has assigned you to a new booking. Please review your dashboard.`,
        read: false,
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error deploying personnel", error);
    }
  };

  const acceptBooking = async (bookingId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'assigned', // Note: This just means assigned to the company, not yet personnel
        assignedCompanyId: user.uid,
        updatedAt: serverTimestamp()
      });

      const matchedBooking = pendingBookings.find(b => b.id === bookingId);
      
      // Notify Admin
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin',
        type: 'booking_accepted',
        title: 'Booking Accepted',
        message: `Company accepted a booking at ${matchedBooking?.location || 'Unknown location'}.`,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Notify Client
      if (matchedBooking?.clientId) {
        await addDoc(collection(db, 'notifications'), {
          userId: matchedBooking.clientId,
          type: 'booking_accepted',
          title: 'Provider Assigned',
          message: `A security provider has accepted your booking and will reach out shortly.`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

    } catch (error) {
      console.error("Error accepting booking", error);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating booking", error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'company_profiles', user.uid), {
        companyId: user.uid,
        services: profile.services,
        specializations: profile.specializations,
        teamSize: Number(profile.teamSize),
        responseTime: Number(profile.responseTime),
        rating: profile.rating || 0,
        reviewCount: profile.reviewCount || 0
      }, { merge: true });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error saving profile", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Company Dashboard</h1>
        <Link to={`/company/${user?.uid}`} className="text-zinc-300 hover:text-white text-sm font-medium">View Public Profile</Link>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Company Profile</h2>
              <button 
                onClick={() => isEditingProfile ? saveProfile() : setIsEditingProfile(true)}
                className="text-sm text-zinc-300 hover:text-white"
              >
                {isEditingProfile ? 'Save' : 'Edit'}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Services (comma separated)</label>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={profile.services?.join(', ')} 
                    onChange={(e) => setProfile({...profile, services: e.target.value.split(',').map((s: string) => s.trim())})}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                  />
                ) : (
                  <p className="text-sm">{profile.services?.join(', ') || 'None'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Specializations (comma separated)</label>
                {isEditingProfile ? (
                  <input 
                    type="text" 
                    value={profile.specializations?.join(', ')} 
                    onChange={(e) => setProfile({...profile, specializations: e.target.value.split(',').map((s: string) => s.trim())})}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                  />
                ) : (
                  <p className="text-sm">{profile.specializations?.join(', ') || 'None'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Team Size</label>
                {isEditingProfile ? (
                  <input 
                    type="number" 
                    value={profile.teamSize} 
                    onChange={(e) => setProfile({...profile, teamSize: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                  />
                ) : (
                  <p className="text-sm">{profile.teamSize} personnel</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Avg Response Time (mins)</label>
                {isEditingProfile ? (
                  <input 
                    type="number" 
                    value={profile.responseTime} 
                    onChange={(e) => setProfile({...profile, responseTime: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                  />
                ) : (
                  <p className="text-sm">{profile.responseTime} mins</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-zinc-300">Available Requests</h2>
              <span className="text-sm text-zinc-400">
                Filtered by response time criteria
              </span>
            </div>
            <div className="space-y-4">
              {pendingBookings.filter(booking => {
                if (!booking.createdAt) return false;
                const bookingTime = booking.createdAt.toMillis ? booking.createdAt.toMillis() : Date.now();
                const delayMs = Math.max(0, (profile.responseTime || 5) - 5) * 5000;
                return (currentTime - bookingTime) >= delayMs;
              }).length === 0 ? (
                <p className="text-zinc-500">No pending requests available.</p>
              ) : (
                pendingBookings.filter(booking => {
                  if (!booking.createdAt) return false;
                  const bookingTime = booking.createdAt.toMillis ? booking.createdAt.toMillis() : Date.now();
                  const delayMs = Math.max(0, (profile.responseTime || 5) - 5) * 5000;
                  return (currentTime - bookingTime) >= delayMs;
                }).map(booking => (
                  <div key={booking.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-3 py-1 bg-white/10 text-zinc-300 text-xs font-medium uppercase tracking-wider rounded-full border border-zinc-700">
                          {booking.serviceType}
                        </span>
                        <h3 className="text-lg font-semibold mt-2">{booking.location}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {booking.date} ({booking.duration} hrs)</span>
                    </div>
                    <button 
                      onClick={() => acceptBooking(booking.id)}
                      className="w-full py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg transition-colors"
                    >
                      Accept Request
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-blue-500">My Assignments</h2>
            <div className="space-y-4">
              {myBookings.length === 0 ? (
                <p className="text-zinc-500">No active assignments.</p>
              ) : (
                myBookings.map(booking => (
                  <div key={booking.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium uppercase tracking-wider rounded-full border border-blue-500/20">
                          {booking.serviceType}
                        </span>
                        <h3 className="text-lg font-semibold mt-2">{booking.location}</h3>
                      </div>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        booking.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        booking.status === 'deployed' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-white/10 text-zinc-300'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {booking.date} ({booking.duration} hrs)</span>
                    </div>
                    
                    {/* Action Buttons based on status */}
                    {booking.status === 'assigned' && !booking.assignedPersonnelId && (
                      <div className="space-y-2">
                        <select 
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-3 text-sm text-white"
                          value={selectedPersonnel[booking.id] || ''}
                          onChange={(e) => setSelectedPersonnel({...selectedPersonnel, [booking.id]: e.target.value})}
                        >
                          <option value="">Select Personnel (Online)</option>
                          {personnel.filter(p => p.isOnline).map(p => (
                            <option key={p.id} value={p.id}>{p.displayName || p.email} (Online)</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => deployPersonnel(booking.id)}
                          disabled={!selectedPersonnel[booking.id]}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                        >
                          Deploy Personnel
                        </button>
                      </div>
                    )}
                    {booking.status === 'assigned' && booking.assignedPersonnelId && (
                      <div className="py-2 px-3 bg-zinc-800 rounded-lg text-sm text-zinc-300">
                        Assigned to: {personnel.find(p => p.id === booking.assignedPersonnelId)?.displayName || 'Personnel'}
                      </div>
                    )}
                    {booking.status === 'deployed' && (
                      <button 
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                        className="w-full mt-2 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
                      >
                        Mark as Completed
                      </button>
                    )}

                    {['assigned', 'deployed'].includes(booking.status) && (
                      <button
                        onClick={() => setActiveChatBookingId(activeChatBookingId === booking.id ? null : booking.id)}
                        className="w-full mt-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors border border-zinc-700"
                      >
                        {activeChatBookingId === booking.id ? 'Close Chat' : 'Open Chat'}
                      </button>
                    )}

                    {activeChatBookingId === booking.id && (
                      <div className="mt-4 pt-4 border-t border-zinc-800">
                        <Chat bookingId={booking.id} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
