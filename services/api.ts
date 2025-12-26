
import { WeatherData, CryptoData, VisitorInfo, MarketData } from '../types';

export const fetchWeather = async (city: string): Promise<WeatherData> => {
  const mockTemps: Record<string, number> = { 'Seoul': 22, 'Busan': 24 };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        city,
        temp: mockTemps[city] || 20,
        description: 'Clear Sky'
      });
    }, 500);
  });
};


export const fetchMarketData = async (): Promise<{ usd: MarketData, kospi: MarketData, btc: CryptoData, eth: CryptoData }> => {
  try {
    const [btcRes, ethRes, usdRes] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
    ]);

    const btcData = await btcRes.json();
    const ethData = await ethRes.json();
    const usdData = await usdRes.json();

    const exchangeRate = usdData.rates.KRW;
    const kospiValue = 2650 + (Math.random() * 20 - 10); // Simulated KOSPI variation for aliveness

    return {
      usd: {
        name: '달러/원',
        value: `${Math.floor(exchangeRate).toLocaleString()}원`,
        isUp: exchangeRate > 1400 // Simple logic, normally requires prev close
      },
      kospi: {
        name: '코스피',
        value: kospiValue.toFixed(2),
        isUp: kospiValue >= 2650
      },
      btc: {
        symbol: 'BTC',
        priceUsd: parseFloat(btcData.price).toLocaleString(),
        priceKrw: (parseFloat(btcData.price) * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })
      },
      eth: {
        symbol: 'ETH',
        priceUsd: parseFloat(ethData.price).toLocaleString(),
        priceKrw: (parseFloat(ethData.price) * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })
      }
    };
  } catch (error) {
    return {
      usd: { name: '달러/원', value: '---' },
      kospi: { name: '코스피', value: '---' },
      btc: { symbol: 'BTC', priceUsd: '0', priceKrw: '0' },
      eth: { symbol: 'ETH', priceUsd: '0', priceKrw: '0' }
    };
  }
};

export const getVisitorIpInfo = async (): Promise<VisitorInfo> => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const device = /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    return {
      id: Math.random().toString(36).substr(2, 9),
      ip: data.ip,
      country: data.country_name,
      device: device,
      accessTime: new Date().toLocaleString()
    };
  } catch (error) {
    return {
      id: 'error', ip: 'Unknown', country: 'Unknown', device: 'Unknown', accessTime: new Date().toLocaleString()
    };
  }
};
