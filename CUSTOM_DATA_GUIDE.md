# Custom Data Integration Guide

## Quick Start

### 1. Frontend Setup

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kayen00123/chart-js@main/src/fcsapi-chart.css">
</head>
<body>
    <div id="fcs_chartparent">
        <div id="fcs_chart"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/kayen00123/chart-js@main/src/fcsapi-chart.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/kayen00123/chart-js@main/custom-data-adapter.js"></script>

    <script>
        // Initialize chart with custom data mode
        const chart = new FCSAPIChart({
            container: document.getElementById('fcs_chart'),
            parentid: 'fcs_chartparent',
            enableCustomData: true,  // Enable custom data mode
            theme: 'dark'
        });

        // Fetch from your backend
        fetch('/api/chart-data?symbol=CUSTOM:BTCUSD&period=1h')
            .then(res => res.json())
            .then(data => {
                chart.setCustomData(data.symbol, data.candles);
            });
    </script>
</body>
</html>
```

### 2. Backend Setup

**Node.js/Express Example:**

```javascript
const express = require('express');
const app = express();

app.get('/api/chart-data', (req, res) => {
    const { symbol, period } = req.query;
    
    // Fetch or compute OHLC data
    const candles = getOHLCData(symbol, period);
    
    res.json({
        symbol,
        period,
        candles
    });
});

app.listen(3000);
```

---

## API Reference

### Frontend Methods

#### `chart.setCustomData(symbol, candles)`

Set the chart data.

**Parameters:**
- `symbol` (string): Symbol name (e.g., 'CUSTOM:BTCUSD')
- `candles` (array): Array of candle objects

**Candle Format:**
```javascript
{
    time: 1234567890,      // Unix timestamp (required)
    open: 100,             // Opening price (required)
    high: 105,             // High price (required)
    low: 99,               // Low price (required)
    close: 102,            // Closing price (required)
    volume: 1000           // Volume (optional)
}
```

**Example:**
```javascript
const candles = [
    { time: 1234567890, open: 100, high: 105, low: 99, close: 102, volume: 1000 },
    { time: 1234567891, open: 102, high: 108, low: 100, close: 106, volume: 1200 }
];

chart.setCustomData('CUSTOM:BTCUSD', candles);
```

#### `chart.appendCandle(candle)`

Append a single new candle (for real-time updates).

**Parameters:**
- `candle` (object): Single candle object with same format as above

**Example:**
```javascript
const newCandle = { 
    time: 1234567892, 
    open: 106, 
    high: 110, 
    low: 105, 
    close: 109, 
    volume: 1500 
};

chart.appendCandle(newCandle);
```

#### `chart.getCustomData()`

Get current chart data.

**Returns:**
```javascript
{
    symbol: 'CUSTOM:BTCUSD',
    candles: [...],
    count: 100
}
```

#### `chart.clearCustomData()`

Clear all custom data.

```javascript
chart.clearCustomData();
```

---

## Backend API Format

### Request

```
GET /api/chart-data?symbol=CUSTOM:BTCUSD&period=1h&limit=200
```

**Query Parameters:**
- `symbol` (required): Symbol identifier
- `period` (optional): Timeframe (1m, 5m, 15m, 30m, 1h, 4h, 1D, 1W, 1M)
- `limit` (optional): Number of candles (default 200)

### Response

```json
{
  "symbol": "CUSTOM:BTCUSD",
  "period": "1h",
  "candles": [
    {
      "time": 1694000000,
      "open": 50000,
      "high": 50500,
      "low": 49800,
      "close": 50200,
      "volume": 150000
    },
    {
      "time": 1694003600,
      "open": 50200,
      "high": 50800,
      "low": 50000,
      "close": 50600,
      "volume": 180000
    }
  ],
  "timestamp": 1694100000
}
```

---

## Real-Time Updates

### WebSocket Example

**Frontend:**
```javascript
const ws = new WebSocket('ws://your-server.com/api/chart-data/realtime/CUSTOM:BTCUSD');

ws.onmessage = (event) => {
    const candle = JSON.parse(event.data);
    chart.appendCandle(candle);
};
```

**Backend:**
```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    const interval = setInterval(() => {
        const latestCandle = getLatestCandle();
        ws.send(JSON.stringify(latestCandle));
    }, 2000);

    ws.on('close', () => clearInterval(interval));
});
```

### Polling Example (Simpler)

**Frontend:**
```javascript
setInterval(() => {
    fetch('/api/chart-data/latest?symbol=CUSTOM:BTCUSD')
        .then(res => res.json())
        .then(candle => chart.appendCandle(candle));
}, 2000);
```

---

## Use Cases

### 1. Trading Platform with Custom Pairs

```javascript
// User selects a custom trading pair
const pair = 'CUSTOM:MY_PORTFOLIO';

