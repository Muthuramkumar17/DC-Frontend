/**
 * NewBookingPage.jsx
 * -----------------------------------------------------------------------
 * Multi-step wizard (Customer & Requirements, Schedule, Review & Confirm)
 * for creating confirmed bookings with real-time bill quoting.
 * -----------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";

import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import PageHeader from "@/components/layout/PageHeader";
import BillSummary from "@/features/bookings/components/BillSummary";
import { useSnackbar } from "@/components/feedback/SnackbarProvider";
import { listCustomers } from "@/features/customers/api/customers.api.js";
import { useBookingMasters, useCreateBooking, useSlotAvailability } from "../hooks/useBookings";
import { useCustomersList, useCustomerAddresses } from "@/features/customers/hooks/useCustomers";
import { quotePricing } from "../utils/pricing.js";
import { timeFromSlotId } from "@/utils/scheduling";

/**
 * Validation schema for the booking form across all wizard steps.
 */
const schema = z.object({
  customer: z.any().refine((v) => !!v, "Select a customer"),
  address: z.any().refine((v) => !!v, "Select a service address"),
  bathrooms: z
    .number({ invalid_type_error: "Select number of bathrooms" })
    .min(1)
    .max(4),
  frequencyId: z.string().min(1, "Select a frequency"),
  planId: z.string().min(1, "Select a plan"),
  discount: z.number().min(0).default(0),
  discountReason: z.string().optional().or(z.literal("")),
  startDate: z.any().refine((v) => !!v, "Select a start date"),
  slotId: z.string().min(1, "Select a service slot"),
  paymentModeId: z.string().min(1, "Select a payment mode"),
  receiverAccountId: z.string().min(1, "Select a receiver bank type"),
  paymentReference: z.string().optional().or(z.literal("")),
});

const DISCOUNT_APPROVAL_THRESHOLD = 300;
const steps = ["Customer & Requirements", "Schedule", "Review & Confirm"];

/**
 * Interactive step-by-step booking creation page component.
 */
