import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    res.status(200).json([
      { id: 1, name: "Medicines" },
      { id: 2, name: "Healthcare" }
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
}
