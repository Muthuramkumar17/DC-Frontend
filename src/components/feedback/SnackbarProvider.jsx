import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

/** Context instance storing notification toast trigger methods */
const SnackbarContext = createContext(null);

/**
 * Custom React hook giving components access to global success/error/warning toast notifications.
 * @returns {{ success: Function, error: Function, warning: Function, info: Function }}
 */
export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within AppSnackbarProvider');
  return ctx;
}

/**
 * AppSnackbarProvider Component
 * Global notification toast provider supporting queued notification messages.
 */
export default function AppSnackbarProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);
  const idRef = useRef(0);

  /** Appends notification item to dispatch queue */
  const notify = useCallback((message, severity = 'success') => {
    idRef.current += 1;
    setQueue((q) => [...q, { id: idRef.current, message, severity }]);
  }, []);

  const api = {
    success: (msg) => notify(msg, 'success'),
    error: (msg) => notify(msg, 'error'),
    warning: (msg) => notify(msg, 'warning'),
    info: (msg) => notify(msg, 'info'),
  };

  /** Processes next queued notification toast */
  const processNext = useCallback(() => {
    setQueue((q) => {
      if (q.length === 0) return q;
      const [next, ...rest] = q;
      setCurrent(next);
      setOpen(true);
      return rest;
    });
  }, []);

  if (!open && queue.length > 0) {
    processNext();
  }

  /** Closes active snackbar alert */
  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        TransitionProps={{ onExited: processNext }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={current?.severity || 'success'}
          variant="filled"
          sx={{
            minWidth: 300,
            borderRadius: 2,
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            fontWeight: 500,
          }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
