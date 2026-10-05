export const ATTACHMENTS_HOST_FORMAT = /^attachments-[0-9]{12}\.s3\.[a-z0-9-]+\.amazonaws\.com$/;
export const attachmentsHost = () => {
  const host = import.meta.env.VITE_ATTACHMENTS_HOST;
  if (!ATTACHMENTS_HOST_FORMAT.test(host)) throw new Error('invalid attachments host');
  return host;
};
export const SAFE_HEADER = /^[\t\x20-\x7e]*$/;
