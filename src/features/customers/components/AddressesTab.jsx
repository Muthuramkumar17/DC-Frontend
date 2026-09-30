import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import AddressCard from './AddressCard';
import { EmptyState } from '@/components/feedback/PageStates';
import Paper from '@mui/material/Paper';

export default function AddressesTab({ addresses, onAddAddress, onCreateBooking }) {
  return (
    <Stack spacing={2}>
      {addresses.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState title="No addresses yet" description="Add a service address for this customer." actionLabel="Add Address" onAction={onAddAddress} />
        </Paper>
      ) : (
        <Grid container spacing={2} justifyContent={addresses.length === 1 ? 'center' : 'flex-start'}>
          {addresses.map((address) => (
            <Grid item xs={12} md={6} key={address.id}>
              <AddressCard address={address} onCreateBooking={onCreateBooking} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
