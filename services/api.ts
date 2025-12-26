
import { WeatherData, CryptoData, VisitorInfo } from '../types';

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

export const fetchCryptoPrices = async (): Promise<{btc: CryptoData, eth: CryptoData}> => {
  try {
    const [btcRes, ethRes] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT')
    ]);
    const btcData = await btcRes.json();
    const ethData = await ethRes.json();
    
    const exchangeRate = 1380;
    
    return {
      btc: {
        symbol: 'BTC',
        priceUsd: parseFloat(btcData.price).toLocaleString(),
        priceKrw: (parseFloat(btcData.price) * exchangeRate).toLocaleString()
      },
      eth: {
        symbol: 'ETH',
        priceUsd: parseFloat(ethData.price).toLocaleString(),
        priceKrw: (parseFloat(ethData.price) * exchangeRate).toLocaleString()
      }
    };
  } catch (error) {
    return {
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
