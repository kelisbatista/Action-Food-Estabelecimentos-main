import { Injectable } from '@angular/core';
import { collection, doc, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';


export type Status_pedido = 'pendente' | 'confirmado' | 'preparando' | 'concluido' | 'cancelado';
export type PaymentStatus = 'aguardando' | 'aprovado' | 'recusado';


export interface Order {
id?: string;
userId?: string;
customerNome: string;
items: { nome: string; qty: string; preco: number }[];
total: string;
status_pedido: Status_pedido;
createdAt?: any;
}

export interface PartialOrders {
  id?: string;
  userId?: string;
  customerName?: string;
  [key: string]: any; // permite outros campos sem erro
}


@Injectable({ providedIn: 'root' })
export class OrdersService {
constructor(private firebase: FirebaseService) {}


private ordersCollectionPath() {
return `orders`;
}


listenForOrders(userId: string): Observable<Order[]> {
return new Observable<Order[]>(subscriber => {
const db = this.firebase.getDb();
const colRef = collection(db, this.ordersCollectionPath());
const unsub = onSnapshot(colRef, snap => {
const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
subscriber.next(list);
}, err => subscriber.error(err));


return () => unsub();
});
}


async addOrder(userId: string, order: Omit<Order, 'id'>) {
const db = this.firebase.getDb();
const colRef = collection(db, this.ordersCollectionPath());
return await addDoc(colRef, order as any);
}


async updateOrderStatus(userId: string, orderId: string, newStatus_pedido: Order['status_pedido']) {
const db = this.firebase.getDb();
const orderRef = doc(db, this.ordersCollectionPath(), orderId);
await updateDoc(orderRef, { status: newStatus_pedido });

} }