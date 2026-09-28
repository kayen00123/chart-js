# FCS Chart - Fork with Custom Data Injection

**Extended version of [fcsapi/chart-js](https://github.com/fcsapi/chart-js) with custom OHLC data injection support.**

This fork adds the ability to feed your own custom trading pairs and price history directly from your backend, while keeping all the original features (60+ indicators, drawing tools, themes, etc.).

## What's New in This Fork

✨ **Custom Data Injection API** — Feed your own OHLC data instead of relying on FCS API
```javascript
const chart = new FCSAPIChart({
    container: document.getElementById('fcs_chart'),
    parentid: 'fcs_chartparent',
    enableCustomData: true  // Enable custom data mode (no API key needed)
});

// Feed custom data from your backend
const customData = [
    { time: 1234567890, open: 100, high: 105, low: 99, close: 102, volume: 1000 },
    { time: 1234567891, open: 102, high: 108, low: 100, close: 106, volume: 1200 },
];

chart.setCustomData('CUSTOM:PAIR', customData);
```

✅ **All Original Features Intact**
- 60+ Technical indicators (RSI, MACD, Bollinger Bands, etc.)
- Professional drawing tools
- 8 chart types (Candlestick, OHLC, Line, Area, etc.)
- Dark & Light themes
- Mobile responsive
- No external dependencies

## Installation

### From GitHub CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kayen00123/chart-js@main/src/fcsapi-chart.css">
<script src="https://cdn.jsdelivr.net/gh/kayen00123/chart-js@main/src/fcsapi-chart.js"></script>
```

### Self-Hosted

```bash
git clone https://github.com/kayen00123/chart-js.git
cd chart-js
```

## Quick Start - Custom Data

```html
<!DOCTYPE html>
<html>
<head>
    <title>Custom Chart</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kayen00123/chart-js@main/src/fcsapi-chart.css">
    <style>
        #fcs_chartparent { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="fcs_chartparent">
        <div id="fcs_chart"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/gh/kayen00123/chart-js@main/src/fcsapi-chart.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/kayen00123/chart-js@main/custom-data-adapter.js"></script>
    <script>
        const chart = new FCSAPIChart({
            container: document.getElementById('fcs_chart'),
            parentid: 'fcs_chartparent',
            enableCustomData: true,
            theme: 'dark',
            defaultChartType: 'candlestick'
        });

        // Fetch from your backend
        fetch('/api/chart-data?symbol=CUSTOM:BTC&period=1h')
            .then(res => res.json())
            .then(data => {
                // data format: { symbol: 'CUSTOM:BTC', candles: [{time, open, high, low, close, volume}, ...] }
                chart.setCustomData(data.symbol, data.candles);
            });
    </script>
</body>
</html>
```

## Custom Data Format

Each candle object should have:

```javascript
{
    time: 1234567890,      // Unix timestamp (required)
    open: 100,             // Opening price (required)
    high: 105,             // High price (required)
    low: 99,               // Low price (required)
    close: 102,            // Closing price (required)
    volume: 1000           // Trading volume (optional)
}
```

## API Methods (Custom Data Mode)

### setCustomData(symbol, candles)

Set or update chart data:

```javascript
const candles = [
    { time: 1234567890, open: 100, high: 105, low: 99, close: 102, volume: 1000 },
    { time: 1234567891, open: 102, high: 108, low: 100, close: 106, volume: 1200 }
];

chart.setCustomData('MY:CUSTOM_PAIR', candles);
```

### appendCandle(candle)

Append a single new candle (for real-time updates):

```javascript
const newCandle = { time: 1234567892, open: 106, high: 110, low: 105, close: 109, volume: 1500 };
chart.appendCandle(newCandle);
```

### getCustomData()

Retrieve current chart data:

```javascript
const currentData = chart.getCustomData();
console.log(currentData); // { symbol: 'MY:CUSTOM_PAIR', candles: [...] }
```

## Original Features (FCS API)

All original documentation at [fcsapi.com/document/chart-api](https://fcsapi.com/document/chart-api)

### Configuration

```javascript
const chart = new FCSAPIChart({
    // Original FCS API mode
    accessKey: 'YOUR_API_KEY',
    symbol: 'BINANCE:BTCUSDT',
    period: '1H',
    
    // Or custom data mode
    enableCustomData: true,
    
    // Common options
    theme: 'dark',
    defaultChartType: 'candlestick',
    enableSidebar: true,
    enableToolbar: true,
    enableIndicators: true,
    enableDrawingTools: true,
    timezone: 'local'
});
```

### All Original Methods Still Work

```javascript
chart.setTheme('light');
chart.setChartType('line');
chart.addHorizontalLine({ price: 100, label: 'Support' });
const img = chart.exportImage();
chart.resize();
```

## Use Cases

- 🏦 **Trading Platforms** — Display custom trading pairs from your backend
- 💱 **Forex Apps** — Render your own currency data
- 🪙 **Crypto Dashboards** — Chart custom crypto portfolios or altcoins
- 📈 **Analytics** — Visualize computed price predictions or models
- 🤖 **Backtesting** — Show simulated trading scenarios
- 📊 **Custom Markets** — Any custom OHLC data source

## Development

### Structure

```
.
├── src/
│   ├── fcsapi-chart.js          # Main chart library (original)
│   └── fcsapi-chart.css         # Chart styles (original)
├── custom-data-adapter.js       # Custom data injection wrapper
├── examples/
│   ├── custom-data.html         # Custom data example
│   ├── custom-data-realtime.html # Real-time updates example
│   └── original/                # Original FCS API examples
└── README.md
```

## License

MIT License - See LICENSE file

Free for personal and commercial use.

## Original Repository

- **Original:** [fcsapi/chart-js](https://github.com/fcsapi/chart-js)
- **Original Docs:** [fcsapi.com/document/chart-api](https://fcsapi.com/document/chart-api)
- **FCS API:** [fcsapi.com](https://fcsapi.com)

## Support

- Fork issues: Create a GitHub issue in this repo
- Original library issues: See [fcsapi/chart-js/issues](https://github.com/fcsapi/chart-js/issues)
- Email: support@fcsapi.com (for original library)
