import { Gamepad2, Swords, Smartphone, Grid3X3, Crosshair, Car, Flame, Trophy } from "lucide-react";

export const modalities = [
  { id: "lol", name: "League of Legends", icon: Swords, image: "/imgs/lol.png", color: "from-yellow-600 to-amber-500" },
  { id: "valorant", name: "Valorant", icon: Gamepad2, image: "/imgs/valorant.png", color: "from-red-600 to-rose-500" },
  { id: "wildrift", name: "Wild Rift", icon: Smartphone, image:"/imgs/wildrift.png", color: "from-blue-600 to-cyan-500" },
  { id: "tft", name: "TFT", icon: Grid3X3, image:"/imgs/tft.png", color: "from-purple-600 to-violet-500" },
  { id: "cs2", name: "CS2", icon: Crosshair, image:"/imgs/cs.png", color: "from-orange-600 to-yellow-500" },
  { id: "rocketleague", name: "Rocket League", icon: Car, image: "/imgs/rocketLeague.png", color: "from-sky-600 to-blue-500" },
  { id: "freefire", name: "Free Fire", icon: Flame, image: "/imgs/freeFire.png", color: "from-green-600 to-emerald-500" },
  { id: "eafc", name: "EA FC", icon: Trophy, image: "/imgs/eaFC.png", color: "from-lime-600 to-green-500" },
];

export const modalityNames: Record<string, string> = Object.fromEntries(
  modalities.map((m) => [m.id, m.name])
);

export const modalityIcons: Record<string, any> = Object.fromEntries(
  modalities.map((m) => [m.id, m.icon])
);
