"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedMainStrategy = void 0;
const technicalindicators_1 = require("technicalindicators");
const res_1 = require("../../model/res");
const site_1 = require("../../site");
const boolean_threshold_1 = require("../../model/boolean_threshold");
const direction_1 = require("../direction");
class ExtendedMainStrategy {
    run(symbol, iterationID, open, close, high, low, baseVolume, quoteVolume, usdtVolume, callback) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        let buy = false;
        let sell = false;
        let desc = "";
        // PREREQUISITES
        const dirLength = site_1.Site.directionLength;
        const volume = usdtVolume;
        const csd = { open, close, high, low };
        const latestRate = close[close.length - 1];
        // PRIMARY INDICATORS
        const macd = technicalindicators_1.MACD.calculate({ values: close, fastPeriod: site_1.Site.MACDFastPeriod, slowPeriod: site_1.Site.MACDSlowPeriod, signalPeriod: site_1.Site.MACDSignalPeriod, SimpleMAOscillator: false, SimpleMASignal: false });
        const psar = technicalindicators_1.PSAR.calculate({ high, low, step: site_1.Site.PSARStep, max: site_1.Site.PSARMax });
        const stoch = technicalindicators_1.Stochastic.calculate({ close, high, low, period: site_1.Site.StochPeriod, signalPeriod: site_1.Site.StochSignalPeriod });
        // PRIMARY BOOLEANS
        const macdBull = macd.length > 0 ? (((macd[macd.length - 1].MACD || macd[macd.length - 1].MACD === 0) && (macd[macd.length - 1].signal || macd[macd.length - 1].signal === 0)) ? macd[macd.length - 1].MACD > macd[macd.length - 1].signal : false) : false;
        const macdBear = macd.length > 0 ? (((macd[macd.length - 1].MACD || macd[macd.length - 1].MACD === 0) && (macd[macd.length - 1].signal || macd[macd.length - 1].signal === 0)) ? macd[macd.length - 1].MACD < macd[macd.length - 1].signal : false) : false;
        const psarBull = ((_a = psar[psar.length - 1]) !== null && _a !== void 0 ? _a : latestRate) < latestRate;
        const psarBear = ((_b = psar[psar.length - 1]) !== null && _b !== void 0 ? _b : latestRate) > latestRate;
        const stochOB = stoch.length > 0 ? (Math.max(stoch[stoch.length - 1].k, stoch[stoch.length - 1].d) > 80) : false;
        const stochOS = stoch.length > 0 ? (Math.max(stoch[stoch.length - 1].k, stoch[stoch.length - 1].d) < 20) : false;
        const stochBull = stochOB ? false : (stoch.length > 1 ? (((stoch[stoch.length - 1].k || stoch[stoch.length - 1].k === 0) && (stoch[stoch.length - 1].d || stoch[stoch.length - 1].d === 0)) ? (stoch[stoch.length - 1].k > stoch[stoch.length - 1].d) : false) : false);
        const stochBear = stochOS ? false : (stoch.length > 1 ? (((stoch[stoch.length - 1].k || stoch[stoch.length - 1].k === 0) && (stoch[stoch.length - 1].d || stoch[stoch.length - 1].d === 0)) ? (stoch[stoch.length - 1].k < stoch[stoch.length - 1].d) : false) : false);
        // COMPUTE TREND CONFIRMATION AND SUPORTING INDICATORS
        const trendBull = (0, technicalindicators_1.bullish)(csd);
        const trendBear = (0, technicalindicators_1.bearish)(csd);
        const vwap = technicalindicators_1.VWAP.calculate({ close, high, low, volume });
        const vwapBull = vwap.length > 0 ? latestRate > vwap[vwap.length - 1] : false;
        const vwapBear = vwap.length > 0 ? latestRate < vwap[vwap.length - 1] : false;
        const adl = technicalindicators_1.ADL.calculate({ close, high, low, volume });
        const adlDir = (0, direction_1.compute1ExpDirection)(adl, dirLength);
        const priceDir = (0, direction_1.compute1ExpDirection)(close, dirLength);
        const priceDir2 = (0, direction_1.compute2ExpDirection)(close, dirLength);
        const adlBull = adlDir > 0 && priceDir > 0;
        const adlBear = adlDir < 0 && priceDir < 0;
        const atr = technicalindicators_1.ATR.calculate({ close, high, low, period: site_1.Site.MAPeriod });
        const ao = technicalindicators_1.AwesomeOscillator.calculate({ fastPeriod: site_1.Site.AOFastPeriod, slowPeriod: site_1.Site.AOSlowPeriod, high, low });
        const aoBull = ((_c = ao[ao.length - 1]) !== null && _c !== void 0 ? _c : -1) > 0;
        const aoBear = ((_d = ao[ao.length - 1]) !== null && _d !== void 0 ? _d : 1) < 0;
        const roc = technicalindicators_1.ROC.calculate({ values: close, period: site_1.Site.MAPeriod });
        const rocDir = (0, direction_1.computeArithmeticDirection)(roc, dirLength);
        const rocBull = ((_e = roc[roc.length - 1]) !== null && _e !== void 0 ? _e : -1) > 0;
        const rocBear = ((_f = roc[roc.length - 1]) !== null && _f !== void 0 ? _f : 1) < 0;
        const fi = technicalindicators_1.ForceIndex.calculate({ close, volume, period: site_1.Site.FIPeriod });
        const fiDir = (0, direction_1.computeArithmeticDirection)(fi, dirLength);
        const fiBull = fiDir > 0 && ((_g = fi[fi.length - 1]) !== null && _g !== void 0 ? _g : 0) > 0;
        const fiBear = fiDir < 0 && ((_h = fi[fi.length - 1]) !== null && _h !== void 0 ? _h : 0) < 0;
        const trix = technicalindicators_1.TRIX.calculate({ period: site_1.Site.MAPeriod, values: close });
        const trixBull = ((_j = trix[trix.length - 1]) !== null && _j !== void 0 ? _j : 0) > 0;
        const trixBear = ((_k = trix[trix.length - 1]) !== null && _k !== void 0 ? _k : 0) < 0;
        const adx = technicalindicators_1.ADX.calculate({ close, high, low, period: site_1.Site.MAPeriod });
        const adxStrong = adx.length > 0 ? ((adx[adx.length - 1].adx || adx[adx.length - 1].adx === 0) ? adx[adx.length - 1].adx > 25 : false) : false;
        const adxWeak = adx.length > 0 ? ((adx[adx.length - 1].adx || adx[adx.length - 1].adx === 0) ? adx[adx.length - 1].adx < 20 : false) : false;
        const bb = technicalindicators_1.BollingerBands.calculate({ period: site_1.Site.BBPeriod, stdDev: site_1.Site.BBStdDev, values: close });
        const bbBuy = bb.length > 0 ? latestRate < bb[bb.length - 1].lower : false;
        const bbSell = bb.length > 0 ? latestRate > bb[bb.length - 1].upper : false;
        const cci = technicalindicators_1.CCI.calculate({ close, high, low, period: site_1.Site.MAPeriod });
        const mfi = technicalindicators_1.MFI.calculate({ close, high, low, volume, period: 14 });
        const rsi = technicalindicators_1.RSI.calculate({ values: close, period: 14 });
        // FLOW
        const overallBull = macdBull && (psarBull || stochBull);
        const overallBear = macdBear && (psarBear || stochBear);
        const supportBull = (0, boolean_threshold_1.booleanThreshold)([
            trendBull,
            vwapBull,
            adlBull,
            aoBull,
            rocBull,
            fiBull,
            trixBull,
        ], site_1.Site.trendSupportRatio);
        const supportBear = (0, boolean_threshold_1.booleanThreshold)([
            trendBear,
            vwapBear,
            adlBear,
            aoBear,
            rocBear,
            fiBear,
            trixBear,
        ], site_1.Site.trendSupportRatio);
        const goodBuy = bbBuy;
        const goodSell = bbSell;
        const volatilityPerc = (atr.length > 0 ? atr[atr.length - 1] : 0) / latestRate * 100;
        const TPSLPerc = Math.abs(((_l = psar[psar.length - 1]) !== null && _l !== void 0 ? _l : latestRate) - latestRate) / latestRate * 100;
        if (!ExtendedMainStrategy.TP[symbol]) {
            ExtendedMainStrategy.TP[symbol] = [];
        }
        if (!ExtendedMainStrategy.VOL[symbol]) {
            ExtendedMainStrategy.VOL[symbol] = [];
        }
        ExtendedMainStrategy.TP[symbol].push(TPSLPerc);
        ExtendedMainStrategy.VOL[symbol].push(volatilityPerc);
        if (ExtendedMainStrategy.TP[symbol].length > dirLength) {
            ExtendedMainStrategy.TP[symbol] = ExtendedMainStrategy.TP[symbol].slice(ExtendedMainStrategy.TP[symbol].length - dirLength);
        }
        if (ExtendedMainStrategy.VOL[symbol].length > dirLength) {
            ExtendedMainStrategy.VOL[symbol] = ExtendedMainStrategy.VOL[symbol].slice(ExtendedMainStrategy.VOL[symbol].length - dirLength);
        }
        if (overallBull) {
            /**
             * BULLISH TREND
             * This means that the trend is presently bullish.
             * Actions that can be taken at this point include.
             * BUYING - only if there is no sign of reversal, and the trend is not weak. that is, safe buying.
             * SELLING - only if there is a sign of reversal
             * ---
             * We also need to assess if a reversal is a false signal and there is an overall bullish market.
             * We may achieve this by using multiple sources of reversal and smartly calculating their resultants.
             * ---
             * To calculate reversal, we leverage the use of:
             * 1. Candlestick Patterns - detect if any of the candlestick patterns for reversal is present
             * 2. Overbought - check if the asset is overvalued.
             * 3. Divergence - check for bearish divergence in prices and other indicators.
             * ---
             * COMPUTING REVERSAL
             * SOLUTION 1: First check for "OR Overbought", then confirm by either a 1/2 boolean threshold on OB metrics,
             * a candlestick reversal, or a divergence.
             * ---
             * LEVERAGING ADX strong/weak signals AND TREND SUPPORT
             * buy only if the trend is not weak OR there is trend confirmation
             */
            const weak = adxWeak;
            const candlestickBearishReversal = (0, technicalindicators_1.abandonedbaby)(csd) || (0, technicalindicators_1.bearishengulfingpattern)(csd) ||
                (0, technicalindicators_1.darkcloudcover)(csd) || (0, technicalindicators_1.piercingline)(csd) || (0, technicalindicators_1.eveningstar)(csd) || (0, technicalindicators_1.eveningdojistar)(csd) ||
                (0, technicalindicators_1.threeblackcrows)(csd) || (0, technicalindicators_1.gravestonedoji)(csd) || (0, technicalindicators_1.bearishharami)(csd) || (0, technicalindicators_1.bearishmarubozu)(csd) ||
                (0, technicalindicators_1.tweezertop)(csd) || (0, technicalindicators_1.hangingman)(csd) || (0, technicalindicators_1.shootingstar)(csd) || (0, technicalindicators_1.bearishharamicross)(csd);
            const cciOB = ((_m = cci[cci.length - 1]) !== null && _m !== void 0 ? _m : -1) > 100;
            const mfiOB = ((_o = mfi[mfi.length - 1]) !== null && _o !== void 0 ? _o : 80) > 80;
            const rsiOB = ((_p = rsi[rsi.length - 1]) !== null && _p !== void 0 ? _p : 70) > 70;
            const OROverBought = stochOB || cciOB || mfiOB || rsiOB;
            const BTOverbought = (0, boolean_threshold_1.booleanThreshold)([cciOB, mfiOB, rsiOB, stochOB], (3 / 4));
            const rocBearDive = priceDir > 0 && rocDir < 0;
            const fiBearDive = priceDir > 0 && fiDir < 0;
            const divergence = rocBearDive || fiBearDive;
            const reversal = OROverBought ? (BTOverbought || divergence) : false;
            if (reversal) {
                buy = false;
                sell = true;
                desc = "BULL_EXIT";
            }
            else if ((!weak) || supportBull || goodBuy) {
                buy = `${(0, direction_1.clearDirection)(ExtendedMainStrategy.VOL[symbol], dirLength)}${(0, direction_1.clearDirection)(ExtendedMainStrategy.TP[symbol], dirLength)}` != '11';
                sell = false;
                desc = "BULL_ENTRY";
            }
            else {
                buy = false;
                sell = false;
                desc = "WEAK_BULL";
            }
        }
        else if (overallBear) {
            /**
             * BEARISH TREND
             * This means that the trend is presently bearish.
             * Actions that can be taken at this point include.
             * SELLING - the selling can continue at this point in order to close off trades in time
             * BUYING - risky, but early and more profitable, only on reversal.
             * ---
             * We also need to assess if a reversal is a false signal and there is an overall bearish market.
             * We may achieve this by using multiple sources of reversal and smartly calculating their resultants.
             * ---
             * To calculate reversal, we leverage the use of:
             * 1. Candlestick Patterns - detect if any of the candlestick patterns for reversal is present
             * 2. Oversold - check if the asset is undervalued.
             * 3. Divergence - check for bearish divergence in prices and other indicators.
             * ---
             * COMPUTING REVERSAL
             * SOLUTION 1: First check for "OR Oversold", then confirm by either a 1/2 boolean threshold on OS metrics,
             * a candlestick reversal, a positive arithmetic direction of close, or a divergence.
             * ---
             * LEVERAGING ADX strong/weak signals AND TREND SUPPORT
             * sell only if the trend is strong OR there is trend confirmation
             */
            const strong = adxStrong;
            const candlestickBullishReversal = (0, technicalindicators_1.abandonedbaby)(csd) || (0, technicalindicators_1.bullishengulfingpattern)(csd) ||
                (0, technicalindicators_1.threewhitesoldiers)(csd) || (0, technicalindicators_1.morningstar)(csd) || (0, technicalindicators_1.morningdojistar)(csd) || (0, technicalindicators_1.hammerpattern)(csd) ||
                (0, technicalindicators_1.dragonflydoji)(csd) || (0, technicalindicators_1.bullishharami)(csd) || (0, technicalindicators_1.bullishmarubozu)(csd) || (0, technicalindicators_1.bullishharamicross)(csd) ||
                (0, technicalindicators_1.tweezerbottom)(csd);
            const cciOS = ((_q = cci[cci.length - 1]) !== null && _q !== void 0 ? _q : 1) < -100;
            const mfiOS = ((_r = mfi[mfi.length - 1]) !== null && _r !== void 0 ? _r : 20) < 20;
            const rsiOS = ((_s = rsi[rsi.length - 1]) !== null && _s !== void 0 ? _s : 30) < 30;
            const OROverSold = stochOS || cciOS || mfiOS || rsiOS;
            const BTOversold = (0, boolean_threshold_1.booleanThreshold)([cciOS, mfiOS, rsiOS, stochOS], (1 / 2));
            const rocBullDive = priceDir < 0 && rocDir > 0;
            const fiBullDive = priceDir < 0 && fiDir > 0;
            const divergence = rocBullDive || fiBullDive;
            // const reversal = OROverSold ? (BTOversold || divergence || candlestickBullishReversal || (computeArithmeticDirection(close, Site.directionLength) > 0)) : false;
            const reversal = OROverSold ? (BTOversold || divergence || candlestickBullishReversal) : false;
            // const rev = (BTOversold && divergence) || (BTOversold && candlestickBullishReversal) || (divergence && candlestickBullishReversal);
            // const reversal = OROverSold ? rev : false;
            if (reversal) {
                buy = `${(0, direction_1.clearDirection)(ExtendedMainStrategy.VOL[symbol], dirLength)}${(0, direction_1.clearDirection)(ExtendedMainStrategy.TP[symbol], dirLength)}` == '11';
                sell = false;
                desc = "BEAR_ENTRY";
            }
            else if (strong || supportBear || goodSell) {
                buy = false;
                sell = true;
                desc = "BEAR_EXIT";
            }
            else {
                buy = false;
                sell = false;
                desc = "WEAK_BEAR";
            }
        }
        else {
            /**
             * UNCONFIRMED TREND
             * Normally, we would refrain from making any decision in this context.
             * But for science, we should set highly strict conditions.
             * ---
             * BUY
             * Only buy if "goodBuy" AND "supportBull" AND non-negative arithmetic direction for closing price.
             * ---
             * SELL
             * We do not need to sell anything here.
             */
            const possibleEntry = goodBuy && supportBull && ((0, direction_1.computeArithmeticDirection)(close, site_1.Site.directionLength) >= 0);
            if (possibleEntry) {
                buy = true;
                sell = false;
                desc = "NO_TREND_ENTRY";
            }
            else {
                buy = false;
                sell = false;
                desc = "NO_TREND_NO_ACTION";
            }
        }
        // TODO - EMIT VOLATILITY TOO, LATEST CLOSING PRICE, AND TPSL
        const rate = latestRate;
        const vol = volatilityPerc;
        const tpsl = TPSLPerc;
        callback(res_1.GRes.succ({ buy, sell, desc, rate, vol, tpsl }));
    }
}
exports.ExtendedMainStrategy = ExtendedMainStrategy;
ExtendedMainStrategy.TP = {};
ExtendedMainStrategy.VOL = {};
