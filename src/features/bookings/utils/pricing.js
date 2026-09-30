import dayjs from "dayjs";

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function quotePricing({
  planId,
  frequencyId,
  bathrooms,
  discount = 0,
  planOptions = [],
  frequencyOptions = [],
  paymentMaster = null,
}) {
  const plan = (planOptions || []).find((p) => p.id === planId);
  const frequency = (frequencyOptions || []).find((f) => f.id === frequencyId);

  if (!plan || !frequency || !bathrooms) return null;

  const bathroomCount = Number(bathrooms);

  if (!Number.isFinite(bathroomCount) || bathroomCount <= 0) {
    throw new Error("Invalid bathroom count selected for pricing.");
  }

  const selectionKey = `${planId}:${frequencyId}:${bathroomCount}`;
  const configuredPrice =
    plan.priceBySelection?.[selectionKey] ??
    plan.pricePerServiceByBathroom?.[bathroomCount];

  if (
    configuredPrice == null ||
    configuredPrice === "" ||
    !Number.isFinite(Number(configuredPrice)) ||
    Number(configuredPrice) < 0
  ) {
    throw new Error(
      `No active pricing configuration found for ${bathroomCount} bathroom(s). Please configure the pricing in Settings.`,
    );
  }

  const pricePerService = Number(configuredPrice);

  const numServices = Math.max(
    1,
    (plan.termMonths || 1) * (frequency.visitsPerMonth || 1),
  );

  const mappedFinalAmount = round2(pricePerService);
  const authorizedDiscount = round2(Math.min(Math.max(Number(discount) || 0, 0), mappedFinalAmount));
  const total = round2(mappedFinalAmount - authorizedDiscount);
  const gstRate = Number(paymentMaster?.cgstRate || 0) + Number(paymentMaster?.sgstRate || 0);
  const gstAmount = gstRate > 0 ? round2(total * gstRate / (100 + gstRate)) : 0;
  const taxableAmount = round2(total - gstAmount);
  const cgstAmount = round2(gstAmount / 2);
  const sgstAmount = round2(gstAmount / 2);

  const taxes = [
    {
      id: "CGST",
      label: "CGST",
      rate: Number(paymentMaster?.cgstRate || 0) / 100,
      amount: cgstAmount,
    },
    {
      id: "SGST",
      label: "SGST",
      rate: Number(paymentMaster?.sgstRate || 0) / 100,
      amount: sgstAmount,
    },
  ];

  const taxTotal = gstAmount;

  return {
    plan,
    frequency,
    bathroomCount,
    pricePerService,
    numServices,
    serviceCharges: total,
    authorizedDiscount,
    taxableAmount,
    baseAmount: taxableAmount,
    gstAmount,
    taxes,
    taxTotal,
    total,
    effectiveDate: dayjs().format("YYYY-MM-DD"),
  };
}
