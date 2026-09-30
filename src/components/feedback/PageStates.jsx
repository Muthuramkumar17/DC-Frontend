import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import {
  InboxOutlinedIcon,
  ErrorOutlineIcon,
  LockOutlinedIcon,
  ReplayIcon,
} from '@/theme/icons';

/**
 * LoadingSkeleton Component
 * Renders multiple rectangular skeleton placeholders while data is being loaded.
 * 
 * @param {Object} props
 * @param {number} [props.rows=5] - Number of skeleton rows to display
 */
export function LoadingSkeleton({ rows = 5 }) {
  return (
    <Stack spacing={1.5} sx={{ py: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );
}

/**
 * InlineSpinner Component
 * Centered spinner loader with custom text feedback.
 * 
 * @param {Object} props
 * @param {string} [props.label='Loading…'] - Text message next to spinner
 */
export function InlineSpinner({ label = 'Loading…' }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 6 }}>
      <CircularProgress size={22} thickness={4} sx={{ color: 'primary.main' }} />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Stack>
  );
}

/**
 * EmptyState Component
 * Displays a friendly empty state illustration when list data or query results are empty.
 * 
 * @param {Object} props
 * @param {string} props.title - Empty state title heading
 * @param {string} [props.description] - Additional explanatory text
 * @param {string} [props.actionLabel] - Primary action button text
 * @param {Function} [props.onAction] - Handler callback when action button is clicked
 * @param {React.ReactNode} [props.icon] - Custom icon override
 */
export function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 7,
        px: 3,
        border: '1px dashed #D4DFDC',
        borderRadius: 3,
        bgcolor: '#FAFCFC',
        my: 2,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: '#EAF3F1',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        {icon || <InboxOutlinedIcon sx={{ fontSize: 28, color: 'primary.main' }} />}
      </Box>
      <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 440, mx: 'auto' }}>
          {description}
        </Typography>
      )}
      {actionLabel && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

/**
 * ErrorState Component
 * Renders error alert block with a retry button for failed API queries.
 * 
 * @param {Object} props
 * @param {string} [props.message] - Detailed error message text
 * @param {Function} [props.onRetry] - Handler callback to retry failed operation
 */
export function ErrorState({ message, onRetry }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 7,
        px: 3,
        border: '1px solid #FADBD8',
        borderRadius: 3,
        bgcolor: '#FDF2E9',
        my: 2,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: '#FADBD8',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 28, color: 'error.main' }} />
      </Box>
      <Typography variant="h4" sx={{ mb: 0.5, color: 'error.dark' }}>
        Unable to load data
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 440, mx: 'auto' }}>
        {message || 'An unexpected error occurred while fetching information.'}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="error" startIcon={<ReplayIcon />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
}

/**
 * NoPermissionState Component
 * Rendered when a user tries to access an unauthorized section.
 */
export function NoPermissionState() {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
        border: '1px solid #E2E8E6',
        borderRadius: 3,
        bgcolor: '#FFFFFF',
        my: 2,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: '#F0F4F3',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Access Restricted
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
        You do not have the necessary security role permissions to view this resource.
      </Typography>
    </Box>
  );
}
