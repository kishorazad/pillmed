export default function handler(req, res) {
  res.status(200).json([
    {
      id: 1,
      name: "Paracetamol",
      description: "Fever medicine",
      price: 50,
      imageUrl: "img1.jpg"
    },
    {
      id: 2,
      name: "Dolo 650",
      description: "Pain relief",
      price: 60,
      imageUrl: "img2.jpg"
    },
    {
      id: 3,
      name: "Crocin",
      description: "Cold & fever",
      price: 45,
      imageUrl: "img3.jpg"
    }
  ]);
}
