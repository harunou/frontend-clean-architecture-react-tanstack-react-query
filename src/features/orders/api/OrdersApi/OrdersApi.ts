import type { ApiHttpClient } from "../types";
import { HttpClient } from "../httpClient";
import type { OrderDto } from "./OrdersApi.types";

const baseUrl = import.meta.env.BASE_URL;
export const ordersApiUrl = `${baseUrl}api/orders`;

export class OrdersApi {
  static make(): OrdersApi {
    return new OrdersApi(HttpClient.make());
  }

  private ordersApiUrl = ordersApiUrl;

  constructor(private readonly httpClient: ApiHttpClient) {}

  async getOrders(): Promise<OrderDto[]> {
    const request = new Request(new URL(this.ordersApiUrl), {
      method: "GET",
    });
    const response = await this.httpClient.request(request);
    return response.json();
  }

  async getOrder(id: string): Promise<OrderDto> {
    const request = new Request(new URL(`${this.ordersApiUrl}/${id}`), {
      method: "GET",
    });
    const response = await this.httpClient.request(request);
    return response.json();
  }

  async updateOrder(id: string, order: Partial<OrderDto>): Promise<void> {
    const request = new Request(new URL(`${this.ordersApiUrl}/${id}`), {
      method: "PUT",
      body: JSON.stringify(order),
    });
    await this.httpClient.request(request);
  }

  async deleteOrder(id: string): Promise<void> {
    const request = new Request(new URL(`${this.ordersApiUrl}/${id}`), {
      method: "DELETE",
    });
    await this.httpClient.request(request);
  }
}
