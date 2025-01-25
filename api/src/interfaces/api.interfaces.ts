export interface LockPriceResponse {
  code: string;
  price: string;
  expires: string;
}

export interface NewDepositEventBody {
  data: EventData;
  event: string;
}

export interface EventData {
  amount: string;
  asset: string;
  companyId: string;
  creationTime: string;
  id: string;
  numberId: string;
  network: string;
  networkId: string;
  networkType: string;
  status: string;
  updatedAt: string;
  userId: string;
  userLegalId: string;
  userNumberId: string;
  userExternalId: string;
}

export interface PriceCoinResponse {
  coin: string;
  timestamp: string;
  buy: string;
  sell: string;
  variation: Variation;
}

export interface Variation {
  realtime: string;
  daily: string;
}
