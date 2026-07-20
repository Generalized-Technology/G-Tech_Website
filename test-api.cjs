const axios = require("axios");

async function test() {
  const url = "https://www.instagram.com/reel/Daj4iJLh-xt/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==";
  
  const apis = [
    `https://api.vkrdownloader.co/server?vkr=${encodeURIComponent(url)}`,
    `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`,
    `https://aemt.me/download/igdl?url=${encodeURIComponent(url)}`
  ];

  for (const api of apis) {
    try {
      console.log(`Testing ${api}`);
      const res = await axios.get(api);
      console.log("Success:", JSON.stringify(res.data).slice(0, 300));
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}
test();
