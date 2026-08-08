create or replace function public.get_dashboard_executive_metrics()
returns table (
    projected_revenue numeric,
    due_next_7_days integer,
    due_next_30_days integer,
    completed_this_week integer,
    completed_this_month integer,
    review_queue integer
)
language sql
stable
as $$

select

coalesce(
(
select sum(preparation_fee)
from tax_returns
where status <> 'completed'
),
0
) as projected_revenue,

coalesce(
(
select count(*)
from tax_returns
where
due_date between current_date
and current_date + interval '7 day'
and status <> 'completed'
),
0
) as due_next_7_days,

coalesce(
(
select count(*)
from tax_returns
where
due_date between current_date
and current_date + interval '30 day'
and status <> 'completed'
),
0
) as due_next_30_days,

coalesce(
(
select count(*)
from tax_returns
where
workflow_completed_at >= date_trunc('week', now())
),
0
) as completed_this_week,

coalesce(
(
select count(*)
from tax_returns
where
workflow_completed_at >= date_trunc('month', now())
),
0
) as completed_this_month,

coalesce(
(
select count(*)
from tax_returns
where workflow_status = 'review'
),
0
) as review_queue;

$$; 