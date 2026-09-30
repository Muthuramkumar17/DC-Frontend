import Box from '@mui/material/Box';
import { formatMoney } from '@/utils/format';

/**
 * Money Component
 * Formats currency values cleanly using Indian Rupee format with IBM Plex Mono font for high readability.
 * 
 * @param {Object} props
 * @param {number} props.value - Numeric amount to format (e.g. 2499)
 * @param {boolean} [props.strong=false] - If true, displays bold font weight
 * @param {string} [props.color] - Optional text color override
 */
export default function Money({ value, strong = false, color }) {
  return (
    <Box
      component="span"
      sx={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontWeight: strong ? 700 : 500,
        fontVariantNumeric: 'tabular-nums',
        color: color || 'inherit',
      }}
    >
      {formatMoney(value)}
    </Box>
  );
}
