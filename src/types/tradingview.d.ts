
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
    allow_symbol_change?: boolean;
    container_id: string;
    hide_side_toolbar?: boolean;
    hide_top_toolbar?: boolean;
    hide_legend?: boolean;
    save_image?: boolean;
    studies?: string[];
    time_frames?: Array<{ text: string, resolution: string }>;
    range?: string;
    overrides?: {
      [key: string]: string | boolean | number;
    };
  }) => void;
}

interface Window {
  TradingView: TradingViewWidget;
}
