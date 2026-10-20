// src/hooks/useUnsavedChanges.js
"use client";
import { useEffect } from "react";

export const UNSAVED_MESSAGE =
  "Perubahan belum disimpan. Jika Anda meninggalkan halaman ini, data yang diisi akan hilang.";

/**
 * Menampilkan peringatan bawaan peramban selama `dirty` = true:
 *  1. Menutup tab / refresh / mengetik URL lain  -> dialog "beforeunload"
 *  2. Klik link internal (menu Navbar, logo, dsb.) -> window.confirm
 * Catatan: tombol "Back" peramban tidak tercakup.
 */
export function useUnsavedChanges(dirty, message = UNSAVED_MESSAGE) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // wajib agar Chrome menampilkan dialog
    };

    // Fase capture di document: berjalan sebelum handler Next <Link>
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      let url;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Sama persis dengan halaman sekarang (atau hanya hash): bukan berpindah halaman
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, message]);
}