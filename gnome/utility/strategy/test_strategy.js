"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestStrategy = void 0;
const technicalindicators_1 = require("technicalindicators");
const res_1 = require("../../model/res");
const direction_1 = require("../direction");
const site_1 = require("../../site");
class TestStrategy {
    run(symbol, iterationID, open, close, high, low, baseVolume, quoteVolume, usdtVolume, callback) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const dirLength = 5;
        const volume = usdtVolume;
        const csd = { open, close, high, low };
        const latestRate = close[close.length - 1];
        const macd = technicalindicators_1.MACD.calculate({
            values: close,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });
        const macdBull = macd.length > 0 ? (((macd[macd.length - 1].MACD || macd[macd.length - 1].MACD === 0) && (macd[macd.length - 1].signal || macd[macd.length - 1].signal === 0)) ? macd[macd.length - 1].MACD > macd[macd.length - 1].signal : false) : false;
        const macdBear = macd.length > 0 ? (((macd[macd.length - 1].MACD || macd[macd.length - 1].MACD === 0) && (macd[macd.length - 1].signal || macd[macd.length - 1].signal === 0)) ? macd[macd.length - 1].MACD < macd[macd.length - 1].signal : false) : false;
        const trendBull = (0, technicalindicators_1.bullish)(csd);
        const trendBear = (0, technicalindicators_1.bearish)(csd);
        const adl = technicalindicators_1.ADL.calculate({ close, high, low, volume });
        const adlDir = (0, direction_1.compute1ExpDirection)(adl, dirLength);
        const priceDir = (0, direction_1.compute1ExpDirection)(close, dirLength);
        const adx = technicalindicators_1.ADX.calculate({ close, high, low, period: site_1.Site.MAPeriod });
        const adxStrong = adx.length > 0 ? ((adx[adx.length - 1].adx || adx[adx.length - 1].adx === 0) ? adx[adx.length - 1].adx > 25 : false) : false;
        const adxWeak = adx.length > 0 ? ((adx[adx.length - 1].adx || adx[adx.length - 1].adx === 0) ? adx[adx.length - 1].adx < 20 : false) : false;
        const adlBull = adlDir > 0 && priceDir > 0;
        const adlBear = adlDir < 0 && priceDir < 0;
        const atr = technicalindicators_1.ATR.calculate({ close, high, low, period: site_1.Site.MAPeriod });
        const volatility = (atr.length > 0 ? atr[atr.length - 1] : 0) / latestRate * 100;
        const ao = technicalindicators_1.AwesomeOscillator.calculate({ fastPeriod: 5, slowPeriod: 34, high, low });
        const aoBull = ((_a = ao[ao.length - 1]) !== null && _a !== void 0 ? _a : -1) > 0;
        const aoBear = ((_b = ao[ao.length - 1]) !== null && _b !== void 0 ? _b : 1) < 0;
        const bb = technicalindicators_1.BollingerBands.calculate({ period: 14, stdDev: 2, values: close });
        const bbBuy = bb.length > 0 ? latestRate < bb[bb.length - 1].lower : false;
        const bbSell = bb.length > 0 ? latestRate > bb[bb.length - 1].upper : false;
        const cci = technicalindicators_1.CCI.calculate({ close, high, low, period: site_1.Site.MAPeriod });
        const cciOB = ((_c = cci[cci.length - 1]) !== null && _c !== void 0 ? _c : -1) > 100;
        const cciOS = ((_d = cci[cci.length - 1]) !== null && _d !== void 0 ? _d : 1) < -100;
        const fi = technicalindicators_1.ForceIndex.calculate({ close, volume, period: 14 });
        const fiDir = (0, direction_1.computeArithmeticDirection)(fi, dirLength);
        const fiBull = fiDir > 0 && ((_e = fi[fi.length - 1]) !== null && _e !== void 0 ? _e : 0) > 0;
        const fiBear = fiDir < 0 && ((_f = fi[fi.length - 1]) !== null && _f !== void 0 ? _f : 0) < 0;
        const fiBullDive = priceDir < 0 && fiDir > 0;
        const fiBearDive = priceDir > 0 && fiDir < 0;
        const mfi = technicalindicators_1.MFI.calculate({ close, high, low, volume, period: 14 });
        const mfiOB = ((_g = mfi[mfi.length - 1]) !== null && _g !== void 0 ? _g : 80) > 80;
        const mfiOS = ((_h = mfi[mfi.length - 1]) !== null && _h !== void 0 ? _h : 20) < 20;
        const psar = technicalindicators_1.PSAR.calculate({ high, low, step: 0.02, max: 0.2 });
        const psarBull = ((_j = psar[psar.length - 1]) !== null && _j !== void 0 ? _j : latestRate) < latestRate;
        const psarBear = ((_k = psar[psar.length - 1]) !== null && _k !== void 0 ? _k : latestRate) > latestRate;
        const psarSLTP = Math.abs(((_l = psar[psar.length - 1]) !== null && _l !== void 0 ? _l : latestRate) - latestRate) / latestRate * 100;
        const roc = technicalindicators_1.ROC.calculate({ values: close, period: site_1.Site.MAPeriod });
        const rocDir = (0, direction_1.computeArithmeticDirection)(roc, dirLength);
        const rocBull = ((_m = roc[roc.length - 1]) !== null && _m !== void 0 ? _m : -1) > 0;
        const rocBear = ((_o = roc[roc.length - 1]) !== null && _o !== void 0 ? _o : 1) < 0;
        const rocBullDive = priceDir < 0 && rocDir > 0;
        const rocBearDive = priceDir > 0 && rocDir < 0;
        const rsi = technicalindicators_1.RSI.calculate({ values: close, period: 14 });
        const rsiOB = ((_p = rsi[rsi.length - 1]) !== null && _p !== void 0 ? _p : 70) > 70;
        const rsiOS = ((_q = rsi[rsi.length - 1]) !== null && _q !== void 0 ? _q : 30) < 30;
        const stoch = technicalindicators_1.Stochastic.calculate({ close, high, low, period: 14, signalPeriod: 3 });
        const stochOB = stoch.length > 0 ? (Math.max(stoch[stoch.length - 1].k, stoch[stoch.length - 1].d) > 80) : false;
        const stochOS = stoch.length > 0 ? (Math.max(stoch[stoch.length - 1].k, stoch[stoch.length - 1].d) < 20) : false;
        const stochBull = stochOB ? false : (stoch.length > 1 ? (((stoch[stoch.length - 1].k || stoch[stoch.length - 1].k === 0) && (stoch[stoch.length - 1].d || stoch[stoch.length - 1].d === 0)) ? (stoch[stoch.length - 1].k > stoch[stoch.length - 1].d) : false) : false);
        const stochBear = stochOS ? false : (stoch.length > 1 ? (((stoch[stoch.length - 1].k || stoch[stoch.length - 1].k === 0) && (stoch[stoch.length - 1].d || stoch[stoch.length - 1].d === 0)) ? (stoch[stoch.length - 1].k < stoch[stoch.length - 1].d) : false) : false);
        const trix = technicalindicators_1.TRIX.calculate({ period: site_1.Site.MAPeriod, values: close });
        const trixBuy = ((_r = trix[trix.length - 1]) !== null && _r !== void 0 ? _r : 0) > 0;
        const trixSell = ((_s = trix[trix.length - 1]) !== null && _s !== void 0 ? _s : 0) < 0;
        const vwap = technicalindicators_1.VWAP.calculate({ close, high, low, volume });
        const vwapBull = vwap.length > 0 ? latestRate > vwap[vwap.length - 1] : false;
        const vwapBear = vwap.length > 0 ? latestRate < vwap[vwap.length - 1] : false;
        const ab = (0, technicalindicators_1.abandonedbaby)(csd);
        const bep = (0, technicalindicators_1.bearishengulfingpattern)(csd);
        const bup = (0, technicalindicators_1.bullishengulfingpattern)(csd);
        const dcc = (0, technicalindicators_1.darkcloudcover)(csd);
        const pl = (0, technicalindicators_1.piercingline)(csd);
        const es = (0, technicalindicators_1.eveningstar)(csd);
        const eds = (0, technicalindicators_1.eveningdojistar)(csd);
        const ms = (0, technicalindicators_1.morningstar)(csd);
        const mds = (0, technicalindicators_1.morningdojistar)(csd);
        const tbc = (0, technicalindicators_1.threeblackcrows)(csd);
        const tws = (0, technicalindicators_1.threewhitesoldiers)(csd);
        const hm = (0, technicalindicators_1.hangingman)(csd);
        const ss = (0, technicalindicators_1.shootingstar)(csd);
        const dtg = (0, technicalindicators_1.downsidetasukigap)(csd);
        const hp = (0, technicalindicators_1.hammerpattern)(csd);
        const dfd = (0, technicalindicators_1.dragonflydoji)(csd);
        const gsd = (0, technicalindicators_1.gravestonedoji)(csd);
        const buh = (0, technicalindicators_1.bullishharami)(csd);
        const buhc = (0, technicalindicators_1.bullishharamicross)(csd);
        const bum = (0, technicalindicators_1.bullishmarubozu)(csd);
        const beh = (0, technicalindicators_1.bearishharami)(csd);
        const behc = (0, technicalindicators_1.bearishharamicross)(csd);
        const bem = (0, technicalindicators_1.bearishmarubozu)(csd);
        const tt = (0, technicalindicators_1.tweezertop)(csd);
        const tb = (0, technicalindicators_1.tweezerbottom)(csd);
        console.log("UP - DOWN REVERSE", ab, bep, dcc, pl, es, eds, tbc, gsd, beh, bem, behc, tt, hm, ss);
        console.log("DOWN - UP REVERSE", ab, bup, tws, ms, mds, hp, dfd, buh, bum, buhc, tb);
        console.log("DOWN - CONTINUE", dtg);
        console.log("MACD BULL", macdBull, "MACD BEAR", macdBear);
        console.log("PSAR BULL", psarBull, "PSAR BEAR", psarBear);
        console.log("STOCH BULL", stochBull, "STOCH BEAR", stochBear);
        console.log("TREND BULL", trendBull, "TREND BEAR", trendBear);
        console.log("WVAP BULL", vwapBull, "VWAP BEAR", vwapBear);
        console.log("ADL BULL", adlBull, "ADL BEAR", adlBear);
        console.log("AO BULL", aoBull, "AO BEAR", aoBear);
        console.log("ROC BULL", rocBull, "ROC BEAR", rocBear);
        console.log("ROC BULL DIVE", rocBullDive, "ROC BEAR DIVE", rocBearDive);
        console.log("FI BULL", fiBull, "FI BEAR", fiBear);
        console.log("FI BULL DIVE", fiBullDive, "FI BEAR DIVE", fiBearDive);
        console.log("ADX STRONG", adxStrong, "ADX WEAK", adxWeak);
        console.log("BB BUY", bbBuy, "BB SELL", bbSell);
        console.log("TRIX BUY", trixBuy, "TRIX SELL", trixSell);
        console.log("CCI OB", cciOB, "CCI OS", cciOS);
        console.log("MFI OB", mfiOB, "MFI OS", mfiOS);
        console.log("RSI OB", rsiOB, "RSI OS", rsiOS);
        console.log("STOCH OB", stochOB, "STOCH OS", stochOS);
        console.log("ATR VOLATILITY %", volatility);
        console.log("PSAR SLTP %", psarSLTP);
        const trend = (0, technicalindicators_1.bullish)(csd) ? 1 : ((0, technicalindicators_1.bearish)(csd) ? -1 : 0);
        // const adl = compute1ExpDirection(ADL.calculate({ close, high, low, volume }).concat([latestRate]), dirLength) * 1;
        // const sma = compute1ExpDirection(SMA.calculate({ values: close, period: Site.MAPeriod }).concat([latestRate]), dirLength);
        // const ema = computeArithmeticDirection(EMA.calculate({ values: close, period: Site.MAPeriod }).concat([latestRate]), dirLength);
        // const wma = computeArithmeticDirection(WMA.calculate({ values: close, period: Site.MAPeriod }).concat([latestRate]), dirLength);
        // const wema = computeArithmeticDirection(WEMA.calculate({ values: close, period: Site.MAPeriod }).concat([latestRate]), dirLength);
        // const trix = computeArithmeticDirection(TRIX.calculate({values: close, period: Site.MAPeriod}).concat([latestRate]), dirLength);
        // const confirm = (trix + adl + sma + ema + wma + wema) / 6;
        // const ichi =  IchimokuCloud.calculate({
        //     high,
        //     low,
        //     basePeriod: 25,
        //     displacement: 25,
        //     spanPeriod: 50,
        //     conversionPeriod: 10,
        // });
        // console.log(TRIX.calculate({values: close, period: Site.MAPeriod}));
        // console.log(trix, adl, sma, ema, wma, wema);
        // if (trend > 0) {
        //     // upward trend
        //     console.log("BULL TREND")
        // }
        // else if (trend < 0) {
        //     // downward trend
        //     console.log("BEAR TREND")
        // }
        // else {
        //     // no trend
        //     console.log("NO TREND")
        // }
        callback(res_1.GRes.err("STRATEGY_NOT_IMPLEMENTED"));
    }
}
exports.TestStrategy = TestStrategy;
