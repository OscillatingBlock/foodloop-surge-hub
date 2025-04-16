
import React from "react";
import { Leaf } from "lucide-react";

const NavLogo: React.FC = () => {
  return (
    <a href="#" className="flex items-center space-x-2">
      <Leaf className="h-8 w-8 text-leaf" />
      <span className="text-xl font-bold font-display text-leaf-dark">
        FoodLoop
      </span>
    </a>
  );
};

export default NavLogo;
