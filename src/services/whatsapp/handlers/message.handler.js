const axios = require("axios");

async function handleMessage(msg, client) {
  console.log(`📥 Mensaje recibido de ${msg.from}: ${msg.body}`);

  if (msg.body.toLowerCase().includes("lobby")) {
    const payload = [
      {
        messaging_product: "whatsapp",
        metadata: {
          display_phone_number: "15550324292",
          phone_number_id: "111403548485773",
        },
        contacts: [
          {
            profile: { name: "Esteban Villalba" },
            wa_id: msg.from,
          },
        ],
        messages: [
          {
            from: msg.from,
            id: msg.id._serialized,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: { body: msg.body },
            type: "text",
          },
        ],
        field: "messages",
      },
    ];

    try {
      const res = await axios.post(
        "https://n8n-n8n.wpj7lg.easypanel.host/webhook/98282200-2d60-4561-bf96-10d3c19ed917",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      await msg.reply(typeof res.data === "string" ? res.data : "✅ Tu mensaje fue procesado por IA.");
    } catch (err) {
      console.error("❌ Error al enviar datos al webhook:", err.message);
      await msg.reply("⚠️ Ocurrió un error al procesar tu mensaje.");
    }
  }
}

module.exports = { handleMessage };
