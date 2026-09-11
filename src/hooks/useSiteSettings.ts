import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types';
import { BUSINESS } from '@/lib/constants';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (mounted) {
        if (data && !error) {
          setSettings(data);
        }
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const businessName = settings?.business_name || BUSINESS.name;
  const phone = settings?.phone || BUSINESS.phone;
  const email = settings?.email || BUSINESS.email;
  const intro = settings?.homepage_intro || BUSINESS.intro;
  const contactMessage = settings?.contact_message || 'For direct assistance, call or email. We will discuss your repair needs and determine the best approach.';

  return {
    settings,
    loading,
    businessName,
    phone,
    email,
    intro,
    contactMessage,
  };
}
