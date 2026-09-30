import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';

/**
 * Route resolvers mapping business entity types to their respective detail pages.
 */
const ROUTES = {
  Customer: (id) => `/customers/${id}`,
  Booking: (id) => `/bookings/${id}`,
  Subscription: (id) => `/subscriptions/${id}`,
  Visit: (id) => `/visits/${id}`,
};

/**
 * EntityLink Component
 * Renders business identifier codes (e.g., CUS-000102, BKG-202609-001) using monospace font.
 * Includes one-click clipboard copy functionality and clickable route navigation.
 *
 * @param {Object} props
 * @param {string} props.type - Entity type ("Customer" | "Booking" | "Subscription" | "Visit")
 * @param {string} props.id - Business identifier ID string
 * @param {string} [props.label] - Optional custom display text override
 */
export default function EntityLink({ type, id, label }) {
  const routeFn = ROUTES[type];
  if (!label) return null;

  const content = (
    <Box
      component="span"
      sx={{
        fontFamily: 'IBM Plex Mono, monospace',
        fontWeight: 600,
        fontSize: '0.825rem',
        lineHeight: 1.2,
        display: 'inline-flex',
        alignItems: 'center',
        color: 'primary.main',
        backgroundColor: '#EAF3F1',
        px: 0.85,
        py: 0.35,
        borderRadius: 1,
        transition: 'all 0.15s ease',
        '&:hover': routeFn
          ? {
              backgroundColor: 'primary.main',
              color: '#FFFFFF',
            }
          : {},
      }}
    >
      {label}
    </Box>
  );

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, verticalAlign: 'middle' }}>
      {routeFn ? (
        <Box component={RouterLink} to={routeFn(id)} sx={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          {content}
        </Box>
      ) : (
        content
      )}
    </Box>
  );
}
