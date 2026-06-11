import { createClient } from '@/lib/supabase/server';
import ProfileForm from './profile-form';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user!.id)
    .maybeSingle();

  return (
    <section className="rounded-[2rem] border border-ink/[0.07] bg-paper p-7 md:p-10">
      <h2 className="font-display text-3xl font-light italic text-ink">Profile</h2>
      <ProfileForm
        initialName={data?.full_name || ''}
        initialPhone={data?.phone || ''}
        email={user!.email || ''}
      />
    </section>
  );
}
