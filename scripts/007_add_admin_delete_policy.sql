-- Add admin delete policy to allow admins to delete youth members

-- Admin policy - admins can delete any profile
create policy "profiles_admin_delete_all"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );