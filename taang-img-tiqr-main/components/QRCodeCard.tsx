import React, { useRef, useState } from 'react';
import { Download, ShieldCheck, Copy, Check } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { DataRow } from '../types';

interface QRCodeCardProps {
    row: DataRow;
    selectedColumns: string[];
    selectedQRColumns: string[];
    logo: string;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ row, selectedColumns, selectedQRColumns, logo }) => {
    const qrRef = useRef<HTMLDivElement>(null);
    const [isCopied, setIsCopied] = useState(false);

    // Construct QR Data
    const qrValue = selectedQRColumns
        .map(col => `${col}:${row[col]}`)
        .join('|');

    // Identify Fields
    const titleField = selectedColumns[0] || 'Identity Record';
    const displayFields = selectedColumns.slice(1, 6); // Cap at 5 fields

    const downloadQR = () => {
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `ID-${String(row[titleField]).replace(/\s+/g, '-') || row.id}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(qrValue);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden h-full">
            {/* Authenticity Watermark - Guilloche Style */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url(${logo})`,
                    backgroundPosition: '120% -20%',
                    backgroundSize: '70%',
                    backgroundRepeat: 'no-repeat',
                    filter: 'grayscale(100%)'
                }}
            />

            {/* Card Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-sm">
                        <img src={logo} className="w-full h-full object-contain filter grayscale opacity-80 group-hover:filter-none group-hover:opacity-100 transition-all" alt="seal" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Official Document</span>
                        <h4 className="text-lg font-bold text-slate-900 truncate leading-none">
                            {row[titleField] || "IDENTITY"}
                        </h4>
                    </div>
                </div>
                {/* Success Indicator */}
                {qrValue && (
                    <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck size={10} /> Verified
                    </div>
                )}
            </div>

            {/* QR Section */}
            <div className="p-8 flex flex-col items-center justify-center relative flex-1 min-h-[200px]">
                <div ref={qrRef} className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm relative z-10 group-hover:border-slate-300 transition-colors">
                    <QRCodeCanvas
                        value={qrValue || "NO_DATA"}
                        size={140}
                        level="M"
                        includeMargin={true}
                        imageSettings={{
                            src: logo,
                            height: 32,
                            width: 32,
                            excavate: true,
                        }}
                        fgColor="#0f172a" // Slate 900
                    />
                </div>
                <p className="mt-4 text-[10px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Securely Encoded
                </p>
            </div>

            {/* Data Fields */}
            <div className="px-5 pb-5 mt-auto relative z-10">
                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {displayFields.length > 0 ? displayFields.map(col => (
                        <div key={col} className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{col}</span>
                            <span className="text-sm text-slate-700 font-semibold truncate border-b border-slate-200 pb-1">
                                {row[col] || '—'}
                            </span>
                        </div>
                    )) : (
                        <div className="py-2 text-center">
                            <p className="text-[10px] text-slate-400 italic">No fields selected for display</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={downloadQR}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-[11px] font-bold shadow-sm active:scale-95 uppercase tracking-wider"
                    >
                        <Download size={14} /> Download
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`px-3 py-2.5 rounded-lg transition-all border ${isCopied
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
                            }`}
                        title="Copy Data"
                    >
                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
