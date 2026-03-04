-- RPC callable from client to ensure public.users row exists
CREATE OR REPLACE FUNCTION public.ensure_user_record(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  -- Reassign stale row if same email exists under a different id
  UPDATE public.users SET id = v_user_id WHERE email = p_email AND id != v_user_id;
  -- Insert or update
  INSERT INTO public.users (id, email)
  VALUES (v_user_id, p_email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
END;
$$;

-- Also fix the trigger for future signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users SET id = NEW.id WHERE email = NEW.email AND id != NEW.id;
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;
