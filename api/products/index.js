import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json([
    {
      id: 1,
      name: "Paracetamol",
      description: "Fever medicine",
      price: 50,
      imageUrl: "img1.jpg"
    }
  ]);
}
