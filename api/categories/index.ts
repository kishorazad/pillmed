export default async function handler(req, res) {
  try {
    // ✅ TEMP SAFE DATA (NO DB ERROR)
    res.status(200).json([
      { id: 1, name: "Medicines" },
      { id: 2, name: "Healthcare" }
    ]);
  } catch (err) {
    res.status(200).json([]);
  }
}
