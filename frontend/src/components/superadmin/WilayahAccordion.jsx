"use client";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import PospamAccordionItem from "./PospamAccordionItem";

export default function WilayahAccordion({ wilayahList }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="flex flex-col gap-3">
      {wilayahList.map((w, i) => {
        const open = openId === w.id;
        return (
          <div
            key={w.id}
            className="rounded-lg border border-gray-100 bg-[#F8F8FA] px-6 py-4 transition-shadow hover:shadow-sm"
          >
            <button
              onClick={() => setOpenId(open ? null : w.id)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-base font-semibold uppercase tracking-wide text-gray-900">
                {i + 1}. {w.nama}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{w.pospam.length} Pospam</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 text-gray-700 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white">
                  <ChevronLeft
                    size={16}
                    className={`transition-transform ${open ? "-rotate-90" : ""}`}
                  />
                </span>
              </span>
            </button>
            {open && (
              <div className="mt-3 border-t border-gray-200 pt-1">
                {w.pospam.map((p) => <PospamAccordionItem key={p.id} nama={p.nama} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}