INPUT (Your Machine) THE PROCESS (Local-First App) OUTPUT (The Trifecta)
+------------------+ +---------------------------+ +----------------------+
| PRODUCTS.CSV | | BROWSER MEMORY (RAM/DB) | | 1. PRODUCTS (Blob) |
| (1.5M Lines) | =====> | ------------------------- | =====> | [UNTOUCHED] |
| | READ | [A] Heavy Blob (Storage) | +----------------------+
+------------------+ ONLY | _ Sleeping on Disk |
| | +----------------------+
| [B] Lean Index (UI) | | 2. CATALOGUE.JSON |
| _ Drag & Drop Speed | =====> | [Structure Tree] |
| \* "startsWith" Logic | +----------------------+
| |
+---------------------------+ +----------------------+
| 3. INDEX_MAP.JSON |
| [The Wiring] |
+----------------------+
