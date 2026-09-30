import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import { SaveIcon, RefreshIcon, AdminPanelSettingsOutlinedIcon } from '@/theme/icons';
import PageHeader from '@/components/layout/PageHeader';
import { useBathroomConfigs, useSaveBathroomConfig } from '../hooks/useSettings.js';
import { useSnackbar } from '@/components/feedback/SnackbarProvider';

const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'rgba(15, 62, 54, 0.02)' } };

export default function SettingsPage() {
  const snackbar = useSnackbar();
  const { data: configs = [], isLoading, isError, error, refetch } = useBathroomConfigs();
  const mutation = useSaveBathroomConfig();
  const [selectedId, setSelectedId] = useState('');
  const [selectedCount, setSelectedCount] = useState('');
  const [selectedFrequencyId, setSelectedFrequencyId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [tablePrices, setTablePrices] = useState({});
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState('');
  const [tableError, setTableError] = useState('');
  const counts = useMemo(() => [...new Map(configs.map((item) => [String(item.count), item.count])).values()].sort((a, b) => a - b), [configs]);
  const frequencies = useMemo(() => [...new Map(configs.filter((item) => String(item.count) === String(selectedCount)).map((item) => [String(item.serviceFrequencyId), item.serviceFrequencyReference])).values()], [configs, selectedCount]);
  const plans = useMemo(() => configs.filter((item) => String(item.count) === String(selectedCount) && String(item.serviceFrequencyId) === String(selectedFrequencyId)).map((item) => item.subscriptionTypeReference).filter((plan, index, all) => all.findIndex((p) => String(p?._id) === String(plan?._id)) === index), [configs, selectedCount, selectedFrequencyId]);
  const selected = configs.find((item) => String(item.pricingId) === String(selectedId));
  useEffect(() => {
    if (!selected && configs.length && !selectedCount) chooseCount(String(configs[0].count));
  }, [configs, selected, selectedCount]);
  const durationColumns = useMemo(() => [...new Map(configs.map((item) => { const label = item.subscriptionTypeReference?.subscriptionName || ''; const match = label.match(/\d+(?:\.\d+)?/); return [match ? Number(match[0]) : Number.MAX_SAFE_INTEGER, label]; })).entries()].sort((a, b) => a[0] - b[0]), [configs]);
  const groupedRows = useMemo(() => {
    const matches = configs.filter((item) => `${item.count} ${item.serviceFrequencyReference?.frequencyName} ${item.subscriptionTypeReference?.subscriptionName}`.toLowerCase().includes(search.toLowerCase()));
    const groups = new Map();
    matches.forEach((item) => {
      const key = `${item.count}::${item.serviceFrequencyId}`;
      if (!groups.has(key)) groups.set(key, { count: item.count, frequency: item.serviceFrequencyReference?.frequencyName, records: [] });
      groups.get(key).records.push(item);
    });
    return [...groups.values()].sort((a, b) => a.count - b.count || String(a.frequency).localeCompare(String(b.frequency)));
  }, [configs, search]);
  const chooseCount = (count) => {
    const item = configs.find((entry) => String(entry.count) === String(count));
    setSelectedCount(String(count)); setSelectedFrequencyId(item?.serviceFrequencyId || ''); setSelectedPlanId(item?.subscriptionTypeId || ''); setSelectedId(item?.pricingId || ''); setFormPrice(item ? String(item.price) : ''); setFormError('');
  };
  const chooseFrequency = (id) => { const item = configs.find((entry) => String(entry.count) === String(selectedCount) && String(entry.serviceFrequencyId) === String(id)); setSelectedFrequencyId(id); setSelectedPlanId(item?.subscriptionTypeId || ''); setSelectedId(item?.pricingId || ''); setFormPrice(item ? String(item.price) : ''); setFormError(''); };
  const choosePlan = (id) => { const item = configs.find((entry) => String(entry.count) === String(selectedCount) && String(entry.serviceFrequencyId) === String(selectedFrequencyId) && String(entry.subscriptionTypeId) === String(id)); setSelectedPlanId(id); setSelectedId(item?.pricingId || ''); setFormPrice(item ? String(item.price) : ''); setFormError(''); };
  const saveForm = async () => {
    if (!selected) return;
    const price = Number(formPrice === '' ? selected.price : formPrice);
    if (!Number.isFinite(price) || price < 0) { setFormError('Price must be a valid non-negative number'); return; }
    if (!window.confirm('Are you sure you want to update the pricing configuration?')) return;
    try { await mutation.mutateAsync({ ...selected, price }); await refetch(); setFormPrice(''); snackbar.success('Pricing configuration saved successfully.'); } catch (err) { snackbar.error(`Failed to save configuration: ${err.message}`); }
  };
  const saveTable = async () => {
    const updates = configs.filter((item) => tablePrices[item.pricingId] !== undefined).map((item) => ({ ...item, price: Number(tablePrices[item.pricingId]) }));
    if (!updates.length) return;
    if (updates.some((item) => !Number.isFinite(item.price) || item.price < 0)) { setTableError('Table prices must be valid non-negative numbers'); return; }
    if (!window.confirm('Are you sure you want to update the pricing configuration?')) return;
    try { await Promise.all(updates.map((item) => mutation.mutateAsync(item))); await refetch(); setTablePrices({}); setTableError(''); snackbar.success('Pricing table changes saved successfully.'); } catch (err) { snackbar.error(`Failed to save pricing table: ${err.message}`); }
  };

  return <Stack spacing={3}>
    <PageHeader title="Settings & Administration" subtitle="Configure Super Admin system parameters and service pricing." icon={AdminPanelSettingsOutlinedIcon} action={<Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()} disabled={isLoading}>Refresh</Button>} />
    {isError && <Alert severity="error">{error?.message || 'Failed to load bathroom pricing configuration.'}</Alert>}
    {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> : <>
      <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, border: '1px solid rgba(15,62,54,.08)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Update Pricing</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Select the configuration, view the current price and update with a new amount.</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField select fullWidth label="No. of Bathrooms" value={selectedCount} onChange={(e) => chooseCount(e.target.value)} sx={fieldSx}><MenuItem value="" />{counts.map((count) => <MenuItem key={count} value={count}>{count} {count === 1 ? 'Bathroom' : 'Bathrooms'}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={6}><TextField select fullWidth label="Service Frequency" value={selectedFrequencyId} onChange={(e) => chooseFrequency(e.target.value)} sx={fieldSx}><MenuItem value="" />{frequencies.map((item) => <MenuItem key={item._id} value={item._id}>{item.frequencyName}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={6}><TextField select fullWidth label="Subscription Plan" value={selectedPlanId} onChange={(e) => choosePlan(e.target.value)} sx={fieldSx}><MenuItem value="" />{plans.map((item) => <MenuItem key={item._id} value={item._id}>{item.subscriptionName}</MenuItem>)}</TextField></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Current Price" value={selected?.price ?? ''} InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">₹</InputAdornment> }} sx={fieldSx} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="New Price" type="number" value={formPrice} onChange={(e) => { setFormPrice(e.target.value); setFormError(''); }} error={Boolean(formError)} helperText={formError} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} sx={{ ...fieldSx, '& input[type=number]': { MozAppearance: 'textfield' }, '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 } }} /></Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}><Button variant="contained" startIcon={<SaveIcon />} onClick={saveForm} disabled={!selected || mutation.isPending}>Save Changes</Button></Stack>
      </Paper>
      <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, border: '1px solid rgba(15,62,54,.08)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}><Box><Typography variant="h5" sx={{ fontWeight: 800 }}>Current Pricing List</Typography><Typography color="text.secondary">View all configured pricing combinations.</Typography></Box><Stack direction="row" spacing={1}><TextField size="small" placeholder="Search by bathroom count, frequency or plan..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: 220, sm: 340 }, ...fieldSx }} /><Button variant="contained" startIcon={<SaveIcon />} onClick={saveTable} disabled={mutation.isPending || !Object.keys(tablePrices).length}>Save Changes</Button></Stack></Stack>
        {tableError && <Alert severity="error" sx={{ mb: 2 }}>{tableError}</Alert>}
        <Box sx={{ overflowX: 'auto' }}><Box component="table" sx={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', '& th': { position: 'sticky', top: 0, backgroundColor: 'rgba(15,118,110,.08)', textAlign: 'left', p: 1.5, fontSize: 12 }, '& td': { p: 1.5, borderTop: '1px solid rgba(15,62,54,.08)' }, '& tbody tr:hover': { backgroundColor: 'rgba(15,118,110,.04)' } }}><thead><tr><th>Bathroom Count</th><th>Service Frequency</th>{durationColumns.map(([, label]) => <th key={label}>{label} Price</th>)}<th>Status</th></tr></thead><tbody>{groupedRows.map((group, groupIndex) => { const firstForCount = groupIndex === 0 || groupedRows[groupIndex - 1].count !== group.count; const countSpan = groupedRows.filter((candidate) => candidate.count === group.count).length; const firstRecord = group.records[0]; return <tr key={`${group.count}-${group.frequency}`}>{firstForCount && <td rowSpan={countSpan}>{group.count} {group.count === 1 ? 'Bathroom' : 'Bathrooms'}</td>}<td>{group.frequency}</td>{durationColumns.map(([, label]) => { const item = group.records.find((record) => record.subscriptionTypeReference?.subscriptionName === label); return <td key={label}>{item ? <TextField size="small" type="number" value={tablePrices[item.pricingId] ?? item.price} onChange={(e) => { setTablePrices((prev) => ({ ...prev, [item.pricingId]: e.target.value })); setTableError(''); }} sx={{ width: 130, ...fieldSx }} /> : '—'}</td>; })}<td>{firstRecord?.isActive ? 'Active' : 'Inactive'}</td></tr>; })}</tbody></Box></Box>
      </Paper>
    </>}
  </Stack>;
}
