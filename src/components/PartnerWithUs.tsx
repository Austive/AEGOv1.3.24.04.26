import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, loginWithGoogle } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Shield, CheckCircle2, Building2, FileBadge, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function PartnerWithUs() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'partner_applications'), {
        userId: user.uid,
        companyName,
        verificationId,
        responseTime: parseInt(responseTime),
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting application", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Shield className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Partner With Aego</h1>
          <p className="text-lg text-zinc-400">
            Join Durban's premier on-demand security network. Grow your business by connecting with clients who need immediate, reliable protection.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
          {!user ? (
            <div className="text-center py-8">
              <Building2 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Sign In to Apply</h2>
              <p className="text-zinc-400 mb-8">You need an Aego account to register your security company.</p>
              <button 
                onClick={loginWithGoogle}
                className="px-8 py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg transition-colors"
              >
                Sign In with Google
              </button>
            </div>
          ) : submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Application Received</h2>
              <p className="text-zinc-400">
                Thank you for applying to partner with Aego. Our team will review your PSIRA registration and company details. We will be in touch shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text" 
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-white transition-all"
                    placeholder="e.g. Durban Secure Ltd"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">PSIRA Registration Number (Verification ID)</label>
                <div className="relative">
                  <FileBadge className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text" 
                    required
                    value={verificationId}
                    onChange={(e) => setVerificationId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-white transition-all"
                    placeholder="Enter your PSIRA number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Average Response Time (Minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={responseTime}
                    onChange={(e) => setResponseTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-white transition-all"
                    placeholder="e.g. 5"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">This helps our AI recommend your services accurately.</p>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold rounded-lg transition-colors mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
