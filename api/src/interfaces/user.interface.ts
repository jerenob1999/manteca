export interface PrettyUser {
  numberId: string;
  userId: string;
  companyId: string;
  name: string;
  email: string;
  cuit: string;
  phoneNumber: string;
  civilState: string;
  country: string;
  creationTime: Date;
  exchangeCountry: string;
  balance: UserBalance;
  bankAccounts: {
    [coin: string]: BankAccount[];
  };
  addresses: {
    evm: string;
    terra: string;
  };
  clientId?: string;
  clientAddress?: string;
}

export interface BankAccount {
  description: string;
  cbu: string;
  bankCode: string;
  bankName: string;
  cvu: boolean;
  actualCbu: string;
}

export interface CryptoBalance {
  [coin: string]: {
    amount: string;
    weiAmount: string;
  };
}

export interface UserBalance {
  fiat: {
    [coin: string]: { amount: string };
    ARS: { amount: string };
    USD: { amount: string };
  };
  crypto: CryptoBalance;
}
