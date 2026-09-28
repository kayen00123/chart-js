/**
 * Backend API Example - Node.js/Express
 * 
 * This shows how to serve custom OHLC data to your frontend chart
 * from your backend database or computed sources.
 */

// ============================================
// EXAMPLE 1: Simple Express Backend
// ============================================

const express = require('express');
const app = express();

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

/**
 * GET /api/chart-data
 * 
 * Query params:
 *   - symbol: e.g., 'CUSTOM:BTCUSD'
 *   - period: e.g., '1h', '4h', '1D'
 *   - limit: number of candles to return (default 200)
 * 
 * Returns:
 *   {
 *     symbol: 'CUSTOM:BTCUSD',
 *     period: '1h',
 *     candles: [
 *       { time: 1234567890, open: 100, high: 105, low: 99, close: 102, volume: 1000 },
 *       ...\n *     ]\n *   }\n */\napp.get('/api/chart-data', (req, res) => {\n    const { symbol, period = '1h', limit = 200 } = req.query;\n\n    if (!symbol) {\n        return res.status(400).json({ error: 'Symbol is required' });\n    }\n\n    try {\n        // TODO: Fetch your data from database, API, or compute it\n        const candles = getOHLCData(symbol, period, parseInt(limit));\n\n        res.json({\n            symbol,\n            period,\n            candles,\n            timestamp: Date.now()\n        });\n    } catch (error) {\n        res.status(500).json({ error: error.message });\n    }\n});\n\n/**\n * GET /api/chart-data/realtime/:symbol\n * WebSocket endpoint for real-time updates\n */\nconst WebSocket = require('ws');\nconst wss = new WebSocket.Server({ noServer: true });\n\napp.get('/api/chart-data/realtime/:symbol', (req, res) => {\n    const { symbol } = req.params;\n    \n    // Upgrade to WebSocket\n    const ws = new WebSocket();\n    \n    // Send live candle updates\n    const interval = setInterval(() => {\n        const candle = getLatestCandle(symbol);\n        ws.send(JSON.stringify(candle));\n    }, 2000);\n\n    ws.on('close', () => clearInterval(interval));\n});\n\n// ============================================\n// DATABASE/DATA RETRIEVAL EXAMPLES\n// ============================================\n\n/**\n * Example 1: Fetch from your database\n */\nfunction getOHLCData(symbol, period, limit) {\n    // Example: Query MongoDB\n    // const collection = db.collection('candles');\n    // return collection.find({ symbol, period }).limit(limit).toArray();\n\n    // Mock data for example\n    return generateMockCandles(symbol, limit);\n}\n\n/**\n * Example 2: Compute from raw tick data\n */\nfunction computeOHLCFromTicks(symbol, ticks, period) {\n    // Group ticks by period\n    const candles = [];\n    let currentCandle = null;\n\n    ticks.forEach(tick => {\n        const time = Math.floor(tick.timestamp / getPeriodMillis(period)) * getPeriodMillis(period);\n\n        if (!currentCandle || currentCandle.time !== time) {\n            if (currentCandle) candles.push(currentCandle);\n            currentCandle = {\n                time,\n                open: tick.price,\n                high: tick.price,\n                low: tick.price,\n                close: tick.price,\n                volume: tick.size\n            };\n        } else {\n            currentCandle.high = Math.max(currentCandle.high, tick.price);\n            currentCandle.low = Math.min(currentCandle.low, tick.price);\n            currentCandle.close = tick.price;\n            currentCandle.volume += tick.size;\n        }\n    });\n\n    return candles;\n}\n\n/**\n * Example 3: Aggregate from external API (FCS API, Binance, etc.)\n */\nasync function fetchFromFCSAPI(symbol, period, limit) {\n    const apiKey = process.env.FCS_API_KEY;\n    const url = `https://api.fcsapi.com/v1/candle?symbol=${symbol}&period=${period}&limit=${limit}`;\n\n    const response = await fetch(url, {\n        headers: { 'Authorization': `Bearer ${apiKey}` }\n    });\n\n    const data = await response.json();\n    return data.candles;\n}\n\n/**\n * Example 4: Transform data (e.g., apply indicators, backtesting results)\n */\nfunction transformWithIndicators(candles) {\n    // Add SMA, RSI, MACD, etc.\n    // This is where you can add your trading logic\n\n    return candles.map((candle, index) => ({\n        ...candle,\n        // sma20: calculateSMA(candles, index, 20),\n        // rsi: calculateRSI(candles, index, 14),\n        // signal: myTradingSignal(candle, index)\n    }));\n}\n\n// ============================================\n// HELPER FUNCTIONS\n// ============================================\n\nfunction generateMockCandles(symbol, count) {\n    const candles = [];\n    let price = 50000;\n    let time = Math.floor(Date.now() / 1000) - (count * 3600);\n\n    for (let i = 0; i < count; i++) {\n        const variance = (Math.random() - 0.5) * 1000;\n        const open = price + variance;\n        const close = open + (Math.random() - 0.5) * 1000;\n        const high = Math.max(open, close) + Math.random() * 500;\n        const low = Math.min(open, close) - Math.random() * 500;\n\n        candles.push({\n            time: time + (i * 3600),\n            open: parseFloat(open.toFixed(2)),\n            high: parseFloat(high.toFixed(2)),\n            low: parseFloat(low.toFixed(2)),\n            close: parseFloat(close.toFixed(2)),\n            volume: Math.floor(Math.random() * 100000)\n        });\n\n        price = close;\n    }\n\n    return candles;\n}\n\nfunction getLatestCandle(symbol) {\n    // Return the latest candle for real-time updates\n    return {\n        time: Math.floor(Date.now() / 1000),\n        open: Math.random() * 10000,\n        high: Math.random() * 10000,\n        low: Math.random() * 10000,\n        close: Math.random() * 10000,\n        volume: Math.random() * 100000\n    };\n}\n\nfunction getPeriodMillis(period) {\n    const periods = {\n        '1m': 60 * 1000,\n        '5m': 5 * 60 * 1000,\n        '15m': 15 * 60 * 1000,\n        '1h': 60 * 60 * 1000,\n        '4h': 4 * 60 * 60 * 1000,\n        '1D': 24 * 60 * 60 * 1000\n    };\n    return periods[period] || 60 * 60 * 1000;\n}\n\n// ============================================\n// ERROR HANDLING\n// ============================================\n\napp.use((err, req, res, next) => {\n    console.error(err);\n    res.status(500).json({ \n        error: process.env.NODE_ENV === 'production' \n            ? 'Internal Server Error' \n            : err.message \n    });\n});\n\n// ============================================\n// START SERVER\n// ============================================\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => {\n    console.log(`Chart Data API running on http://localhost:${PORT}`);\n    console.log(`GET /api/chart-data?symbol=CUSTOM:BTCUSD&period=1h`);\n});\n\nmodule.exports = app;\n