export default function NewBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const snackbar = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [customerInput, setCustomerInput] = useState("");
  const {
    data: bookingMasters = {
      bathrooms: [],
      frequencies: [],
      plans: [],
      slots: [],
      slotsByBathroom: {},
      durationByBathroom: {},
      paymentAccounts: [],
      paymentMethods: [],
    },
    isLoading: loadingBookingMasters,
  } = useBookingMasters();

  const {
    control,
    watch,
    trigger,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      customer: null,
      address: null,
      bathrooms: "",
      frequencyId: "",
      planId: "",
      discount: 0,
      discountReason: "",
      startDate: dayjs(),
      slotId: "",
      paymentModeId: "",
      receiverAccountId: "",
      paymentAmount: "",
      paymentReference: "",
    },
  });

  const values = watch();
  const selectedDuration =
    bookingMasters.durationByBathroom?.[String(values.bathrooms)];

  const selectedDateStr = values.startDate
    ? values.startDate.format("YYYY-MM-DD")
    : null;

  const bathroomObj = bookingMasters.bathrooms?.find(
    (b) => b.value === values.bathrooms,
  );

  const { data: availabilityData, isLoading: loadingAvailability } = useSlotAvailability({
    date: selectedDateStr,
    bathrooms: values.bathrooms,
    bathroomCountId: bathroomObj?.id,
  });

  const availableSlots = availabilityData?.slots || [];

  useEffect(() => {
    if (
      values.slotId &&
      !availableSlots.some((slot) => slot.id === values.slotId)
    ) {
      setValue("slotId", "", { shouldValidate: true });
    }
  }, [availableSlots, setValue, values.slotId]);

  /** Fetch matching customer options as user types */
  const { data: customerOptions = [], isFetching: loadingCustomers } = useCustomersList({ search: customerInput });

  /** Auto-prefill customer if customer query parameter exists */
  useEffect(() => {
    const prefillNumber = searchParams.get("customer");
    if (!prefillNumber) return;

    listCustomers({ search: "" }).then((rows) => {
      const match =
        rows.find((r) => r.customerNumber === prefillNumber) ||
        rows.find((r) => r.id === prefillNumber) ||
        rows.find((r) => r.mobile === prefillNumber) ||
        rows.find((r) => String(r.customerNumber || "") === String(prefillNumber));

      if (match) {
        setValue("customer", match, { shouldValidate: true });
        setCustomerInput(`${match.name} (${match.mobile})`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Fetch address options whenever customer selection changes */
  const { data: addressOptions = [] } = useCustomerAddresses(values.customer?.id);

  /** Auto-prefill address if address query parameter exists, else pick first/default */
  useEffect(() => {
    if (addressOptions.length === 0) return;
    const prefillAddress = searchParams.get("address");
    if (prefillAddress) {
      const match = addressOptions.find(
        (a) => a.addressNumber === prefillAddress || a.id === prefillAddress,
      );
      if (match) {
        setValue("address", match, { shouldValidate: true });
        return;
      }
    }
    // No explicit address param — auto-select the default or first address
    const defaultAddr =
      addressOptions.find((a) => a.isDefault) || addressOptions[0];
    if (defaultAddr) {
      setValue("address", defaultAddr, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressOptions]);

  /** Real-time financial price calculation breakdown */
  const quote = useMemo(
    () =>
      quotePricing({
        planId: values.planId,
        frequencyId: values.frequencyId,
        bathrooms: values.bathrooms,
        discount: Number(values.discount) || 0,
        planOptions: bookingMasters.plans,
        frequencyOptions: bookingMasters.frequencies,
        paymentMaster: bookingMasters.paymentMaster,
      }),
    [
      bookingMasters.frequencies,
      bookingMasters.plans,
      values.planId,
      values.frequencyId,
      values.bathrooms,
      values.discount,
      bookingMasters.paymentMaster,
    ],
  );

  const requiresDiscountApproval =
    quote && quote.authorizedDiscount >= DISCOUNT_APPROVAL_THRESHOLD;
  const selectedSlotLabel =
    availableSlots.find((slot) => slot.id === values.slotId)?.label ||
    bookingMasters.slots.find((slot) => slot.id === values.slotId)?.label ||
    "—";

  const buildBookingPayload = () => {
    const bathroomObj = bookingMasters.bathrooms?.find(
      (b) => b.value === values.bathrooms,
    );
    
    const matchedPricing = (bookingMasters.rawPricing || []).find((p) => {
      const cnt =
        p.bathroomCountReference?.bathroomCount ??
        p.bathroomCountId?.bathroomCount;
      const frequencyId = p.serviceFrequencyReference?._id || p.serviceFrequencyReference;
      const subscriptionId = p.subscriptionTypeReference?._id || p.subscriptionTypeReference;

      return Number(cnt) === Number(values.bathrooms) &&
        String(frequencyId) === String(values.frequencyId) &&
        String(subscriptionId) === String(values.planId) &&
        p.isActive !== false;
    });

    if (!matchedPricing) {
      throw new Error(
        `No active pricing configuration found for ${values.bathrooms} bathroom(s). Please configure the pricing in Settings.`,
      );
    }

    const pricingId = matchedPricing?._id;
    const selectedSlot = availableSlots.find((s) => s.id === values.slotId);

    return {
      customerId: values.customer?._id || values.customer?.id,
      bathroomCountId: bathroomObj?.id || undefined,
      pricingId: pricingId || undefined,
      serviceFrequencyId: values.frequencyId,
      subscriptionTypeId: values.planId,
      timeSlotId: values.slotId,
      startTime: selectedSlot?.startTime || timeFromSlotId(values.slotId) || undefined,
      scheduledDate: values.startDate
        ? values.startDate.format("YYYY-MM-DD")
        : undefined,
      discount: Number(values.discount) || 0,
      discountReason: values.discountReason || "",
      paymentMethodId: values.paymentModeId,
      paymentAccountId: values.receiverAccountId,
      paymentAmount: Number(quote?.total) || 0,
      transactionId: values.paymentReference || "",
    };
  };

  /** Creates the booking with linked invoice and subscription in the final step. */
  const createBookingHook = useCreateBooking();
  const createBookingMutation = {
    isPending: createBookingHook.isPending,
    mutate: () => {
      createBookingHook.mutate(buildBookingPayload(), {
        onSuccess: (result) => {
          const bNumber =
            result.booking?.bookingNumber ||
            result.booking?.bookingId ||
            result.booking?._id;
          snackbar.success("Booking created successfully.");
          navigate(`/bookings/${bNumber}`);
        },
        onError: (err) => snackbar.error(err.message || "Failed to create booking"),
      });
    },
  };

  /** Advances step after validating active step fields */
  const handleNext = async () => {
    const stepFields = [
      ["customer", "address", "bathrooms", "frequencyId", "planId"],
      ["startDate", "slotId"],
    ][activeStep];
    const valid = await trigger(stepFields);
    if (!valid) return;

    setActiveStep((s) => s + 1);
  };

  /** Trigger final booking confirmation */
  const onConfirm = () => createBookingMutation.mutate();
  const selectedAddress = [
    values.address?.doorNo,
    values.address?.block,
    values.address?.community,
    values.address?.addressLine,
    values.address?.area,
    values.address?.city,
    values.address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        p: { xs: 2, sm: 3.5 },
      }}
    >
      <PageHeader
        title="New Booking"
        subtitle="Create a new service booking with auto-priced quotes and instant scheduling."
        breadcrumbs={[
          { label: "Bookings", path: "/bookings" },
          { label: "New" },
        ]}
      />

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 1 }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 1 }}
          >
            {activeStep === 0 && (
              <Stack spacing={2.5}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  Customer & Requirements
                </Typography>

                <Controller
                  name="customer"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={customerOptions}
                      loading={loadingCustomers}
                      getOptionLabel={(o) =>
                        o ? `${o.name} (${o.mobile})` : ""
                      }
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      value={field.value}
                      onChange={(_, v) => {
                        field.onChange(v);
                        setValue("address", null);
                      }}
                      onInputChange={(_, v) => setCustomerInput(v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Customer"
                          required
                          error={!!errors.customer}
                          helperText={
                            errors.customer?.message ||
                            "Search by name or phone number"
                          }
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={addressOptions}
                      disabled={!values.customer}
                      getOptionLabel={(o) =>
                        o
                          ? `${o.area || o.label}${o.addressLine ? ` — ${o.addressLine}` : ""}`
                          : ""
                      }
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      value={field.value}
                      onChange={(_, v) => field.onChange(v)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Service Address"
                          required
                          error={!!errors.address}
                          helperText={
                            errors.address?.message ||
                            (!values.customer ? "Select a customer first" : " ")
                          }
                        />
                      )}
                    />
                  )}
                />

                <Stack direction="row" spacing={2}>
                  <Controller
                    name="bathrooms"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        label="No. of Bathrooms"
                        required
                        fullWidth
                        disabled={loadingBookingMasters}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        error={!!errors.bathrooms}
                        helperText={errors.bathrooms?.message}
                      >
                        {bookingMasters.bathrooms.map((bathroom) => (
                          <MenuItem key={bathroom.id} value={bathroom.value}>
                            {bathroom.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Controller
                    name="frequencyId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        label="Cleaning Frequency"
                        required
                        fullWidth
                        disabled={loadingBookingMasters}
                        {...field}
                        error={!!errors.frequencyId}
                        helperText={errors.frequencyId?.message}
                      >
                        {bookingMasters.frequencies.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="planId"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        label="Subscription Plan"
                        required
                        fullWidth
                        disabled={loadingBookingMasters}
                        {...field}
                        error={!!errors.planId}
                        helperText={errors.planId?.message}
                      >
                        {bookingMasters.plans.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Stack>

                <Divider />
                <Stack direction="row" spacing={2}>
                  <Controller
                    name="discount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Optional Discount (₹)"
                        type="number"
                        fullWidth
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => {
                          const raw = e.target.value;
                          field.onChange(raw === "" ? 0 : Number(raw) || 0);
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="discountReason"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Discount Reason"
                        fullWidth
                        {...field}
                        value={field.value ?? ""}
                      />
                    )}
                  />
                </Stack>
                {requiresDiscountApproval && (
                  <Chip
                    size="small"
                    color="warning"
                    label="This discount exceeds the auto-approval threshold and requires a reason before confirmation."
                    sx={{
                      height: "auto",
                      py: 0.75,
                      borderRadius: 1,
                      "& .MuiChip-label": { whiteSpace: "normal" },
                    }}
                  />
                )}
              </Stack>
            )}

            {activeStep === 1 && (
              <Stack spacing={2.5}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  Schedule
                </Typography>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Service Start Date"
                      value={field.value}
                      onChange={field.onChange}
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: errors.startDate?.message,
                        },
                        popper: { placement: "top-start" },
                        actionBar: {
                          actions: ["clear", "today"],
                          sx: { justifyContent: "space-between", px: 1 },
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="slotId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label={
                        selectedDuration
                          ? `Available Service Slot (${selectedDuration} minutes)`
                          : "Available Service Slot"
                      }
                      required
                      fullWidth
                      {...field}
                      error={!!errors.slotId}
                      helperText={
                        errors.slotId?.message ||
                        (!values.bathrooms ? "Select bathrooms first" : "")
                      }
                    >
                      {availableSlots.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
            )}

            {activeStep === 2 && (
              <Stack spacing={2.5}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  Review & Confirm
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: "#F8FAF9", borderRadius: 1 }}
                >
                  <Stack spacing={0.75}>
                    <Typography variant="body2">
                      <strong>{values.customer?.name}</strong> ·{" "}
                      {values.customer?.mobile}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAddress}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start: {values.startDate?.format("DD MMM YYYY")} · Slot:{" "}
                      {selectedSlotLabel}
                    </Typography>
                  </Stack>
                </Paper>
                <Divider />
                <Controller
                  name="paymentModeId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Payment Mode Received"
                      required
                      fullWidth
                      {...field}
                      error={!!errors.paymentModeId}
                      helperText={errors.paymentModeId?.message}
                    >
                      {bookingMasters.paymentMethods.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="receiverAccountId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      label="Receiver Bank Type"
                      required
                      fullWidth
                      disabled={loadingBookingMasters}
                      {...field}
                      error={!!errors.receiverAccountId}
                      helperText={errors.receiverAccountId?.message}
                    >
                      {bookingMasters.paymentAccounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                
                <Controller
                  name="paymentReference"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Payment Reference (optional)"
                      fullWidth
                      {...field}
                    />
                  )}
                />
                <Typography variant="caption" color="text.secondary">
                  Confirming will record the payment already collected, generate
                  the invoice, activate the subscription, and schedule all
                  service visits in one step.
                </Typography>
              </Stack>
            )}

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 4 }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => s - 1)}
              >
                Back
              </Button>
              <Stack direction="row" spacing={1.5}>
                {activeStep < 2 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      color: "#FFFFFF",
                      "&.Mui-disabled": {
                        color: "#FFFFFF",
                      },
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit(onConfirm)}
                    disabled={createBookingMutation.isPending}
                    startIcon={
                      createBookingMutation.isPending ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : null
                    }
                  >
                    Confirm Booking
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <BillSummary quote={quote} />
        </Grid>
      </Grid>
    </Box>
  );
}
