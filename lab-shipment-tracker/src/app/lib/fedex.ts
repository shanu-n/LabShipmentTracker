import axios from 'axios';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';


dotenv.config();

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// ✅ Determine mode (sandbox or production)
const isSandbox = process.env.FEDEX_MODE === 'sandbox';

const tokenUrl = isSandbox
  ? 'https://apis-sandbox.fedex.com/oauth/token'
  : 'https://apis.fedex.com/oauth/token';

const trackingUrl = isSandbox
  ? 'https://apis-sandbox.fedex.com/track/v1/trackingnumbers'
  : 'https://apis.fedex.com/track/v1/trackingnumbers';

async function getFedExAccessToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.FEDEX_CLIENT_ID!,
    client_secret: process.env.FEDEX_CLIENT_SECRET!,
  });

  try {
    const response = await axios.post(tokenUrl, body, { headers });
    const data = response.data as any;

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;

    if (!cachedToken) throw new Error('Token not available');
    return cachedToken;
  } catch (err: any) {
    console.error('❌ Failed to get FedEx access token:', err?.response?.data || err);
    throw err;
  }
}

export async function fetchFedExStatus(trackingNumber: string): Promise<string | null> {
  const token = await getFedExAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const body = {
    trackingInfo: [
      {
        trackingNumberInfo: {
          trackingNumber,
        },
      },
    ],
    includeDetailedScans: false,
  };

  try {
    const response = await axios.post(trackingUrl, body, { headers });
    const data = response.data as any;

    const result = data.output?.completeTrackResults?.[0]?.trackResults?.[0];
    const status = result?.latestStatusDetail?.description || null;

    console.log(`✅ FedEx Status for ${trackingNumber}: ${status}`);
    return status;
  } catch (err: any) {
    console.error(`❌ FedEx tracking failed for ${trackingNumber}:`, err?.response?.data || err);
    return null;
  }
}

// ...existing code until fetchFedExExpDate...

export async function fetchFedExExpDate(trackingNumber: string): Promise<DateTime | null> {
  const token = await getFedExAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const body = {
    trackingInfo: [
      {
        trackingNumberInfo: {
          trackingNumber,
        },
      },
    ],
    includeDetailedScans: true,
  };

  try {
    const response = await axios.post(trackingUrl, body, { headers });
    const data = response.data as any;

    const result = data.output?.completeTrackResults?.[0]?.trackResults?.[0];

    const actualDeliveryObj = result?.dateAndTimes?.find(
      (t: any) => t.type === 'ACTUAL_DELIVERY'
    );

    const actualDelivery = actualDeliveryObj?.dateTime;
    const estimatedDelivery = result?.estimatedDeliveryTimeWindow?.window?.ends;

    const rawDate = actualDelivery ?? estimatedDelivery;

    if (!rawDate) {
      console.log(`ℹ️ No delivery or expected date for ${trackingNumber}`);
      return null;
    }

    // ✅ Force convert from UTC to America/Los_Angeles
    const deliveryDate = DateTime.fromISO(rawDate, { zone: 'utc' }).setZone('America/Los_Angeles');

    console.log(
      `✅ Delivery for ${trackingNumber} (${actualDelivery ? 'Actual' : 'Expected'}): ${deliveryDate.toLocaleString(
        DateTime.DATETIME_FULL
      )}`
    );

    return deliveryDate;
  } catch (err: any) {
    console.error(`❌ FedEx delivery date fetch failed for ${trackingNumber}:`, err?.response?.data || err);
    return null;
  }
}
