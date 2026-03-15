import fs from 'fs/promises';

const CONFIG_PATH = '/home/ubuntu/clawd/config/ms-graph.json';
const SEND_AS = 'lance@lancepederson.com';

type GraphConfig = {
  tenant_id: string;
  client_id: string;
  client_secret: string;
  scope: string;
  send_as?: string;
};

async function getGraphConfig(): Promise<GraphConfig> {
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw) as GraphConfig;
}

export async function getMicrosoftGraphAccessToken() {
  const config = await getGraphConfig();
  const response = await fetch(`https://login.microsoftonline.com/${config.tenant_id}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.client_id,
      client_secret: config.client_secret,
      scope: config.scope,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Microsoft Graph token: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

export async function sendMailWithAttachment({
  to,
  subject,
  html,
  filename,
  contentBytes,
}: {
  to: string;
  subject: string;
  html: string;
  filename: string;
  contentBytes: string;
}) {
  const token = await getMicrosoftGraphAccessToken();
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${SEND_AS}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: 'HTML',
          content: html,
        },
        toRecipients: [{
          emailAddress: { address: to },
        }],
        attachments: [{
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: filename,
          contentType: 'application/pdf',
          contentBytes,
        }],
      },
      saveToSentItems: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send Microsoft Graph email: ${response.status} ${await response.text()}`);
  }
}
