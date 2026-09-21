-- Regular members can browse bank details and see only their own statement requests.
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
