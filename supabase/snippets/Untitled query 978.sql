select count(*)
from public.return_workflow_history
where event_type = 'payment_received';