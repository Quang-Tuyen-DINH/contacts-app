"use client";
import NotificationsProvider from '@/providers/Notification.provider';
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { SWRConfig } from "swr";

class HttpError extends Error {
  status: number;
  info?: unknown;
  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.status = status;
    this.info = info
  }
}

const theme = createTheme({ palette: { mode: "dark"} });

const fetcher = async (url: string) => {
  try {
    const res = await fetch(url);
    const isJSON = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJSON ? await res.json() : await res.text();

    if (!res.ok) {
      throw new HttpError(`HTTP ${res.status}`, res.status, data);
    }
    return data;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError("Network error", 0, { cause: err })
  }
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationsProvider>
        <SWRConfig value={{ fetcher, refreshInterval: 15000, revalidateOnFocus: true }}>
          {children}
        </SWRConfig>
      </NotificationsProvider>
    </ThemeProvider>
  )
}

export default Providers;