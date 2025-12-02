import { Injectable } from '@angular/core';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { WeekSchedule } from '../estabelecimento/estabelecimento';


export interface ScheduleDay { day: string; open: string; close: string; isClosed: boolean }
export interface EstablishmentProfile {
name: string; address: string; phone: string; email: string; description: string; logoUrl: string; schedule: WeekSchedule;
}


@Injectable({ providedIn: 'root' })
export class ProfileService {
constructor(private firebase: FirebaseService) {}


private profileDocPath(userId: string) {
return `estabelecimentos/${userId}`;
}


listenForProfile(userId: string): Observable<EstablishmentProfile | null> {
return new Observable<EstablishmentProfile | null>(subscriber => {
const db = this.firebase.getDb();
const docRef = doc(db, this.profileDocPath(userId));


const unsub = onSnapshot(docRef, snap => {
if (!snap.exists()) return subscriber.next(null);
subscriber.next(snap.data() as EstablishmentProfile);
}, err => subscriber.error(err));


return () => unsub();
});
}


async saveProfile(userId: string, profile: EstablishmentProfile) {
const db = this.firebase.getDb();
const docRef = doc(db, this.profileDocPath(userId));
return await setDoc(docRef, profile);
}
}