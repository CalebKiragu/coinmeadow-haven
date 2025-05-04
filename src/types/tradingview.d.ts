interface TradingViewWidget {
  widget: (config: {
    autosize: boolean;
    symbol: string;
    interval: string;
    timezone: string;
    theme: string;
    style: string;
    locale: string;
    enable_publishing: boolean;
    allow_symbol_change: boolean;
    container_id: string;
    hide_side_toolbar: boolean;
    studies: string[];
    overrides: {
      [key: string]: string;
    };
  }) => void;
}

interface Window {
  TradingView: TradingViewWidget;
}