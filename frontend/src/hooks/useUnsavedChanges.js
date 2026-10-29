"use client";
import { useEffect } from "react";

export const UNSAVED_MESSAGE =
  "Perubahan belum disimpan. Jika Anda meninggalkan halaman ini, data yang diisi akan hilang.";

export function useUnsavedChanges(dirty, message = UNSAVED_MESSAGE) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; 
    };

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