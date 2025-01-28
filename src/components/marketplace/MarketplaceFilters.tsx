import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cryptoCurrencies } from "@/types/currency";

type MarketplaceFiltersProps = {
  currency: string;
  setCurrency: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  minRating: string;
  setMinRating: (value: string) => void;
};

const MarketplaceFilters = ({
  currency,
  setCurrency,
  sortBy,
  setSortBy,
  minRating,
  setMinRating,
}: MarketplaceFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Select value={currency} onValueChange={setCurrency}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Currencies</SelectItem>
          {cryptoCurrencies.map((crypto) => (
            <SelectItem key={crypto.symbol} value={crypto.symbol}>
              {crypto.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price_asc">Price (Low to High)</SelectItem>
          <SelectItem value="price_desc">Price (High to Low)</SelectItem>
          <SelectItem value="rating_desc">Best Rating</SelectItem>
          <SelectItem value="newest">Newest First</SelectItem>
        </SelectContent>
      </Select>

      <Select value={minRating} onValueChange={setMinRating}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Min Rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">All Ratings</SelectItem>
          <SelectItem value="4">4+ Stars</SelectItem>
          <SelectItem value="4.5">4.5+ Stars</SelectItem>
          <SelectItem value="4.8">4.8+ Stars</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MarketplaceFilters;