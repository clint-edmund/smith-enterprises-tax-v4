select
  tr.tax_year,
  tr.return_type,
  tr.tax_form,
  count(rrd.id) as required_document_count,
  count(*) filter (
    where rrd.is_complete = true
  ) as completed_document_count
from public.tax_returns tr
left join public.return_required_documents rrd
  on rrd.tax_return_id = tr.id
group by
  tr.tax_year,
  tr.return_type,
  tr.tax_form
order by
  tr.tax_year desc,
  tr.return_type,
  tr.tax_form;