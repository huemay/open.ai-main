import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import HubMessageListener from "../services/HubServices/HubMessageListener";

export const listen = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("Webhook received");
  const medias = req.files as Express.Multer.File[];
  const { channelId } = req.params;

  const connection = await Whatsapp.findOne({
    where: { qrcode: channelId }
  });

  if (!connection) {
    return res.status(404).json({ message: "Whatsapp channel not found" });
  }

  try {
    // Supondo que o quarto argumento seja algo como userId
    const userId = "someUserId"; // Ajuste conforme necessário

    await HubMessageListener(req.body, connection, medias, userId);

    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    return res.status(400).json({ message: error.message || error });
  }
};
