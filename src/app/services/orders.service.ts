import { Injectable } from '@angular/core';
import { collection, doc, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';


export type OrderStatus = 'pendente' | 'confirmado' | 'preparando' | 'concluido' | 'cancelado';
export type PaymentStatus = 'aguardando' | 'aprovado' | 'recusado';


export interface Order {
id?: string;
customerName: string;
items: { name: string; quantity: number; price: number }[];
total: number;
status: OrderStatus;
paymentStatus: PaymentStatus;
createdAt?: any;
}


@Injectable({ providedIn: 'root' })
export class OrdersService {
constructor(private firebase: FirebaseService) {}


private ordersCollectionPath(userId: string) {
return `usuarios/${userId}`;
}


listenForOrders(userId: string): Observable<Order[]> {
return new Observable<Order[]>(subscriber => {
const db = this.firebase.getDb();
const colRef = collection(db, this.ordersCollectionPath(userId));
const unsub = onSnapshot(colRef, snap => {
const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
subscriber.next(list);
}, err => subscriber.error(err));


return () => unsub();
});
}


async addOrder(userId: string, order: Omit<Order, 'id'>) {
const db = this.firebase.getDb();
const colRef = collection(db, this.ordersCollectionPath(userId));
return await addDoc(colRef, order as any);
}


async updateOrderStatus(userId: string, orderId: string, newStatus: Order['status']) {
const db = this.firebase.getDb();
const orderRef = doc(db, this.ordersCollectionPath(userId), orderId);


const update: Partial<Order> = { status: newStatus };
if (newStatus === 'confirmado' || newStatus === 'concluido') {
update.paymentStatus = 'aprovado';
}


return await updateDoc(orderRef, update as any);
}
}