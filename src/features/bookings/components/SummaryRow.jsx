import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Money from '@/components/ui/Money';

export function Row({ label, value, strong }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Money value={value} strong={strong} />
    </Stack>
  );
}

export default Row;
