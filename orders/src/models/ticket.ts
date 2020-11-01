import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';


interface TicketsAttrs {
    title:string;
    price: number;
}

export interface TicketDoc extends mongoose.Document {
    title:string;
    price: number;
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketsAttrs) : TicketDoc;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type:Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
     }    
    }
);

ticketSchema.statics.build = (attrs: TicketsAttrs) => {
    return new Ticket(attrs);
}

ticketSchema.methods.isReserved = async function () {
    // this === the ticket document that we just called 'isReserved' on 

    const existingOrder = await Order.findOne( {
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })
    
    //If the order exist return true
    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket }