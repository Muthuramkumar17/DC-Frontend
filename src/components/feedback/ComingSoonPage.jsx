import Paper from '@mui/material/Paper';
import PageHeader from '../layout/PageHeader';
import { EmptyState } from './PageStates';
import { ConstructionOutlinedIcon } from '@/theme/icons';

/**
 * ComingSoonPage Component
 * Generic placeholder page for modules scheduled for future release phases.
 *
 * @param {Object} props
 * @param {string} props.title - Feature screen title
 * @param {string} [props.note] - Optional custom message detailing scheduled phase release
 */
export default function ComingSoonPage({ title, note }) {
  return (
    <>
      <PageHeader title={title} />
      <Paper variant="outlined" sx={{ borderRadius: 3 }}>
        <EmptyState
          icon={<ConstructionOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
          title="Scheduled for next phase"
          description={
            note ||
            'Core Operational modules (Customers, Bookings, Subscriptions, Visits) are built first. This module is under development.'
          }
        />
      </Paper>
    </>
  );
}
