import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { EventNoteOutlinedIcon, PlaceOutlinedIcon } from '@/theme/icons';
import EntityLink from '@/components/ui/EntityLink';

export default function AddressCard({ address, onCreateBooking, onViewRelated }) {
  const areaName = address.area || '';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 2.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 4px 14px rgba(15, 92, 87, 0.08)',
        },
      }}
    >
      {/* Header Row: Label, Badges & Address Code */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <PlaceOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {address.label}
          </Typography>
          {address.isDefault && <Chip size="small" label="Default" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />}
          {address.status === 'Inactive' && <Chip size="small" label="Inactive" sx={{ height: 20, fontSize: '0.7rem' }} />}
        </Stack>
        <EntityLink type="Address" id={address.addressNumber} />
      </Stack>

      {/* Street Address Details */}
      <Typography variant="body2" color="text.primary" sx={{ mt: 1.25, fontWeight: 500 }}>
        {[address.doorNo, address.block, address.community, address.addressLine].filter(Boolean).join(', ')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {areaName ? `${areaName}, ` : ''}{address.city} {address.pincode}
      </Typography>
      {address.landmark && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
          Landmark: {address.landmark}
        </Typography>
      )}

      {/* Bottom Actions */}
      {(onCreateBooking || onViewRelated) && (
        <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
          {onCreateBooking && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<EventNoteOutlinedIcon fontSize="small" />}
              onClick={() => onCreateBooking(address)}
            >
              Create Booking
            </Button>
          )}
          {onViewRelated && (
          <Button size="small" color="inherit" onClick={() => onViewRelated(address)}>
            View Related
          </Button>
          )}
        </Stack>
      )}
    </Paper>
  );
}
