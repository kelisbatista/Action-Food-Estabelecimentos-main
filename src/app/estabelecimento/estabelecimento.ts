import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';



interface EstablishmentProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  logoUrl: string;
  schedule: ScheduleDay[];
}

interface ScheduleDay {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  imageUrl: string;
}

interface Orders {
  id: string;
  costumername: string;
  description: string;
  price: number;
  isActive: boolean;
  imageUrl: string;
  quantity: number;
  createdAt: Date | FieldValue;
  customerName: string;
  items: { name: string, quantity: number, price: number }[];
  total: number;
  status: 'PENDENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'CONCLUÍDO' | 'CANCELADO';
  paymentStatus: 'AGUARDANDO' | 'APROVADO' | 'RECUSADO';
}


@Component({
  selector: 'app-estabelecimento',
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './estabelecimento.html',
  standalone: true,
  styleUrls:['./estabelecimento.scss'],
})

export class Estabelecimento implements OnInit {
[x: string]: any;
  public saveProfile(): void {
    throw new Error('Method not implemented.');
  }
  // Variáveis globais
  private appId = typeof (window as { [key: string]: any })['__app_id'] !== 'undefined' ? (window as { [key: string]: any })['__app_id'] as string : 'default-app-id';

  private firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
  };

  private initialAuthToken = typeof (window as { [key: string]: any })['__initial_auth_token'] !== 'undefined' ? (window as { [key: string]: any })['__initial_auth_token'] as string : null;


  private db!: Firestore;
  private auth!: Auth;
  
  public userId = signal<User | null>(null);
  public isAppReady = signal(false);
  public currentView = signal<'dashboard' | 'products' | 'orders' | 'profile'>('dashboard');


  public products = signal<Product[]>([]);
  public activeProductCount = computed(() => this.products().filter(p => p.isActive).length);
  public inactiveProductCount = computed(() => this.products().filter(p => !p.isActive).length);
  public allOrders = signal<Orders[]>([]);
  public pendingOrders = computed(() => this.allOrders().filter(order => order.status === 'PENDENTE'));
  public newOrderCount = computed(() => this.pendingOrders().length);

  public currentOrderFilter = signal<Orders['status'] | 'TODOS'>('PENDENTE');
  public orderStatuses: (Orders['status'] | 'TODOS')[] = ['TODOS', 'PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'CONCLUÍDO', 'CANCELADO'];

  public newProduct = {
    name: '',
    description: '',
    price: null as number | null,
    imageUrl: '',
  };


  public establishmentProfile = signal<EstablishmentProfile | null>(null);
  public profileFormState = signal<EstablishmentProfile | null>(null);

  private defaultSchedule: ScheduleDay[] = [
    { day: 'Domingo', open: '09:00', close: '18:00', isClosed: true },
    { day: 'Segunda-feira', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Terça-feira', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Quarta-feira', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Quinta-feira', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Sexta-feira', open: '09:00', close: '22:00', isClosed: false },
    { day: 'Sábado', open: '10:00', close: '22:00', isClosed: false },
  ];

  ngOnInit() {
    if (this.firebaseConfig) {
      try {
        const app = initializeApp(this.firebaseConfig);
        this.db = getFirestore(app);
        this.auth = getAuth(app);

        this.initializeAuthAndData();

      } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
      }
    } else {
      console.error("Configuração do Firebase não encontrada.");
    }
  }
  initializeAuthAndData() {
    throw new Error('Method not implemented.');
  }
 
  private getEstablishmentCollectionPath({ collectionName }: { collectionName: string; }): any  {
    const user = this.userId()?.uid;
    if (!user) {
        throw new Error("Usuário não autenticado.");
    }
    return `artifacts/${this.appId}/public/data/establishments/${user}/${collectionName}`;
  }

  //PERFIL

  private listenForProfile() {
    const profilePath = `artifacts/${this.appId}/public/data/establishments/${this.userId()}/profile/details`;
    const docRef = doc(this.db, profilePath);
  }


  public updateScheduleTime(dayName: string, type: 'open' | 'close', time: string): void {
    const currentProfile = this.profileFormState();
    if (currentProfile) {
        const updatedSchedule = currentProfile.schedule.map(day =>
            day.day === dayName ? { ...day, [type]: time } : day
        );
        this.profileFormState.set({ ...currentProfile, schedule: updatedSchedule });
    }
  }

  // PRODUTOS

  private async listenForProducts() {
    const productsPath = this.getEstablishmentCollectionPath({ collectionName: 'products' });
    const q = collection(this.db, productsPath);


    if (this.newProduct.name && this.newProduct.price !== null && this.newProduct.description) {
      try {
        const newDocRef = doc(collection(this.db, this.getEstablishmentCollectionPath({ collectionName: 'products' })));
        const productData: Omit<Product, 'id'> = {
          name: this.newProduct.name,
          description: this.newProduct.description,
          price: this.newProduct.price,
          isActive: true,
          imageUrl: this.newProduct.imageUrl || `https://placehold.co/100x100/A0A0A0/FFFFFF?text=${this.newProduct.name.substring(0, 3)}`,
        };
      
        this.newProduct = { name: '', description: '', price: null, imageUrl: '' };
        console.log("Produto adicionado com sucesso!");

      } catch (e) {
        console.error("Erro ao adicionar produto: ", e);
      }
    }
  }

 //PEDIDOS

  private listenForOrders() {
    const ordersPath = this.getEstablishmentCollectionPath({ collectionName: 'orders' });
    const q = query(collection(this.db, ordersPath), orderBy('createdAt', 'desc'));
  }

    private customerName = 'Default Customer';
    private product = { name: 'Sample Product', price: 10 };
    private quantity = 1;
    private newOrder: Omit<Orders, 'id'> = {
      customerName: this.customerName,
      items: [{ name: this.product.name, quantity: this.quantity, price: this.product.price }],
      total: this.product.price * this.quantity,
      status: 'PENDENTE',
      paymentStatus: 'AGUARDANDO',
      createdAt: serverTimestamp(),
      description: '',
      price: 0,
      isActive: false,
      imageUrl: '',
      quantity: 0,
      costumername: ''
    };
    public async updateOrderStatus(orderId: string, newStatus: Orders['status']) {
    if (!this.db || !this.userId()) return;

    let paymentUpdate: Partial<Orders> = { status: newStatus };

    if (newStatus === 'CONFIRMADO') {
        paymentUpdate.paymentStatus = 'APROVADO';
    }
      if (newStatus === 'CONCLUÍDO') {
      paymentUpdate.paymentStatus = 'APROVADO';
    }

    try {
      const orderRef = doc(this.db, this.getEstablishmentCollectionPath({ collectionName: 'orders' }), orderId);
      await updateDoc(orderRef, paymentUpdate);
      console.log(`Status do pedido ${orderId} atualizado para ${newStatus}.`);
    } catch (e) {
      console.error("Erro ao atualizar status do pedido: ", e);
    }
  }

  public filterOrders(status: Orders['status'] | 'TODOS') {
    this.currentOrderFilter.set(status);
  }

  public filteredOrders = computed(() => {
    const filter = this.currentOrderFilter();
    const orders = this.allOrders();

    if (filter === 'TODOS') {
      return orders;
    }
    return orders.filter(order => order.status === filter);
  });

  // Helpers para o Template

  public getOrderCountByStatus(status: Orders['status'] | 'TODOS'): number {
    if (status === 'TODOS') {
      return this.allOrders().length;
    }

    return this.allOrders().filter(order => order.status === status).length;
  }

  public getOrderFilterClass(status: Orders['status'] | 'TODOS'): string {
    const isActive = this.currentOrderFilter() === status;
    return `px-4 py-2 rounded-lg font-semibold transition duration-200 ${
      isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
    }`;
  }

  public getOrderStatusBadgeClass(status: Orders['status']): string {
    switch (status) {
      case 'PENDENTE': return 'bg-red-500 text-white';
      case 'CONFIRMADO': return 'bg-blue-500 text-white';
      case 'PREPARANDO': return 'bg-yellow-500 text-gray-800';
      case 'CONCLUÍDO': return 'bg-green-500 text-white';
      case 'CANCELADO': return 'bg-gray-400 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  }

  public getPaymentStatusClass(status: Orders['paymentStatus']): string {
    switch (status) {
      case 'APROVADO': return 'text-green-600 font-bold';
      case 'AGUARDANDO': return 'text-yellow-600 font-bold';
      case 'RECUSADO': return 'text-red-600 font-bold';
      default: return 'text-gray-500';
    }
  }

  public getOrderCardClass(status: Orders['status']): string {
    switch (status) {
      case 'PENDENTE': return 'border-red-500';
      case 'CONFIRMADO': return 'border-blue-500';
      case 'PREPARANDO': return 'border-yellow-500';
      case 'CONCLUÍDO': return 'border-green-500';
      default: return 'border-gray-300';
    }

  }

  public getViewClass(view: 'dashboard' | 'products' | 'orders' | 'profile'): string {
    const isActive = this.currentView() === view;
    return `w-full text-left py-3 px-4 rounded-lg font-medium mb-2 flex items-center transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'

    }`;
  }

   public changeView(view: 'dashboard' | 'products' | 'orders' | 'profile'): void {
    this.currentView.set(view);
  }
}

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, serverTimestamp, Firestore, Timestamp, FieldValue, FirestoreError, QuerySnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, UserCredential, onAuthStateChanged, Auth, User } from 'firebase/auth';
import { signal, computed, effect } from '@angular/core';