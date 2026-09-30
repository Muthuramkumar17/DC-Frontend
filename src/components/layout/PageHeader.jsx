import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { NavigateNextIcon, HomeOutlinedIcon } from '@/theme/icons';
import { Link as RouterLink } from 'react-router-dom';

/**
 * PageHeader Component
 * Standardized header for all screens — includes breadcrumb trail (with home icon),
 * page title with optional status chip, and right-aligned action buttons.
 *
 * @param {string}  props.title       - Main page title
 * @param {string}  [props.subtitle]  - Optional subtitle text below title
 * @param {Array<{label:string, to?:string, path?:string}>} [props.breadcrumbs]
 * @param {ReactNode} [props.statusSlot] - Status chip next to title
 * @param {ReactNode} [props.actions]    - Action buttons on the right
 * @param {boolean} [props.isMonoTitle]  - Render title in monospace (for IDs like BKG_02)
 */
export default function PageHeader({ title, subtitle, breadcrumbs, statusSlot, actions, isMonoTitle }) {
  const hasBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;

  return (
    <Box sx={{ mb: 3 }} className="page-fade-in">

      {/* ── Breadcrumb trail ─────────────────────────────────────── */}
      {hasBreadcrumbs && (
        <Breadcrumbs
          separator={
            <NavigateNextIcon sx={{ fontSize: '0.75rem', color: 'text.disabled' }} />
          }
          sx={{ mb: 1 }}
          aria-label="breadcrumb"
        >
          {/* Home icon always first */}
          <Box
            component={RouterLink}
            to="/dashboard"
            aria-label="Home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <HomeOutlinedIcon sx={{ fontSize: '0.9rem' }} />
          </Box>

          {breadcrumbs.map((b, i) => {
            const href = b.to || b.path;
            return href ? (
              <Box
                key={i}
                component={RouterLink}
                to={href}
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  transition: 'color 0.15s ease',
                  '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                }}
              >
                {b.label}
              </Box>
            ) : (
              <Typography
                key={i}
                sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.78rem', lineHeight: 1.2 }}
              >
                {b.label}
              </Typography>
            );
          })}
        </Breadcrumbs>
      )}

      {/* ── Title row + action buttons ────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        sx={{
          pb: hasBreadcrumbs ? 1.75 : 0,
          borderBottom: hasBreadcrumbs ? '1px solid' : 'none',
          borderColor: 'divider',
          mb: hasBreadcrumbs ? 2.5 : 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '1.4rem', sm: '1.7rem' },
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: isMonoTitle ? '0.02em' : 'normal',
              fontFamily: isMonoTitle
                ? '"JetBrains Mono", "Fira Code", "Courier New", monospace'
                : 'inherit',
            }}
          >
            {title}
          </Typography>
          {statusSlot}
        </Stack>

        {actions && (
          <Stack
            direction="row"
            spacing={1.25}
            flexWrap="wrap"
            justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
          >
            {actions}
          </Stack>
        )}
      </Stack>

      {/* ── Subtitle ─────────────────────────────────────────────── */}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 800 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
