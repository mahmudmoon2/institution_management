import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import api from '../../api/axios';

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const res = await api.get(`/payments/${id}/`);
        setPayment(res.data);
      } catch (error) {
        console.error("Failed to fetch receipt details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-10 text-center text-brand-deepPlum font-bold">Loading Receipt...</div>;
  if (!payment) return <div className="p-10 text-center text-red-500 font-bold">Receipt not found!</div>;

  // রিসিটের একটি সিঙ্গেল কপি ডিজাইন (এটি আমরা দুবার কল করব)
  const ReceiptCopy = ({ copyType }) => (
    <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-brand-deepPlum pb-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-royalPurple rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-brand-tealCyan">
            DIA
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-deepPlum uppercase tracking-wider">Ideal Academy</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">{copyType}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-brand-tealCyan">{payment.receipt_number}</h2>
          <p className="text-sm text-gray-500 font-medium">Date: {new Date(payment.created_at).toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex justify-between gap-6 mb-8">
        <div className="flex-1 space-y-2 text-sm">
          <p><span className="font-bold text-gray-500 w-24 inline-block">Student ID:</span> <span className="font-bold text-brand-deepPlum">{payment.student_id_str}</span></p>
          <p><span className="font-bold text-gray-500 w-24 inline-block">Name:</span> <span className="font-bold text-brand-deepPlum">{payment.student_name}</span></p>
          <p><span className="font-bold text-gray-500 w-24 inline-block">Fee Type:</span> <span className="font-bold text-brand-deepPlum">{payment.fee_category_name}</span></p>
          <p><span className="font-bold text-gray-500 w-24 inline-block">Month/Year:</span> <span className="font-bold text-brand-deepPlum">{payment.month}, {payment.year}</span></p>
          <p><span className="font-bold text-gray-500 w-24 inline-block">Method:</span> <span className="font-bold text-brand-deepPlum uppercase">{payment.method}</span></p>
        </div>
        
        {/* QR Code for Verification */}
        <div className="flex flex-col items-center justify-center border-l-2 border-gray-100 pl-6">
          <QRCode value={`TXN:${payment.transaction_id}`} size={80} level="L" />
          <p className="text-[9px] text-gray-400 mt-2 font-mono">{payment.transaction_id}</p>
        </div>
      </div>

      {/* Amount & Signatures */}
      <div className="flex justify-between items-end bg-[#F5F0FF] p-4 rounded-xl border border-brand-softLavender/30">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-brand-royalPurple">৳ {payment.amount_paid}</p>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 w-32 mb-1"></div>
          <p className="text-xs font-semibold text-gray-500">Authorized Signature</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Top Actions (Will be hidden on print) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-brand-deepPlum font-semibold px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          ← Back
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
            <span>🖨️</span> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Receipt Area */}
      {/* print:block ensures this is what the printer sees, hidden elements vanish */}
      <div className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
        
        {/* Top: Student Copy */}
        <ReceiptCopy copyType="Student Copy" />

        {/* Cut Line */}
        <div className="flex items-center gap-4 text-gray-400 print:opacity-50">
          <span className="text-xl">✂️</span>
          <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
          <span className="text-xs font-bold tracking-widest uppercase">Tear Here</span>
        </div>

        {/* Bottom: Office Copy */}
        <ReceiptCopy copyType="Office Copy" />

      </div>
    </div>
  );
}