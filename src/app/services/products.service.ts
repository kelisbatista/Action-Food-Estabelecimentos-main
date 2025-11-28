import { Injectable, Inject } from '@angular/core';
import { collection, addDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';


export interface Product {
id?: string;
name: string;
description: string;
price: number;
isActive: boolean;
imageUrl?: string;
}


@Injectable({ providedIn: 'root' })
export class ProductsService {
constructor(@Inject(FirebaseService) private firebase: FirebaseService) {}


private productsCollectionPath(userId: string) {
// Estrutura: establishments/{userId}/products
return `estabelecimentos/${userId}/produtos`;
}


listenForProducts(userId: string): Observable<Product[]> {
return new Observable<Product[]>(subscriber => {
const db = this.firebase.getDb();
const path = this.productsCollectionPath(userId);
const colRef = collection(db, path);


const unsub = onSnapshot(colRef, snap => {
const items: Product[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
subscriber.next(items);
}, err => subscriber.error(err));


return () => unsub();
});
}


async addProduct(userId: string, product: Omit<Product, 'id'>) {
const db = this.firebase.getDb();
const path = this.productsCollectionPath(userId);
const colRef = collection(db, path);
return await addDoc(colRef, product);
}


async updateProduct(userId: string, productId: string, patch: Partial<Product>) {
const db = this.firebase.getDb();
const docRef = doc(db, this.productsCollectionPath(userId), productId);
return await updateDoc(docRef, patch as any);
}


async deleteProduct(userId: string | null | undefined, productId: string) {
  if (!userId) throw new Error("UserId não informado para deleteProduct");

  const db = this.firebase.getDb();
  const docRef = doc(db, this.productsCollectionPath(userId), productId);
  return await deleteDoc(docRef);
}
}