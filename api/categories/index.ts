import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req, res) {
  res.status(200).json([
    { id: 1, name: "Medicines" },
    { id: 2, name: "Healthcare" },
    { id: 3, name: "Personal Care" }
  ]);
}
