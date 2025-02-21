import axios, { AxiosInstance } from "axios";
import qs from "qs";
import { PrettyUser } from "../interfaces/user.interface";
import {
  LockPrice,
  LockPriceBody,
  PriceCoin,
  NewOrderBody,
} from "../interfaces/manteca.interfaces";

const BASE_URL = "http://sandbox.manteca.dev/crypto/v1/";

export default class MantecaService {
  private static instance: MantecaService;
  private axiosClient: AxiosInstance;

  private constructor(apiKey?: string) {
    this.axiosClient = axios.create({
      baseURL: BASE_URL,
      headers: { "x-api-key": apiKey },
      paramsSerializer: (params) => {
        return qs.stringify(params, { indices: false });
      },
    });
  }

  static getInstance = (apiKey?: string) => {
    if (!MantecaService.instance) {
      MantecaService.instance = new MantecaService(apiKey);
    }
    return MantecaService.instance;
  };

  // GET specific user with userId
  async getUserById(numberId: string): Promise<PrettyUser> {
    const result = await this.axiosClient.get(`user/${numberId}`);
    return result.data;
  }

  // GET specific balance from user with userId
  async getUserBalanceById(userId: string) {
    const result = await this.axiosClient.get(`/user/${userId}/balance`);
    return result.data;
  }

  // GET current coin price
  async getCoinPrice(asset: string): Promise<PriceCoin> {
    const result = await this.axiosClient.get(`/price/${asset}`);
    return result.data;
  }

  // POST price locks coin to current market value
  async lockPrice(body: LockPriceBody): Promise<LockPrice> {
    const result = await this.axiosClient.post("order/lock", body);
    return result.data;
  }

  // POST a new order
  async postOrder(body: NewOrderBody) {
    const result = await this.axiosClient.post("order", body);
    return result.data;
  }
}
