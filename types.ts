
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


export interface MarketData {
  name: string;
  value: string;
  change?: string;
  isUp?: boolean;
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

export interface Dday {
  id: string;
  title: string;
  date: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastChecked: string | null;
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
}
