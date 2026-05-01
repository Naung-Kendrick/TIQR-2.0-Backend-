import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';

interface SuccessModalProps {
    isVisible: boolean;
}

export function SuccessModal({ isVisible }: SuccessModalProps) {
    const [phase, setPhase] = useState<'scanning' | 'verified'>('scanning');

    useEffect(() => {
        if (isVisible) {
            setPhase('scanning');
            const timer = setTimeout(() => {
                setPhase('verified');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans tracking-tight">
                    {/* Main Theme Light Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-50/80 backdrop-blur-xl"
                    >
                        {/* Subtle Authority Grid */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </motion.div>

                    <div className="relative z-10 w-full max-w-lg px-6">
                        <AnimatePresence mode="wait">
                            {phase === 'scanning' ? (
                                /* PHASE 1: SCANNING (Light Theme) */
                                <motion.div
                                    key="scanning"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="text-center"
                                >
                                    <div className="inline-flex items-center justify-center w-24 h-24 mb-8 relative">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                opacity: [0.3, 0.6, 0.3]
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute inset-0 bg-slate-900/5 rounded-[2rem] border-2 border-slate-900/10"
                                        />
                                        <Lock className="text-slate-900 relative z-10" size={32} strokeWidth={2.5} />

                                        {/* Professional Scanning Beam */}
                                        <motion.div
                                            animate={{ top: ['10%', '90%', '10%'] }}
                                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute left-4 right-4 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20"
                                        />
                                    </div>

                                    <motion.h3
                                        className="text-slate-900 font-black text-[10px] uppercase tracking-[0.4em] mb-4"
                                    >
                                        System Security Validation
                                    </motion.h3>

                                    <div className="w-48 h-1.5 bg-slate-200 mx-auto rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '0%' }}
                                            transition={{ duration: 1, ease: "easeInOut" }}
                                            className="w-full h-full bg-emerald-500"
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                /* PHASE 2: VERIFIED (Main Theme Alignment) */
                                <motion.div
                                    key="verified"
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        type: "spring",
                                        damping: 20,
                                        stiffness: 100
                                    }}
                                    className="flex flex-col items-center"
                                >
                                    {/* The Authority Badge Card */}
                                    <div className="w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-[2.5rem] shadow-2xl p-1 text-center overflow-hidden">
                                        <div className="bg-white rounded-[2.2rem] p-10">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                                                className="inline-flex bg-slate-900 p-5 rounded-[1.5rem] text-emerald-400 mb-8 border-2 border-emerald-500/30 shadow-xl shadow-slate-900/10"
                                            >
                                                <ShieldCheck size={48} strokeWidth={2.5} />
                                            </motion.div>

                                            <motion.h1
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-slate-900 text-3xl font-black uppercase tracking-tighter mb-2"
                                            >
                                                Access Granted
                                            </motion.h1>

                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.6 }}
                                                className="text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] mb-10"
                                            >
                                                Official Clearance Verified
                                            </motion.p>

                                            <div className="space-y-3 pt-6 border-t border-slate-100">
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    <span>Security Protocol</span>
                                                    <span className="text-slate-900">Active</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    <span>Encryption</span>
                                                    <span className="text-slate-900">System SSL</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Animated Progress Strip */}
                                        <div className="h-1.5 w-full bg-slate-50 relative">
                                            <motion.div
                                                className="absolute inset-0 bg-emerald-500"
                                                initial={{ scaleX: 0, originX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ duration: 1.5, ease: "linear", delay: 0.5 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Redirection Footer */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.6 }}
                                        transition={{ delay: 1 }}
                                        className="mt-8 flex items-center gap-3 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"
                                    >
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        Entering Dashboard Mainframe...
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
