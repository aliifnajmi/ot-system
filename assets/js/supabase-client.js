/* Mulia OT System V4 — Supabase client and common helpers */
(function () {
  'use strict';
  const cfg = window.MULIA_SUPABASE_CONFIG || {};
  const configured = Boolean(
    cfg.url && cfg.publishableKey &&
    !cfg.url.includes('YOUR-PROJECT-REF') &&
    !cfg.publishableKey.includes('YOUR_SUPABASE')
  );

  window.MuliaSupabase = {
    configured,
    client: configured && window.supabase
      ? window.supabase.createClient(cfg.url, cfg.publishableKey)
      : null,

    async requireSession() {
      if (!this.configured || !this.client) {
        window.location.href = 'setup.html';
        return null;
      }
      const { data, error } = await this.client.auth.getSession();
      if (error || !data.session) {
        window.location.href = 'index.html';
        return null;
      }
      return data.session;
    },

    async getProfile() {
      if (!this.client) throw new Error('Supabase belum dikonfigurasi.');
      const { data: authData, error: authError } = await this.client.auth.getUser();
      if (authError || !authData.user) throw new Error('Sesi tidak sah. Sila log masuk semula.');
      const { data, error } = await this.client
        .from('user_profiles')
        .select('id, full_name, role')
        .eq('id', authData.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Profil aplikasi belum diwujudkan. Minta admin sediakan akses anda.');
      if (!['admin', 'technician'].includes(data.role)) throw new Error('Role akaun tidak dibenarkan.');
      return data;
    },

    async signOut() {
      if (this.client) await this.client.auth.signOut();
      window.location.href = 'index.html';
    },

    async writeAudit(action, entityType, entityId, details = {}) {
      if (!this.client) return;
      const { data } = await this.client.auth.getUser();
      if (!data.user) return;
      const { error } = await this.client.from('audit_log').insert({
        actor_id: data.user.id, action, entity_type: entityType,
        entity_id: entityId == null ? null : String(entityId), details
      });
      if (error) console.warn('Audit log insert failed:', error.message);
    },

    escapeHTML(value) {
      return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[ch]);
    }
  };
})();
