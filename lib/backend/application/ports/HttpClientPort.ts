export type HttpClientPort = (
  input: URL | (string | Request), 
  init?: RequestInit | undefined
) => Promise<Response>;