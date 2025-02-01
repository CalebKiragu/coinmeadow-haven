import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface ChartProps {
  selectedCrypto: string;
}

let tvScriptLoadingPromise: Promise<void>;

const PortfolioChart = ({ selectedCrypto }: ChartProps) => {
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve as () => void;
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
    };
  }, [selectedCrypto]);

  const createWidget = () => {
    if (document.getElementById('tradingview_chart') && 'TradingView' in window) {
      const tw = (window as any).TradingView;
      new tw.widget({
        autosize: true,
        symbol: `BINANCE:${selectedCrypto}USD`,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: "tradingview_chart",
        hide_side_toolbar: false,
        studies: [
          "MASimple@tv-basicstudies",
          "RSI@tv-basicstudies",
          "MACD@tv-basicstudies"
        ],
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#4CAF50",
          "mainSeriesProperties.candleStyle.downColor": "#FF5252",
          "mainSeriesProperties.candleStyle.borderUpColor": "#4CAF50",
          "mainSeriesProperties.candleStyle.borderDownColor": "#FF5252",
          "mainSeriesProperties.candleStyle.wickUpColor": "#4CAF50",
          "mainSeriesProperties.candleStyle.wickDownColor": "#FF5252"
        }
      });
    }
  };

  return (
    <Card className="p-6 glass-effect">
      <div className="h-[600px]" id="tradingview_chart" />
    </Card>
  );
};

export default PortfolioChart;