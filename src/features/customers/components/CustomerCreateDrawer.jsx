import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Drawer,
  Dialog,
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

import { findByMobile } from "../api/customers.api.js";
import { useCreateCustomer, useUpdateCustomer } from "../hooks/useCustomers";
import { useSnackbar } from "@/components/feedback/SnackbarProvider";
import EntityLink from "@/components/ui/EntityLink";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .regex(/^[A-Za-z\s]+$/, "Only alphabets and spaces are allowed")
    .max(100),
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  sameAsMobile: z.boolean().default(true),
  whatsapp: z.string().optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  addressLabel: z.string().min(1, "Required"),
  doorNo: z.string().optional().or(z.literal("")),
  block: z.string().optional().or(z.literal("")),
  community: z.string().optional().or(z.literal("")),
  addressLine: z.string().min(3, "Required"),
  area: z.string().min(1, "Select a service area"),
  city: z.string().optional().or(z.literal("")),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode")
    .optional()
    .or(z.literal("")),
  landmark: z.string().optional().or(z.literal("")),
});

const defaultValues = {
  name: "",
  mobile: "",
  sameAsMobile: true,
  whatsapp: "",
  email: "",
  addressLabel: "Home",
  doorNo: "",
  block: "",
  community: "",
  addressLine: "",
  area: "",
  city: "",
  pincode: "",
  landmark: "",
};

export default function CustomerCreateDrawer({
  open,
  onClose,
  onCreated,
  mode = "create",
  initialValues,
  customerId,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const snackbar = useSnackbar();
  const [duplicates, setDuplicates] = useState([]);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);

  const formDefaults = useMemo(
    () => ({
      ...defaultValues,
      ...(initialValues ?? {}),
    }),
    [initialValues],
  );

  const targetCustomerId = customerId || initialValues?.customerId;
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer(targetCustomerId);

  const mutationIsPending = createCustomerMutation.isPending || updateCustomerMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues: formDefaults });

  const mobile = watch("mobile");

  const handleNameChange = (event) => {
    const sanitized = event.target.value.replace(/[^A-Za-z\s]/g, "");
    setValue("name", sanitized, { shouldValidate: true, shouldDirty: true });
  };

  const handleMobileChange = (event) => {
    const sanitized = event.target.value.replace(/\D/g, "").slice(0, 10);
    setValue("mobile", sanitized, { shouldValidate: true, shouldDirty: true });
  };

  const handlePincodeChange = (event) => {
    const sanitized = event.target.value.replace(/\D/g, "").slice(0, 6);
    setValue("pincode", sanitized, { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    if (!open) return;
    if (!/^[6-9]\d{9}$/.test(mobile || "")) {
      setDuplicates([]);
      return;
    }
    let active = true;
    setCheckingDuplicate(true);
    const t = setTimeout(async () => {
      const matches = await findByMobile(mobile);
      if (active) {
        setDuplicates(matches);
        setCheckingDuplicate(false);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [mobile, open]);

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    } else if (initialValues) {
      reset(formDefaults);
    }
  }, [open, initialValues, formDefaults, reset]);

  const onSubmit = (values) => {
    const handleSuccess = (result) => {
      snackbar.success(
        mode === "edit" ? "Customer updated successfully." : "Customer created successfully.",
      );
      const customerNumber =
        result?.customer?.customerNumber || result?.customer?.id || result?.customerNumber || result?.id;
      const addressNumber = result?.address?.addressNumber || result?.address?.id;
      if (onCreated) onCreated(customerNumber, addressNumber);
    };

    const handleError = (err) => {
      snackbar.error(
        err.message || (mode === "edit" ? "Could not update customer." : "Could not create customer."),
      );
    };

    if (mode === "edit") {
      updateCustomerMutation.mutate(values, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    } else {
      createCustomerMutation.mutate(values, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  };

  const handleClose = () => {
    if (mutationIsPending) return;
    if (isDirty && !window.confirm("Discard unsaved changes?")) return;
    onClose();
  };

  const body = (
    <Box
      sx={{
        width: { sm: 480 },
        height: "100%",
        bgcolor: "#FFFFFF",
        color: "#000000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 3, py: 2 }}
      >
        <Box>
          <Typography variant="h3">
            {mode === "edit" ? "Edit Customer" : "Add Customer"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === "edit"
              ? "Update customer details"
              : "Personal details and first service address"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />

      <Box
        component="form"
        id="customer-create-form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle1">Customer Details</Typography>
          <TextField
            label="Customer Name"
            required
            fullWidth
            {...register("name")}
            onChange={handleNameChange}
            inputProps={{ maxLength: 100, inputMode: "text" }}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Mobile Number"
            required
            fullWidth
            {...register("mobile")}
            onChange={handleMobileChange}
            inputProps={{ maxLength: 10, inputMode: "numeric" }}
            error={!!errors.mobile}
            helperText={
              errors.mobile?.message ||
              (checkingDuplicate ? "Checking for existing customers…" : " ")
            }
          />

          {duplicates.length > 0 && (
            <Alert severity="warning">
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {duplicates.length === 1
                  ? "A customer with this mobile already exists:"
                  : "Customers with this mobile already exist:"}
              </Typography>
              <Stack spacing={0.5}>
                {duplicates.map((d) => (
                  <Stack
                    key={d.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <EntityLink type="Customer" id={d.customerNumber} />
                    <Typography variant="body2">{d.name}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Alert>
          )}

          {/* WhatsApp number is intentionally hidden for now; retain this code
              so the field can be restored without changing the form model.
          <Controller
            name="sameAsMobile"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="WhatsApp number same as mobile"
              />
            )}
          />
          {!watch("sameAsMobile") && (
            <TextField
              label="WhatsApp Number"
              fullWidth
              {...register("whatsapp")}
            />
          )} */}

          <Divider />
          <Typography variant="subtitle1">First Service Address</Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Door / Flat No."
              fullWidth
              {...register("doorNo")}
            />
            <TextField label="Block / Tower" fullWidth {...register("block")} />
          </Stack>
          <TextField
            label="Apartment / Community"
            fullWidth
            {...register("community")}
          />
          <TextField
            label="Address Line"
            required
            fullWidth
            multiline
            minRows={2}
            {...register("addressLine")}
            error={!!errors.addressLine}
            helperText={errors.addressLine?.message}
          />
          <TextField
            label="Service Area"
            required
            fullWidth
            {...register("area")}
            error={!!errors.area}
            helperText={errors.area?.message}
          />
          <Stack direction="row" spacing={2}>
            <TextField label="City" fullWidth {...register("city")} />
            <TextField
              label="Pincode"
              fullWidth
              {...register("pincode")}
              onChange={handlePincodeChange}
              inputProps={{ maxLength: 6, inputMode: "numeric" }}
              error={!!errors.pincode}
              helperText={errors.pincode?.message}
            />
          </Stack>
          <TextField label="Landmark" fullWidth {...register("landmark")} />
        </Stack>
      </Box>

      <Divider />
      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="flex-end"
        sx={{ px: 3, py: 2 }}
      >
        <Button onClick={handleClose} disabled={mutationIsPending}>
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          form="customer-create-form"
          disabled={mutationIsPending}
          startIcon={
            mutationIsPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : null
          }
        >
          {mode === "edit" ? "Save Changes" : "Save Customer"}
        </Button>
      </Stack>
    </Box>
  );

  if (fullScreen) {
    return (
      <Dialog fullScreen open={open} onClose={handleClose}>
        {body}
      </Dialog>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { bgcolor: "#FFFFFF", color: "#000000" } }}
    >
      {body}
    </Drawer>
  );
}
