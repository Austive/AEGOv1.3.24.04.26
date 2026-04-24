import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, LogIn, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGoogle, logout, db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';

export default function Navbar({ onBookClick }: { onBookClick?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    // Admins see notifications targeted to 'admin'
    const targetUserId = role === 'admin' ? 'admin' : user.uid;
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', targetUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      notifs.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setNotifications(notifs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => unsubscribe();
  }, [user, role]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-zinc-300" />
            <span className="text-2xl font-bold tracking-tighter">AEGO</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
            <Link to="/#services" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Services</Link>
            <Link to="/partner" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Partner With Us</Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative flex items-center p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-zinc-900"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                          <h3 className="font-semibold">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-white/10 text-zinc-300 px-2 py-1 rounded-full">{unreadCount} new</span>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-zinc-500 text-center">No notifications yet.</p>
                          ) : (
                            notifications.map(notif => (
                              <div 
                                key={notif.id} 
                                onClick={() => !notif.read && markAsRead(notif.id)}
                                className={`p-4 border-b border-zinc-800/50 cursor-pointer transition-colors ${notif.read ? 'bg-zinc-900/50' : 'bg-zinc-800/20 hover:bg-zinc-800/40'}`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className={`text-sm font-medium ${notif.read ? 'text-zinc-400' : 'text-white'}`}>{notif.title}</h4>
                                  {!notif.read && <span className="w-2 h-2 rounded-full bg-white mt-1.5 flex-shrink-0"></span>}
                                </div>
                                <p className={`text-xs ${notif.read ? 'text-zinc-500' : 'text-zinc-400'}`}>{notif.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  <UserIcon className="w-4 h-4" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                {role === 'client' && onBookClick && (
                  <button 
                    onClick={onBookClick}
                    className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-semibold rounded-full transition-all"
                  >
                    Request Security
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold rounded-full transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>

          <button className="md:hidden text-zinc-400" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-zinc-900 border-b border-zinc-800 px-4 py-6 space-y-4 shadow-xl"
        >
          <Link to="/#features" className="block text-zinc-400" onClick={() => setIsOpen(false)}>Features</Link>
          <Link to="/#services" className="block text-zinc-400" onClick={() => setIsOpen(false)}>Services</Link>
          <Link to="/partner" className="block text-zinc-400" onClick={() => setIsOpen(false)}>Partner With Us</Link>
          
          {user ? (
            <>
              <div className="py-2 border-y border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Notifications</h4>
                {notifications.slice(0, 3).map(notif => (
                  <div key={notif.id} className="py-2 flex items-start justify-between">
                    <p className={`text-sm ${notif.read ? 'text-zinc-500' : 'text-zinc-300'}`}>{notif.title}</p>
                    {!notif.read && (
                      <button onClick={() => markAsRead(notif.id)} className="text-xs text-zinc-300">Mark read</button>
                    )}
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-sm text-zinc-500">No notifications.</p>}
              </div>

              <Link to="/dashboard" className="block text-zinc-300" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <button 
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="block text-red-400 w-full text-left"
              >
                Logout
              </button>
              {role === 'client' && onBookClick && (
                <button 
                  onClick={() => { setIsOpen(false); onBookClick(); }}
                  className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg mt-4"
                >
                  Request Security
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={() => { setIsOpen(false); loginWithGoogle(); }}
              className="w-full px-6 py-3 bg-zinc-800 text-white font-semibold rounded-lg mt-4"
            >
              Sign In
            </button>
          )}
        </motion.div>
      )}
    </nav>
  );
}
