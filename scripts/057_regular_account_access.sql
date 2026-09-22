-- Regular members can browse bank details and see only their own statement requests.
-- This is intentionally self-contained because some deployments did not run 054.
CREATE TABLE IF NOT EXISTS public.statement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bank_ledger_id UUID NOT NULL REFERENCES public.ledgers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  purpose TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'Digital' CHECK (delivery_method IN ('Digital', 'Printed', 'Both')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Requested', 'Received', 'Cancelled')),
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_statement_requests_org_status
  ON public.statement_requests(org_id, status, created_at DESC);

ALTER TABLE public.statement_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Account users can view statement requests" ON public.statement_requests;
DROP POLICY IF EXISTS "Account users can create statement requests" ON public.statement_requests;
DROP POLICY IF EXISTS "Account users can update statement requests" ON public.statement_requests;
DROP POLICY IF EXISTS "Members can view their own statement requests" ON public.statement_requests;
DROP POLICY IF EXISTS "Members can create their own statement requests" ON public.statement_requests;
DROP POLICY IF EXISTS "Account users can manage statement requests" ON public.statement_requests;

CREATE POLICY "Members can view their own statement requests" ON public.statement_requests
  FOR SELECT USING (
    requested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
    )
  );

CREATE POLICY "Members can create their own statement requests" ON public.statement_requests
  FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Account users can manage statement requests" ON public.statement_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR department = 'Account Unit')
    )
  );
