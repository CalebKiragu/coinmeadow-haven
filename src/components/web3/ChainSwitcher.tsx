import { networks } from "@/lib/wagmi";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface ChainSwitcherProps {
  switchNetwork: (chainId: Number, chainName: string) => void;
}

const ChainSwitcher: React.FC<ChainSwitcherProps> = ({ switchNetwork }) => {
  const [openChainSwitcher, setOpenChainSwitcher] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenChainSwitcher(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        variant="link"
        onClick={() => setOpenChainSwitcher(!openChainSwitcher)}
        className="px-4 py-2 rounded-md  "
      >
        Switch Network
      </Button>

      {openChainSwitcher && (
        <div className="absolute z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <ul className="py-1">
            {networks.map((chain) => (
              <li
                key={chain.id}
                onClick={() => {
                  switchNetwork(Number(chain?.id), chain.name);
                  setOpenChainSwitcher(false);
                }}
                className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {chain.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChainSwitcher;
