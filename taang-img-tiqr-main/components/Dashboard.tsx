import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
    Upload,
    Trash2,
    Search,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    FileSpreadsheet,
    Download,
    Loader2,
    LogOut
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { QRCodeCard } from './QRCodeCard';
import { DataRow, StatusState } from '../types';

const DEFAULT_LOGO_URL = "/iLovePDF2-bg-removed.png";

export default function Dashboard() {
    const userRole = localStorage.getItem('auth_role') || 'admin';
    const isStationed = userRole !== 'admin';

    const [data, setData] = useState<DataRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [selectedQRColumns, setSelectedQRColumns] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [logo, setLogo] = useState(DEFAULT_LOGO_URL);
    const [status, setStatus] = useState<StatusState>({ message: '', type: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    const navigate = useNavigate();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_login_time');
        navigate('/');
    };

    const showStatus = useCallback((message: string, type: 'success' | 'error') => {
        setStatus({ message, type });
        setTimeout(() => setStatus({ message: '', type: '' }), 3000);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            if (rawRows.length > 0) {
                const headersFound = rawRows[0]
                    .map(h => String(h || '').trim())
                    .filter(Boolean);

                const rows: DataRow[] = rawRows.slice(1).map((row, index) => {
                    const obj: DataRow = { id: index };
                    headersFound.forEach((h, i) => {
                        const val = row[i];
                        obj[h] = val !== undefined && val !== null ? String(val).trim() : '';
                    });
                    return obj;
                });

                setHeaders(headersFound);
                // Simulate processing for Skeleton Loader demonstration
                setTimeout(() => {
                    setData(rows);
                    setSelectedColumns(headersFound);
                    setSelectedQRColumns(headersFound);
                    setIsProcessing(false);
                    showStatus('Identity records connected. Database Active.', 'success');
                }, 1500);
            } else {
                showStatus('File contains no readable data.', 'error');
                setIsProcessing(false);
            }
        } catch (err) {
            showStatus('Failed to parse file.', 'error');
            setIsProcessing(false);
        }
    };

    const clearData = () => {
        setData([]);
        setHeaders([]);
        setSelectedColumns([]);
        setSelectedQRColumns([]);
        setSearchTerm('');
        setResetKey(prev => prev + 1);
        showStatus('System reset successfully.', 'success');
    };

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const s = searchTerm.toLowerCase();
        const headersToCheck = headers.length > 0 ? headers : Object.keys(data[0] || {});
        return data.filter(row =>
            headersToCheck.some(key => String(row[key] || '').toLowerCase().includes(s))
        );
    }, [data, searchTerm, headers]);

    const handleBulkDownload = () => {
        showStatus('Bulk download initialized...', 'success');
        if (filteredData.length > 50) {
            alert("Batch size too large for browser download. Please install JSZip for archive support.");
            return;
        }

        filteredData.forEach((row, i) => {
            setTimeout(() => {
                // This relies on the child component to handle individual downloads via ref or context
                // For this stateless implementation, we'd typically need a more robust solution involving a hidden downloader
                // or lifting state up.
                console.log(`Downloading ${row.id}`);
            }, i * 200);
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
            <input
                key={resetKey}
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".xlsx,.xls,.csv"
            />

            <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-12">
                {/* Header - Authoritative Look */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-xl shadow-slate-900/10">
                            <img src={logo} className="w-10 h-10 object-contain" alt="Logo" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
                                တီုင်စေတ်မေန်းတိုအီး  <span className="text-slate-500">[TIQR SYSTEM]</span>
                                <span className="ml-2 px-1.5 py-0.5 bg-slate-900/5 text-slate-400 text-[8px] font-black rounded border border-slate-200 uppercase tracking-tighter">V 1.0.0</span>
                            </h1>
                            <p className="text-slate-500 text-xs font-bold flex items-center gap-2 mt-1 uppercase tracking-wider">
                                <ShieldCheck size={12} className="text-emerald-600" /> powered By San Hlu & Nay Lin (TITS TEAM)
                            </p>
                        </div>
                    </div>

                    <div className="min-h-[40px] flex items-center gap-3">
                        {isStationed && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                                    {userRole} TEAM
                                </span>
                            </div>
                        )}
                        {status.message && (
                            <div className={`px-4 py-2.5 rounded-lg flex items-center gap-2 border text-[11px] font-bold uppercase tracking-wider shadow-sm animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}>
                                {status.type === 'success' ? <CheckCircle2 size={14} className="text-emerald-700" /> : <AlertCircle size={14} className="text-rose-700" />}
                                <span>{status.message}</span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="ml-4 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95 uppercase tracking-widest"
                        >
                            <LogOut size={14} /> LOGOUT
                        </button>
                    </div>
                </header>

                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-700">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full max-w-xl bg-white border-2 border-slate-200 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 group shadow-sm hover:shadow-lg active:scale-95"
                        >
                            <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm border border-slate-200">
                                {isProcessing ? <Loader2 size={32} className="animate-spin text-slate-600" /> : <Upload size={32} />}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Import Identity Database</h2>
                            <p className="text-slate-500 text-xs font-medium mb-8 text-center max-w-xs uppercase tracking-wide">ဘိူန်းဟံပ်လိူည် Excel (.xlsx) ကာည်း CSV (.csv)</p>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                                    <FileSpreadsheet size={14} className="text-slate-800" /> .XLSX Excel
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                                    <FileSpreadsheet size={14} className="text-slate-800" /> .CSV Data
                                </div>
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-8 h-fit">
                            <Sidebar
                                headers={headers}
                                selectedColumns={selectedColumns}
                                setSelectedColumns={setSelectedColumns}
                                selectedQRColumns={selectedQRColumns}
                                setSelectedQRColumns={setSelectedQRColumns}
                                logo={logo}
                                setLogo={setLogo}
                                onClear={clearData}
                                defaultLogo={DEFAULT_LOGO_URL}
                            />
                        </aside>

                        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
                            {/* Toolbar */}
                            <div className="bg-white/90 border border-slate-200 p-3 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3 sticky top-4 z-30 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH RECORDS (ဒီတီပ်ဟြီုက်)"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white rounded-xl outline-none text-slate-900 text-xs font-unicodes uppercase tracking-wider transition-all placeholder:text-slate-400"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={handleBulkDownload}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 whitespace-nowrap uppercase tracking-widest"
                                    >
                                        <Download size={14} /> EXPORT ALL(coming sooner)
                                    </button>
                                    <button
                                        onClick={clearData}
                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
                                        title="Reset System"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Grid Content with Skeleton Loading */}
                            {isProcessing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden h-[300px]">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse"></div>
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                                                    <div className="h-5 bg-slate-100 rounded w-2/3 animate-pulse"></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-center mb-6">
                                                <div className="w-32 h-32 bg-slate-100 rounded-xl animate-pulse"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 bg-slate-100 rounded w-full animate-pulse"></div>
                                                <div className="h-3 bg-slate-100 rounded w-4/5 animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                                    {filteredData.map((row) => (
                                        <QRCodeCard
                                            key={row.id}
                                            row={row}
                                            selectedColumns={selectedColumns}
                                            selectedQRColumns={selectedQRColumns}
                                            logo={logo}
                                        />
                                    ))}
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>
        </div>
    );
}
