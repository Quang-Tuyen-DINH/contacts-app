'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { ToastContainer, toast, type ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type NotificationType =
  | "addContact"
  | "updateContact"
  | "copyEmail"
  | "removeContact"
  | "errorUnexpected";

export type NotifyArgs = { type: NotificationType; label: string };
type NotifyFn = (args: NotifyArgs) => void;

const notifProps: ToastOptions = {
  position: "bottom-right",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: "light",
};

export const NotificationsContext = createContext<NotifyFn>(() => {});

export function useNotify() {
  return useContext(NotificationsContext);
}

export default function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const notify = useMemo<NotifyFn>(
    () => ({ type, label }) => {
      switch (type) {
        case "addContact":
          toast.success(`${label} added!`, notifProps);
          break;
        case "updateContact":
          toast.success(`${label} updated!`, notifProps);
          break;
        case "copyEmail":
          toast.success(`${label} copied`, notifProps);
          break;
        case "removeContact":
          toast.success(`${label} removed from the list!`, notifProps);
          break;
        case "errorUnexpected":
          toast.error(label, notifProps);
          break;
        default:
          break;
      }
    },
    []
  );

  return (
    <NotificationsContext.Provider value={notify}>
      {children}
      <ToastContainer {...notifProps} />
    </NotificationsContext.Provider>
  );
}