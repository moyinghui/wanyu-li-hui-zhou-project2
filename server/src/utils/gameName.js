const words = [
    "Red", "Blue", "Green", "Fast", "Slow", "Bright", "Dark",
    "Tiger", "Lion", "Eagle", "Shark", "Bear",
    "Mountain", "River", "Forest", "Ocean", "Sky",
    "Dragon", "Phoenix", "Wolf", "Falcon", "Cheetah",
    "Storm", "Thunder", "Lightning", "Shadow", "Blaze",
    "Nova", "Cosmic", "Quantum", "Nebula", "Solar",
    "Pixel", "Byte", "Code", "Script", "Matrix",
    "Rocket", "Comet", "Astro", "Orbit", "Galaxy",
    "Ninja", "Samurai", "Pirate", "Viking", "Knight",
    "Wizard", "Elf", "Dwarf", "Giant", "Goblin",
    "Hero", "Legend", "Myth", "Saga", "Quest",
    "Ace", "Champ", "Boss", "Rogue", "Scout",
    "Blizzard", "Cyclone", "Hurricane", "Tornado", "Avalanche",
    "Inferno", "Frost", "Glacier", "Volcano", "Quake",
    "Phantom", "Specter", "Wraith", "Shade", "Spirit",
    "Vortex", "Eclipse", "Mirage", "Pulse", "Surge",
];

export function generateGameName() {
    function pick() {
        return words[Math.floor(Math.random() * words.length)];
    }
    return `${pick()} ${pick()} ${pick()}`;
}