// Backend computes weighted average price from portfolio
const portfolioCandles = computePortfolioOHLC(userPortfolio);

// Send to frontend
res.json({
    symbol: pair,
    candles: portfolioCandles
});
```

### 2. Backtesting Results

```javascript
// Backend simulates trading strategy
const backtest = runBacktest(strategy, historicalData);

// Return simulated price movements
res.json({
    symbol: 'BACKTEST:EURUSD',
    candles: backtest.candles
});
```

### 3. Live Algorithm Output

```javascript
// Real-time price from your algorithm
const algorithmPrice = runPricingAlgorithm();

ws.send(JSON.stringify({
    time: Math.floor(Date.now() / 1000),
    open: algorithmPrice.bid,
    high: algorithmPrice.bid * 1.01,
    low: algorithmPrice.bid * 0.99,
    close: algorithmPrice.ask,
    volume: algorithmPrice.volume
}));
```

### 4. Crypto Portfolio Tracker

```javascript
// Get user's holdings
const holdings = getUserHoldings(userId);

// Compute portfolio OHLC
const portfolioCandles = [];
holdingsHistory.forEach(point => {
    portfolioCandles.push({
        time: point.timestamp,
        open: point.portfolioValue,
        high: point.portfolioHigh,
        low: point.portfolioLow,
        close: point.portfolioClose,
        volume: point.tradingVolume
    });
});

res.json({
    symbol: `PORTFOLIO:${userId}`,
    candles: portfolioCandles
});
```

---

## Data Sources

### Option 1: Your Own Database

```javascript
// MongoDB Example
const candles = await db.collection('candles')
    .find({ symbol, period })
    .limit(200)
    .toArray();
```

### Option 2: External APIs

```javascript
// Fetch from Binance, FCS API, etc.
const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${period}`);
const data = await response.json();
const candles = data.map(d => ({
    time: d[0] / 1000,
    open: parseFloat(d[1]),
    high: parseFloat(d[2]),
    low: parseFloat(d[3]),
    close: parseFloat(d[4]),
    volume: parseFloat(d[7])
}));
```

### Option 3: Computed Data

```javascript
// Compute from your business logic
const candles = [];
for (let i = 0; i < 100; i++) {
    candles.push({
        time: startTime + (i * period),
        open: computeOpen(data[i]),
        high: computeHigh(data[i]),
        low: computeLow(data[i]),
        close: computeClose(data[i]),
        volume: computeVolume(data[i])
    });
}
```

---

## Error Handling

**Frontend:**
```javascript
fetch('/api/chart-data?symbol=CUSTOM:BTCUSD')
    .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    })
    .then(data => {
        if (!data.candles || data.candles.length === 0) {
            console.error('No data received');
            return;
        }
        chart.setCustomData(data.symbol, data.candles);
    })
    .catch(err => console.error('Chart data error:', err));
```

**Backend:**
```javascript
app.get('/api/chart-data', (req, res) => {
    try {
        const { symbol } = req.query;
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol required' });
        }
        
        const candles = getOHLCData(symbol);
        if (!candles) {
            return res.status(404).json({ error: 'No data found' });
        }
        
        res.json({ symbol, candles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## Performance Tips

1. **Pagination**: Limit initial load to 200-500 candles, fetch more on scroll
2. **Caching**: Cache API responses with appropriate TTL
3. **Compression**: Use gzip for large responses
4. **Indexing**: Index database queries by symbol and timestamp
5. **Real-time**: Use WebSockets instead of polling for live data

---

## Troubleshooting

### Chart not loading data?
- Check browser console for errors
- Verify CORS headers are set correctly
- Ensure candle format matches specification
- Check timestamp is Unix (seconds), not milliseconds

### Real-time updates not working?
- Verify WebSocket connection
- Check that `appendCandle()` is being called
- Ensure timestamp updates each candle

### Performance issues?
- Reduce candle limit
- Use pagination
- Cache responses
- Consider WebSocket over HTTP polling

---

## Support

- **Examples**: See `/examples/` directory
- **Source**: https://github.com/kayen00123/chart-js
- **Original Docs**: https://fcsapi.com/document/chart-api
