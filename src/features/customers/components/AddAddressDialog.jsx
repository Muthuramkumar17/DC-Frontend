import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
} from '@mui/material';

import { useAddAddress } from '../hooks/useCustomers';
import { useSnackbar } from '@/components/feedback/SnackbarProvider';

const schema = z.object({
  addressLabel: z.string().min(1, 'Required'),
  doorNo: z.string().optional().or(z.literal('')),
  block: z.string().optional().or(z.literal('')),
  community: z.string().optional().or(z.literal('')),
  addressLine: z.string().min(3, 'Required'),
  area: z.string().min(1, 'Select a service area'),
  city: z.string().optional().or(z.literal('')),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode').optional().or(z.literal('')),
  landmark: z.string().optional().or(z.literal('')),
  isDefault: z.boolean().default(false),
});

export default function AddAddressDialog({ open, onClose, customerNumber }) {
  const snackbar = useSnackbar();
  const addAddressMutation = useAddAddress(customerNumber);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      addressLabel: '',
      doorNo: '',
      block: '',
      community: '',
      addressLine: '',
      area: '',
      city: '',
      pincode: '',
      landmark: '',
      isDefault: false,
    },
  });

  const handleSave = (values) => {
    addAddressMutation.mutate(values, {
      onSuccess: () => {
        snackbar.success('Address added successfully.');
        reset();
        onClose();
      },
      onError: (err) => snackbar.error(err.message || 'Could not add address.'),
    });
  };

  return (
    <Dialog open={open} onClose={addAddressMutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Service Address</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Address Label"
            required
            fullWidth
            {...register('addressLabel')}
            error={!!errors.addressLabel}
            helperText={errors.addressLabel?.message}
          />
          <Stack direction="row" spacing={2}>
            <TextField label="Door / Flat No." fullWidth {...register('doorNo')} />
            <TextField label="Block / Tower" fullWidth {...register('block')} />
          </Stack>
          <TextField label="Apartment / Community" fullWidth {...register('community')} />
          <TextField
            label="Address Line"
            required
            fullWidth
            multiline
            minRows={2}
            {...register('addressLine')}
            error={!!errors.addressLine}
            helperText={errors.addressLine?.message}
          />
          <TextField
            label="Service Area"
            required
            fullWidth
            {...register('area')}
            error={!!errors.area}
            helperText={errors.area?.message}
          />
          <Stack direction="row" spacing={2}>
            <TextField label="City" fullWidth {...register('city')} />
            <TextField label="Pincode" fullWidth {...register('pincode')} error={!!errors.pincode} helperText={errors.pincode?.message} />
          </Stack>
          <TextField label="Landmark" fullWidth {...register('landmark')} />
          <Controller
            name="isDefault"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                label="Make this the default address"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={addAddressMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleSave)}
          disabled={addAddressMutation.isPending}
          startIcon={addAddressMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Save Address
        </Button>
      </DialogActions>
    </Dialog>
  );
}
