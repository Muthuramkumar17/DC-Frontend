import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { useTheme, alpha } from '@mui/material/styles';

/**
 * StatusChip Component
 * Render status badges with theme-derived colors and an indicator dot.
 * Automatically adapts when palette colors change in theme/palette.js.
 */
export default function StatusChip({ status, size = 'small' }) {
  const theme = useTheme();

  const getStatusStyle = (st) => {
    switch (st) {
      case 'Active':
      case 'Confirmed':
      case 'Completed':
      case 'Recorded':
      case 'On Track':
        return {
          dotColor: theme.palette.success?.main || '#1F8A55',
          bg: theme.palette.success?.light || alpha(theme.palette.success?.main || '#1F8A55', 0.12),
        };
      case 'Draft':
      case 'Rescheduled':
      case 'Renewal Due Soon':
        return {
          dotColor: theme.palette.warning?.main || '#D98E04',
          bg: theme.palette.warning?.light || alpha(theme.palette.warning?.main || '#D98E04', 0.12),
        };
      case 'Cancelled':
      case 'Reversed':
      case 'Renewal Overdue':
        return {
          dotColor: theme.palette.error?.main || '#D32F2F',
          bg: theme.palette.error?.light || alpha(theme.palette.error?.main || '#D32F2F', 0.12),
        };
      case 'Scheduled':
        return {
          dotColor: theme.palette.info?.main || theme.palette.primary?.main || '#0288D1',
          bg: theme.palette.info?.light || alpha(theme.palette.info?.main || '#0288D1', 0.12),
        };
      case 'Inactive':
      case 'Expired':
      case 'No Period':
      default:
        return {
          dotColor: theme.palette.text.secondary || '#70807D',
          bg: alpha(theme.palette.text.secondary || '#70807D', 0.1),
        };
    }
  };

  const style = getStatusStyle(status);

  return (
    <Chip
      size={size}
      label={status || 'Unknown'}
      icon={
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: style.dotColor,
            ml: 1,
            mr: -0.5,
          }}
        />
      }
      sx={{
        backgroundColor: style.bg,
        color: style.dotColor,
        fontWeight: 600,
        fontSize: '0.75rem',
        border: '1px solid',
        borderColor: alpha(style.dotColor, 0.25),
        height: size === 'small' ? 24 : 28,
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
}
