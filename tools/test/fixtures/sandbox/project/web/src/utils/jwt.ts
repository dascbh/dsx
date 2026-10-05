export function isAdminFromClaims(payload: Record<string, unknown>) {
  const groups = (payload['cognito:groups'] as string[] | undefined) ?? [];
  return groups.includes('Admins');
}
export const orgOf = (payload: Record<string, unknown>) => payload['custom:org_id'] as string;
