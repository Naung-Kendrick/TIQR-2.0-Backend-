import React, { useRef } from 'react';
import {
    Settings2,
    RefreshCw,
    QrCode,
    Eye,
    EyeOff,
    Database
} from 'lucide-react';

interface SidebarProps {
    headers: string[];
    selectedColumns: string[];
    setSelectedColumns: React.Dispatch<React.SetStateAction<string[]>>;
    selectedQRColumns: string[];
    setSelectedQRColumns: React.Dispatch<React.SetStateAction<string[]>>;
    logo: string;
    setLogo: (url: string) => void;
    onClear: () => void;
    defaultLogo: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    headers,
    selectedColumns,
    setSelectedColumns,
    selectedQRColumns,
    setSelectedQRColumns,
    logo,
    setLogo,
    defaultLogo
}) => {
    const logoInputRef = useRef<HTMLInputElement>(null);

    const toggleDisplay = (header: string) => {
        setSelectedColumns(prev =>
            prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]
        );
    };

    const toggleQR = (header: string) => {
        setSelectedQRColumns(prev =>
            prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]
        );
    };

    const bulkAction = (type: 'display' | 'qr', action: 'all' | 'none') => {
        const setter = type === 'display' ? setSelectedColumns : setSelectedQRColumns;
        setter(action === 'all' ? [...headers] : []);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => setLogo(evt.target?.result as string);
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            {/* Branding Section - Clean & Professional */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <RefreshCw size={10} /> Organization Identity
                </label>

                <div className="flex items-start gap-4">
                    <div
                        className="relative w-20 h-20 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 transition-colors cursor-pointer group hover:border-slate-300"
                        onClick={() => logoInputRef.current?.click()}
                    >
                        <img src={logo} alt="Seal" className="max-w-full max-h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold uppercase tracking-wider">Change</span>
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <button
                            onClick={() => logoInputRef.current?.click()}
                            className="w-full py-2.5 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-wider shadow-sm"
                        >
                            Upload The Logo
                        </button>
                        <button
                            onClick={() => setLogo(defaultLogo)}
                            className="w-full py-2.5 px-3 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition-all border border-slate-200 text-[10px] font-bold uppercase tracking-wider"
                        >
                            Reset Default
                        </button>
                    </div>
                </div>
                <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
            </div>

            {/* Field Configuration - Structured Table View */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-320px)]">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={12} className="text-slate-500" /> Field Configuration
                    </h3>
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200">
                        {headers.length} COLUMNS
                    </span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-slate-200 bg-slate-100/50 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="col-span-6 pl-2">Field Name</div>
                    <div className="col-span-3 text-center cursor-pointer hover:text-slate-800 transition-colors" onClick={() => bulkAction('display', 'all')}>
                        Show
                    </div>
                    <div className="col-span-3 text-center cursor-pointer hover:text-slate-800 transition-colors" onClick={() => bulkAction('qr', 'all')}>
                        Encode
                    </div>
                </div>

                {/* Scrollable Table Body */}
                <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
                    {headers.length > 0 ? headers.map((header) => {
                        const isShown = selectedColumns.includes(header);
                        const isInQR = selectedQRColumns.includes(header);

                        return (
                            <div key={header} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-slate-50 transition-colors group">
                                <div className="col-span-6 pl-2 flex items-center gap-2">
                                    <Database size={10} className="text-slate-300" />
                                    <span className={`text-[10px] font-bold truncate block tracking-tight ${isShown ? 'text-slate-700' : 'text-slate-400'}`} title={header}>
                                        {header}
                                    </span>
                                </div>

                                {/* Visual Toggle: Display */}
                                <div className="col-span-3 flex justify-center">
                                    <button
                                        onClick={() => toggleDisplay(header)}
                                        className={`w-8 h-6 rounded flex items-center justify-center transition-all ${isShown ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                                    >
                                        {isShown ? <Eye size={12} /> : <EyeOff size={12} />}
                                    </button>
                                </div>

                                {/* Visual Toggle: QR */}
                                <div className="col-span-3 flex justify-center">
                                    <button
                                        onClick={() => toggleQR(header)}
                                        className={`w-8 h-6 rounded flex items-center justify-center transition-all ${isInQR ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                                    >
                                        <QrCode size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                            <Database size={24} className="text-slate-200 mb-3" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Database Loaded</p>
                            <p className="text-[10px] text-slate-400 mt-1">Import a file to configure fields</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-3 border-t border-slate-200 bg-slate-50/50">
                    <div className="flex gap-2">
                        <button onClick={() => { bulkAction('display', 'all'); bulkAction('qr', 'all') }} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all tracking-wider shadow-sm">
                            Select All
                        </button>
                        <button onClick={() => { bulkAction('display', 'none'); bulkAction('qr', 'none') }} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all tracking-wider shadow-sm">
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
