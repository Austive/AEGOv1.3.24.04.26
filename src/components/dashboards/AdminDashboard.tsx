import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!user || role !== 'admin') return;
    
    const unsubBookings = onSnapshot(query(collection(db, 'bookings')), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubApps = onSnapshot(query(collection(db, 'partner_applications')), (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'partner_applications');
    });

    return () => {
      unsubBookings();
      unsubUsers();
      unsubApps();
    };
  }, [user, role]);

  if (role !== 'admin') {
    return <Navigate to="/" />;
  }

  const assignPersonnel = async (bookingId: string, personnelId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        assignedPersonnelId: personnelId,
        status: 'assigned',
        updatedAt: serverTimestamp()
      });
      
      await addDoc(collection(db, 'notifications'), {
        userId: personnelId,
        type: 'assignment',
        title: 'New Assignment',
        message: `Admin has assigned you to a new booking (${bookingId.slice(0, 8)}).`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error assigning personnel", error);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
    } catch (error) {
      console.error("Error changing user role", error);
    }
  };

  const approveApplication = async (appId: string, userId: string) => {
    try {
      await updateDoc(doc(db, 'partner_applications', appId), { status: 'approved' });
      await updateDoc(doc(db, 'users', userId), { role: 'company' });
    } catch (error) {
      console.error("Error approving application", error);
    }
  };

  const declineApplication = async (appId: string) => {
    try {
      await updateDoc(doc(db, 'partner_applications', appId), { status: 'declined' });
    } catch (error) {
      console.error("Error declining application", error);
    }
  };

  const personnelUsers = users.filter(u => u.role === 'personnel');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                          (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredBookings = bookings.filter(b => bookingStatusFilter === 'all' || b.status === bookingStatusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Partner Applications</h2>
          {applications.length === 0 ? (
            <p className="text-zinc-500">No applications found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map(app => (
                <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-zinc-300">{app.companyName}</h3>
                      <p className="text-sm text-zinc-400">PSIRA: {app.verificationId}</p>
                      <p className="text-sm text-zinc-400">Response: {app.responseTime} mins</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${
                      app.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                      app.status === 'declined' ? 'bg-red-500/10 text-red-500' :
                      'bg-white/10 text-zinc-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex gap-2 text-sm mt-4">
                      <button 
                        onClick={() => approveApplication(app.id, app.userId)}
                        className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 font-medium rounded transition-colors"
                      >
                        Approve & Upgrade
                      </button>
                      <button 
                        onClick={() => declineApplication(app.id)}
                        className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-2xl font-semibold">All Bookings</h2>
            <select
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-300 min-w-[200px]"
            >
              <option value="all">All Statuses</option>
              <option value="matching">Matching</option>
              <option value="pending">Pending Payment</option>
              <option value="assigned">Assigned</option>
              <option value="deployed">Deployed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="p-3">ID</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Personnel</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="border-b border-zinc-800/50">
                    <td className="p-3 text-sm font-mono text-zinc-500">{booking.id.slice(0, 8)}...</td>
                    <td className="p-3 text-sm font-medium">{users.find(u => u.uid === booking.clientId)?.displayName || 'Unknown'}</td>
                    <td className="p-3">{booking.serviceType}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${booking.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-300'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{booking.assignedCompanyId ? users.find(u => u.uid === booking.assignedCompanyId)?.displayName || 'Unknown' : '-'}</td>
                    <td className="p-3 text-sm">
                      <div>
                        {booking.assignedPersonnelId ? users.find(u => u.uid === booking.assignedPersonnelId)?.displayName || 'Unknown' : '-'}
                      </div>
                      {booking.rejectedBy && booking.rejectedBy.length > 0 && (
                        <div className="text-xs text-red-500 mt-1">
                          Rejected by: {booking.rejectedBy.map((id: string) => users.find(u => u.uid === id)?.displayName || 'Unknown').join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {!['completed', 'cancelled'].includes(booking.status) && (
                        <select 
                          onChange={(e) => assignPersonnel(booking.id, e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none"
                          value={booking.assignedPersonnelId || ""}
                        >
                          <option value="" disabled>Assign Personnel</option>
                          {personnelUsers.map(p => (
                            <option key={p.uid} value={p.uid}>{p.displayName}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-2xl font-semibold">Users Directory</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-300 min-w-[200px]"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-300"
              >
                <option value="all">All Roles</option>
                <option value="client">Client</option>
                <option value="company">Company</option>
                <option value="personnel">Personnel</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.length === 0 ? (
              <p className="text-zinc-500">No users match your search.</p>
            ) : (
              filteredUsers.map(u => (
                <div key={u.uid} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{u.displayName}</h3>
                      <p className="text-sm text-zinc-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Role:</span>
                    <select
                      value={u.role}
                      onChange={(e) => changeUserRole(u.uid, e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm focus:outline-none"
                      disabled={u.uid === user?.uid}
                    >
                      <option value="client">Client</option>
                      <option value="company">Company</option>
                      <option value="personnel">Personnel</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
