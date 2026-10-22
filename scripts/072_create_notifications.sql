-- 072_create_notifications.sql
-- In-app notifications for members and admin users.

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    href TEXT,
    kind TEXT NOT NULL DEFAULT 'info',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS notifications_recipient_created_idx
    ON public.notifications (recipient_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_unread_idx
    ON public.notifications (recipient_user_id, created_at DESC)
    WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipients can view their notifications" ON public.notifications;
CREATE POLICY "Recipients can view their notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (recipient_user_id = auth.uid());

DROP POLICY IF EXISTS "Recipients can update their notifications" ON public.notifications;
CREATE POLICY "Recipients can update their notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (recipient_user_id = auth.uid())
    WITH CHECK (recipient_user_id = auth.uid());

DROP POLICY IF EXISTS "Recipients and admins can create notifications" ON public.notifications;
CREATE POLICY "Recipients and admins can create notifications" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (
        recipient_user_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Recipients can delete their notifications" ON public.notifications;
CREATE POLICY "Recipients can delete their notifications" ON public.notifications
    FOR DELETE TO authenticated
    USING (recipient_user_id = auth.uid());
