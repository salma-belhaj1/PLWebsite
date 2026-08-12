-- Create other_expenses table for admin-only expense tracking

CREATE TABLE IF NOT EXISTS public.other_expenses (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  category text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  occurred_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.other_expenses ENABLE ROW LEVEL SECURITY;

-- Allow only admin users (as recorded in profiles.role) to SELECT/INSERT/UPDATE/DELETE
CREATE POLICY "admin_full_access" ON public.other_expenses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Grant select/insert/update/delete via policies only (no public access)
REVOKE ALL ON public.other_expenses FROM public;
