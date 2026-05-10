export interface ApiHttpClient {
  request: (request: Request) => Promise<Response>;
}
