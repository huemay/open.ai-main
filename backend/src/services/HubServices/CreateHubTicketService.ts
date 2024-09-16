import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import ShowContactService from "../ContactServices/ShowContactService";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  queueId ?: number;
  channel: string;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  channel
}: Request): Promise<Ticket> => {

  let connectionType

  if(channel === 'instagram' || channel === 'facebook') {
    connectionType = 'facebook'
  }

  console.log('channel', channel)
  console.log('connectionType', connectionType)

  const connection = await Whatsapp.findOne({
    where: { type: connectionType! }
  });

  if (!connection) {
    throw new Error("Connection id not found");
  }

  await CheckContactOpenTickets(contactId, connection.id);

  const { isGroup } = await ShowContactService(contactId);

  if(queueId === undefined) {
    const user = await User.findByPk(userId, { include: ["queues"]});
    queueId = user?.queues.length === 1 ? user.queues[0].id : undefined;
  }

  const newTicket = await Ticket.create({
    status,
    lastMessage: null,
    contactId,
    isGroup,
    whatsappId: connection.id
  });

  const ticket = await Ticket.findByPk(newTicket.id, { include: ["contact"] });

  if (!ticket) {
    throw new AppError("ERR_CREATING_TICKET");
  }

  return ticket;
};

export default CreateTicketService;