
export interface Shortcut {
  label: string;
  url: string;
  icon: string;
}

export interface WeatherData {
  temp: number;
  description: string;
  city: string;
}

export interface CryptoData {
  symbol: string;
  priceUsd: string;
  priceKrw: string;
}

export interface VisitorInfo {
  id: string;
  ip: string;
  country: string;
  device: string;
  accessTime: string;
}

export interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
