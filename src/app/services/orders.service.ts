import { Injectable } from '@angular/core';
import { collection, doc, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';


export type OrderStatus = 'pendente' | 'confirmado' | 'preparando' | 'concluido' | 'cancelado';
export type PaymentStatus = 'aguardando' | 'aprovado' | 'recusado';


export interface Order {
id?: string;
customerName: string;
items: { nome: string; qty: string; preco: string }[];
total: string;
status: OrderStatus;
createdAt?: any;
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


async updateOrderStatus(userId: string, orderId: string, newStatus: Order['status']) {
const db = this.firebase.getDb();
const orderRef = doc(db, this.ordersCollectionPath(), orderId);
await updateDoc(orderRef, { status: newStatus });

} }