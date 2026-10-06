"use client";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import PospamAccordionItem from "./PospamAccordionItem";

export default function WilayahAccordion({ wilayahList }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      {wilayahList.map((w, i) => {
        const open = openId === w.id;
        return (
          <div key={w.id} className="rounded-lg bg-[#F8F8FA] px-8 py-6">
            <button
              onClick={() => setOpenId(open ? null : w.id)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-2xl font-bold uppercase text-gray-900">
                {i + 1}. {w.nama}
              </span>
              <span className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{w.pospam.length} Pospam</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-gray-900 text-gray-900 transition-colors hover:bg-gray-900 hover:text-white">
                  <ChevronLeft
                    size={22}
                    className={`transition-transform ${open ? "-rotate-90" : ""}`}
                  />
                </span>
              </span>
            </button>
            {open && (
              <div className="mt-4 border-t border-gray-200 pt-2">
                {w.pospam.map((p) => <PospamAccordionItem key={p.id} nama={p.nama} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}