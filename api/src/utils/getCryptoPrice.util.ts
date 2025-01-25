export const getCryptoPrice = (amount: string, cryptoValue: string) => {
  const parsedAmount = parseFloat(amount);
  const parsedCryptoValue = parseFloat(cryptoValue);

  const cryptoToBuy = parsedAmount / parsedCryptoValue;

  return cryptoToBuy.toFixed(8).toString();
};
