import { supabase } from "@/integrations/supabase/client";

export async function logAudit(params: {
  action: "create" | "delete";
  entityType: "community" | "address";
  entityId: string;
  entityName?: string;
  details?: Record<string, unknown>;
  userId: string;
}) {
  await supabase.from("audit_log").insert({
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    entity_name: params.entityName ?? null,
    details: params.details ?? null,
    user_id: params.userId,
  } as any);
}
