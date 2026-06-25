"use client";

import { useRef, useEffect } from "react";
import { X, Mail, AlertTriangle } from "lucide-react";

// Define strict types for what the modal can display
export type ModalType = "about" | "privacy" | "terms" | "contact" | null;

interface SupportModalProps {
  isOpen: boolean;
  modalType: ModalType;
  onClose: () => void;
}

export default function SupportModal({ isOpen, modalType, onClose }: SupportModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);

  // Synchronize the native HTML5 dialog element with React's open state
  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    if (isOpen) {
      if (!modalElement.open) {
        modalElement.showModal();
      }
    } else {
      if (modalElement.open) {
        modalElement.close();
      }
    }
  }, [isOpen]);

  // If there's no active type selected, keep it hidden
  if (!modalType) return null;

  return (
    <dialog
      ref={modalRef}
      // Closes the modal if clicking outside the modal content box (on the backdrop overlay)
      onClick={(e) => e.target === modalRef.current && onClose()}
      onClose={onClose} // Handles the Native 'Escape' key close action natively
      className="fixed inset-0 m-auto rounded-[24px] border border-slate-200 bg-white p-8 max-w-lg w-full shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
    >
      <div className="flex flex-col gap-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 border-slate-100">
          <h3 className="text-xl font-bold text-[#111c24] capitalize">
            {modalType === "contact" ? "Contact & Appeals Support" : `${modalType} Policy`}
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Contents */}
        <div className="text-sm text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 space-y-4 font-medium">
          
          {/* Contact & Appeals Sub-view */}
          {modalType === "contact" && (
            <div className="space-y-4">
              <p>Need help with your account or have general platform feedback? Drop our support team a direct email anytime.</p>

              {/* Dedicated Banned Notice Frame */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-950">
                <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1 text-xs font-semibold">
                  <p className="font-bold text-sm text-red-900">Have you been banned by an Admin?</p>
                  <p className="text-red-800 font-medium">
                    If your account was suspended, please write to our priority administration inbox directly from your registered email address.
                  </p>
                </div>
              </div>

              {/* Inbox Details and Template */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Mail size={16} className="text-teal-700" />
                  <span>
                    Inbox:{" "}
                    <a href="mailto:admin@lostandfound.com" className="text-teal-700 underline hover:text-teal-900">
                      admin@lostandfound.com
                    </a>
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400 mb-1">
                    Recommended Appeal Template:
                  </p>
                  <pre className="text-[11px] bg-white border-[#E9D502] border-2 text-black p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono font-medium leading-normal select-all">
                    {`Subject: Account Ban Appeal - [Your Username]

Hello Back2U Admin,
My account has been suspended. I would like to request a review of my activity.

Registered Email: 
Explanation/Context: `}
                  </pre>
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    Click the box above to select and copy the text block template.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* About Sub-view */}
          {modalType === "about" && (
            <div className="space-y-3">
              <p><strong>Back2U</strong> is a digital neighborhood collective dedicated to simplifying lost and found reporting.</p>
              <p>We skip complex matching loops by placing data validation checks in the hands of the individuals who actually know the items best—the owners themselves.</p>
            </div>
          )}

          {/* Privacy Sub-view */}
          {modalType === "privacy" && (
            <div className="space-y-3">
              <p>Your privacy is fundamental to protecting items of value from fraudulent activity.</p>
              <p>We do not share exact identification responses, private locations, names, or item images outside the secure application portal. Your telemetry logs are strictly safe with us.</p>
            </div>
          )}

          {/* Terms Sub-view */}
          {modalType === "terms" && (
            <div className="space-y-3">
              <p>By posting listings on Back2U, you agree that your descriptions are honest, safe, and clean of explicit media.</p>
              <p>Admin moderators maintain zero-tolerance conditions for platform spam, duplicate scraping hooks, or fraudulent ownership claims. Violators will face immediate profile bans.</p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}