// PROTOTYPE

"use client";

import React, { useState, useEffect } from "react";
import Dexie, { Table } from "dexie";
import Papa from "papaparse";
import { Virtuoso } from "react-virtuoso";

class CatalogueDB extends Dexie {
  products!: Table<ProductBlob, string>;
  index!: Table<LeanProduct, string>;

  constructor() {
    super("CatalogueDB");
    this.version(1).stores({
      products: "id",
      index: "id, name",
    });
  }
}

interface ProductBlob {
  id: string;
  rawData: unknown;
}
interface LeanProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
}

const db = new CatalogueDB();

export default function Home() {
  const [status, setStatus] = useState("Idle");
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<LeanProduct[]>([]);
  const [query, setQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file) return;
    setStatus("Processing...");
    // TODO RE
    // 1. Input ambiguity must be solved to 100% non-ambiguity. Input expectations must be 100% 1-to-1 clear.
    // - biggest problem: ambiguity of input product-catalogue mapping; might be based on category entity with parent id or category id with child id or some other format
    // - i must enforce accepted formats and input has to be 100% clear about requirement for processable input
    // -
    // - should be able to handle different column namings (e.g., "product_name" instead of "name")
    // - should be able to handle different data types/formats (e.g., numbers with commas)

    Papa.parse(file, {
      header: true,
      worker: true,
      step: async (results) => {
        const blobs: ProductBlob[] = [];
        const leans: LeanProduct[] = [];

        results.data.forEach((row: any) => {
          const id = row.id || crypto.randomUUID();
          blobs.push({ id, rawData: row });
          leans.push({
            id,
            name: row.name || "Unknown Item",
            brand: row.brand || "Generic",
          });
        });

        await db.products.bulkPut(blobs);
        await db.index.bulkPut(leans);
        setCount((prev) => prev + results.data.length);
      },
      complete: () => {
        setStatus("Done! 100% Offline.");
        refreshList();
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const refreshList = async () => {
    const result = await db.index
      .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
      .limit(1000)
      .toArray();
    setItems(result);
  };

  useEffect(() => {
    refreshList();
  }, [query]);

  return (
    <main className="p-8 max-w-4xl mx-auto h-screen flex flex-col gap-4 bg-gray-900 text-white">
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-emerald-400">Local-First Catalogue (Proto)</h1>
        <p className="text-sm text-gray-400">Items in DB: {count.toLocaleString()}</p>

        <div className={`mt-4 p-8 rounded border-2 border-dashed transition-colors text-center cursor-pointer relative ${isDragging ? "border-emerald-500 bg-gray-800" : "border-gray-600 hover:border-emerald-500 hover:bg-gray-800"}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
          <input type="file" accept=".csv" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <p className="text-gray-300 font-bold">Drag & Drop CSV here</p>
          <p className="text-xs text-gray-500 mt-1">or click to browse (1.5M+ rows supported)</p>
          <span className="block mt-4 text-emerald-400 font-mono text-sm">{status}</span>
        </div>
      </div>

      <input placeholder="Search Lean Index (0ms latency)..." className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-emerald-500" value={query} onChange={(e) => setQuery(e.target.value)} />

      <div className="flex-1 border border-gray-700 rounded bg-black">
        <Virtuoso
          style={{ height: "100%" }}
          data={items}
          itemContent={(index, item) => (
            <div className="p-3 border-b border-gray-800 flex justify-between hover:bg-gray-900">
              <div>
                <div className="font-bold text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.id}</div>
              </div>
              <div className="text-xs bg-gray-800 px-2 py-1 rounded h-fit">{item.brand}</div>
            </div>
          )}
        />
      </div>
    </main>
  );
}
