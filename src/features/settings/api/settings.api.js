import { apiFetch } from "@/services/http/client.js";

export async function fetchBathroomConfigs() {
  const pricings = await apiFetch("/pricing").catch(() => []);
  const pricingsList = Array.isArray(pricings) ? pricings : [];
  return pricingsList
    .filter((item) => item?.bathroomCountReference && item?.serviceFrequencyReference && item?.subscriptionTypeReference)
    .map((item) => ({
      ...item,
      count: Number(item.bathroomCountReference.bathroomCount),
      price: Number(item.price),
      pricingId: item._id,
      bathroomCountId: item.bathroomCountReference._id,
      serviceFrequencyId: item.serviceFrequencyReference._id,
      subscriptionTypeId: item.subscriptionTypeReference._id,
    }))
    .sort((a, b) => a.count - b.count || String(a.serviceFrequencyReference.frequencyName).localeCompare(String(b.serviceFrequencyReference.frequencyName)));
}

export async function saveBathroomConfig(item) {
  const priceNum = Number(item.price);
  let bCountId = item.bathroomCountId;
  if (!bCountId) {
    const counts = await apiFetch("/bathroom-counts").catch(() => []);
    const existing = counts.find((c) => Number(c.bathroomCount) === item.count);
    if (existing) {
      bCountId = existing._id;
    } else {
      const newCnt = await apiFetch("/bathroom-counts", {
        method: "POST",
        body: JSON.stringify({ bathroomCount: item.count, isActive: true }),
      });
      bCountId = newCnt._id;
    }
  }

  if (item.pricingId) {
    return apiFetch(`/pricing/${item.pricingId}`, {
      method: "PUT",
      body: JSON.stringify({
        price: priceNum,
        bathroomCountReference: bCountId,
        serviceFrequencyReference: item.serviceFrequencyId,
        subscriptionTypeReference: item.subscriptionTypeId,
        isActive: item.isActive,
      }),
    });
  }

  return apiFetch("/pricing", {
    method: "POST",
    body: JSON.stringify({
      price: priceNum,
      bathroomCountReference: bCountId,
      serviceFrequencyReference: item.serviceFrequencyId,
      subscriptionTypeReference: item.subscriptionTypeId,
      isActive: item.isActive,
      deactivatePrevious: true,
    }),
  });
}
