import { Component, OnInit, signal, computed, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, onSnapshot, query, QuerySnapshot, orderBy, updateDoc, serverTimestamp, Firestore, DocumentData, DocumentSnapshot, where} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut, Auth,User } from 'firebase/auth';
import { EstablishmentProfile } from '../services/profile.service';
import { ProfileService } from '../services/profile.service';
import { FirebaseService } from '../services/firebase.service';
import { ProductsService } from '../services/products.service';

export interface ScheduleDay { open: string; close: string; isClosed: boolean; }
export type WeekSchedule = Record<string, ScheduleDay>;


interface Product { id?: string; nome: string; descricao: string; preco: number; isActive: boolean; imageUrl?: string;}

type OrderStatus = 'pendente' | 'concluido' | 'preparando' | 'cancelado';
type PaymentStatus = 'aprovado' | 'aprovado' | 'recusado';

interface Orders { id?: string; customerName: string; items?: { name: string; quantity: number; price: number }[]; total?: number;
status?: OrderStatus; paymentStatus?: PaymentStatus; createdAt?: any; description?: string; isActive?: boolean; 
price?: number; quantity?: number; }

@Component({
  selector: 'app-estabelecimento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe,],
  templateUrl: './estabelecimento.html',
  styleUrls: ['./estabelecimento.scss'],
})

export class Estabelecimento implements OnInit {
  nome: string = '';
  email: string = '';
  telefone: string = '';
  endereco: string = '';
  cidade: string = '';
  bairro: string = '';


  constructor(private ngZone: NgZone, public profile: ProfileService, private firebase: FirebaseService, 
    public productsService: ProductsService) 
  {this.firebase.init();
  this.initFirebaseClient();}
  private initFirebaseClient() {
  try {
    this.db = getFirestore();
    this.auth = getAuth();
    onAuthStateChanged(this.auth, (user) => {
      this.ngZone.run(() => {
        this.currentUser.set(user);
        if (user) {
          console.log('Usuário autenticado:', user.uid);
          this.initializeAuthAndData().catch(err => {
            console.error('Erro ao inicializar dados após auth:', err);
          });
        } else {
          console.log('Usuário não autenticado - limpando listeners');
          this.cleanupListeners();
          this.isAppReady.set(false);
          this.products.set([]);
          this.allOrders.set([]);
          this.profileFormState.set({
            name: '',
            address: '',
            phone: '',
            email: '',
            description: '',
            logoUrl: '',
            schedule: this.defaultSchedule
          });
        }
      });
    });
  } catch (err) {
    console.error('Erro inicializando cliente Firebase:', err);
  }
}
  
  
  private db!: Firestore;
  private auth!: Auth;
  
  public currentUser = signal<User | null>(null);
  public isAppReady = signal(false);
  public currentView = signal<'dashboard' | 'products' | 'orders' | 'profile'>('dashboard');
  public products = signal<Product[]>([]);
  public allOrders = signal<Orders[]>([]);
  public Profile = signal<EstablishmentProfile | null>(null);
  public profileState = signal<EstablishmentProfile | null>(null);
  public statuses: (OrderStatus | 'todos')[] = [
  'todos',
  'pendente',
  'preparando',
  'concluido',
  'cancelado'
];

  user: any = null;
  uploading = false;


  get uid(): string | null {
  return this.currentUser()?.uid ?? null;
}
  public newProduct = {
    nome: '',
    descricao: '',
    preco: null as number | null,
    imageUrl: ''
  };

  public currentOrderFilter = signal<OrderStatus | 'todos'>('pendente');
  public activeProductCount = computed(() => this.products().filter(p => p.isActive).length);
  public inactiveProductCount = computed(() => this.products().filter(p => !p.isActive).length);
  public pendingOrders = computed(() => this.allOrders().filter(o => o.status === 'pendente'));
  public newOrderCount = computed(() => this.pendingOrders().length);
  public filteredOrders = computed(() => {
    const filter = this.currentOrderFilter();
    const orders = this.allOrders();
    if (filter === 'todos') return orders;
    return orders.filter(o => o.status === filter);
  });

public updateClosed(day: string, event: Event) {
  const input = event.target as HTMLInputElement;
  const isClosed = input.checked;

  this.profileFormState.update(state => {
    const updatedSchedule: WeekSchedule = { ...(state.schedule ?? this.defaultSchedule) };

    updatedSchedule[day] = { ...updatedSchedule[day], isClosed };
    return { ...state, schedule: updatedSchedule };
  });
}
 public readonly defaultSchedule: WeekSchedule = {
    segunda: { open: '08:00', close: '18:00', isClosed: false },
    terca: { open: '08:00', close: '18:00', isClosed: false },
    quarta: { open: '08:00', close: '18:00', isClosed: false },
    quinta: { open: '08:00', close: '18:00', isClosed: false },
    sexta: { open: '08:00', close: '18:00', isClosed: false },
    sabado: { open: '09:00', close: '14:00', isClosed: false },
    domingo: { open: '', close: '', isClosed: true }
  };
  get schedule(): WeekSchedule {
    return this.profileFormState().schedule ?? this.defaultSchedule;
  }
public get scheduleDays(): ScheduleDay[] {
  return Object.values(this.schedule);
}
public trackByDay(index: number, item: { key: string; value: ScheduleDay }): string {
  return item.key;
}
public profileFormState = signal({
  name: '',
  address: '',
  phone: '',
  email: '',
  description: '',
  logoUrl: '',
  schedule: {} as any,
});

  private unsubProfile: (() => void) | null = null;
  private unsubProducts: (() => void) | null = null;
  private unsubOrders: (() => void) | null = null;

  ngOnInit() { this.firebase.userData$.subscribe((data) => {
    if (data) {
      this.nome = data.nome || '';
      this.email = data.email || '';
      this.telefone = data.telefone || '';
      this.endereco = data.endereco || '';
      this.cidade = data.cidade || '';
      this.bairro = data.bairro || '';
    }
  });
  }

  private async initializeAuthAndData() {
    try {
      await Promise.all([
        this.listenForProfile(this.currentUser()!.uid),
        this.listenForProducts(),
        this.listenForOrders(),
      ]);
      this.isAppReady.set(true);
      console.log('Dados do estabelecimento carregados.');
    } catch (e) {
      console.error('Erro carregando dados:', e);
    }}

  private ensureUserOrThrow() {
    const user = this.currentUser();
    if (!user) throw new Error('Usuário não autenticado.');
    return user;}

  private getEstablishmentsBasePathForUser(userId: string) {
  return `estabelecimentos/${userId}`;
}

private getProductsCollectionRef(collectionName: string) {
  const user = this.ensureUserOrThrow();
  const base = this.getEstablishmentsBasePathForUser(user.uid);
  return collection(this.db, `${base}/${collectionName}`);
}

  private getCollectionRef(collectionName: string) {
  const user = this.ensureUserOrThrow();
  const base = this.getEstablishmentsBasePathForUser(user.uid);
  return collection(this.db, `${base}/${collectionName}`);
}

  private getDocRef(collectionName: string, docId: string) {
  const user = this.ensureUserOrThrow();
  const base = this.getEstablishmentsBasePathForUser(user.uid);
  return doc(this.db, `${base}/${collectionName}/${docId}`);
}
  private listenForProfile(uid: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (this.unsubProfile) {
        this.unsubProfile();
        this.unsubProfile = null;
      }
      const sub = this.profile.listenForProfile(uid).subscribe({
        next: (profile) => {
          this.ngZone.run(() => {
            if (profile) {
              this.profileFormState.set(profile);
            } else {
              this.profileFormState.set({
                name: '',
                address: '',
                phone: '',
                email: this.currentUser()?.email ?? '',
                description: '',
                logoUrl: '',
                schedule: this.defaultSchedule,
              });
            }
          });
          resolve();
        },
        error: (err) => {
          console.error("Erro ao ouvir profile:", err);
          resolve();
        }
      });
      this.unsubProfile = () => sub.unsubscribe();
    } catch (error) {
      console.error("Erro inesperado em listenForProfile:", error);
      resolve();
    }
  });
}

  public async saveProfile() {
  const user = this.currentUser();
  if (!user) return alert("Usuário não autenticado.");

  const profile: EstablishmentProfile = {
    ...this.profileFormState(),
    schedule: this.profileFormState().schedule ?? this.defaultSchedule
  };

  try {
    await this.profile.saveProfile(user.uid, profile);
    alert("Perfil salvo com sucesso!");
  } catch (err) {
    console.error("Erro ao salvar perfil:", err);
    alert("Erro ao salvar perfil.");
  }
}
    public async logout() {
  try {
    await signOut(this.auth);

    this.currentUser.set(null);
    this.cleanupListeners();
    this.isAppReady.set(false);

    window.location.href = '/login';
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    alert('Erro ao fazer logout.');
  }
}

    public async getUserData(uid: string) {
      const userRef = doc(this.db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      } else {
        return null;
      }
    }
  

  public updateScheduleTime(day: string, field: 'open' | 'close', event: any) {
  const value = event.target.value;

  this.profileFormState.update(state => {
    const updatedSchedule = state.schedule ?? {};
    updatedSchedule[day] = {
      ...updatedSchedule[day],
      [field]: value
    };
    return { ...state, schedule: updatedSchedule };
  });
}

 private listenForProducts(): Promise<void> {
  return new Promise((resolve) => {
    try { 
      if (this.unsubProducts) {
        this.unsubProducts();
        this.unsubProducts = null;}
      const productsCol = this.getProductsCollectionRef('produtos'); 
      this.unsubProducts = onSnapshot(
        productsCol,
        (snap: QuerySnapshot<DocumentData>) => {
          const list: Product[] = [];
          snap.docs.forEach((docSnap) => {
            const d = docSnap.data() as Partial<Product>;
            list.push({
              id: docSnap.id,
              nome: d.nome ?? '',
              descricao: d.descricao ?? '',
              preco: d.preco ?? 0,
              isActive: d.isActive ?? true,
              imageUrl: d.imageUrl ?? ''
            });
          });
          this.products.set(list);
          resolve();
        },
        (err) => {
          console.error('Erro no snapshot products:', err);
          resolve();
        });
    } catch (e) {
      console.error('listenForProducts erro:', e);
      resolve();
    }
  });
}
  public async addProduct() {
    try {
      if (!this.newProduct.nome || this.newProduct.preco == null) {
        alert('Nome e preço são obrigatórios.');
        return;
      }
      const productsCol = this.getCollectionRef('produtos');
      await addDoc(productsCol as any, {
        nome: this.newProduct.nome,
        descricao: this.newProduct.descricao,
        preco: this.newProduct.preco,
        imageUrl: this.newProduct.imageUrl || `https://placehold.co/100x100/A0A0A0/FFFFFF?text=${encodeURIComponent(this.newProduct.nome.substring(0,3))}`
      });
      this.newProduct = { nome: '', descricao: '', preco: null, imageUrl: '' };
      console.log('Produto adicionado.');
    } catch (e) {
      console.error('Erro ao adicionar produto:', e);
      alert('Erro ao adicionar produto. Veja console.');
    }}
    
  public async toggleProductActive(productId?: string, current?: boolean) {
    if (!productId) return;
    try {
      const user = this.ensureUserOrThrow();
      const productDoc = doc(this.db, `${this.getEstablishmentsBasePathForUser(user.uid)}/produtos/${productId}`);
      await updateDoc(productDoc as any, { isActive: !current });
      console.log('Produto atualizado.');
    } catch (e) {
      console.error('Erro ao alternar produto:', e);
    }
  }
async deleteProduct(userId: string | null, productId?: string) {
  if (!productId) return;
  const uidToUse = userId ?? this.currentUser()?.uid;
  if (!uidToUse) {
    alert('Usuário não autenticado.');
    return;
  }
  const confirmDelete = confirm('Tem certeza que deseja remover este produto?');
  if (!confirmDelete) return;
  try {
    await this.productsService.deleteProduct(uidToUse, productId);
    console.log('Produto removido com sucesso');
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    alert('Erro ao remover produto. Veja console.');
  }
}

private listenForOrders(): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (this.unsubOrders) {
        this.unsubOrders();
        this.unsubOrders = null;
      }

      const user = this.ensureUserOrThrow();
      const estabId = user.uid; // ID do estabelecimento logado

      const ordersCol = collection(this.db, 'orders'); 
      const qOrders = query(
      ordersCol,
      where('estabId', '==', estabId)
      );

      this.unsubOrders = onSnapshot(
  qOrders,
  (snap: QuerySnapshot<DocumentData>) => {
    const list: Orders[] = snap.docs.map(doc => {
      const data = doc.data() as Partial<Orders>; // pegar dados parciais
      return {
        id: doc.id,
        customerName: data.customerName ?? 'Cliente sem nome',
        items: data.items ?? [],
        total: data.total ?? 0,
        status: data.status ?? 'pendente',
        paymentStatus: data.paymentStatus ?? 'aprovado',
        createdAt: data.createdAt ?? null,
        description: data.description ?? '',
        isActive: data.isActive ?? true,
        price: data.price ?? 0,
        quantity: data.quantity ?? 0,
      };
    });

    this.allOrders.set(list);
    console.log('Pedidos carregados:', list);
    resolve();
  },
  (err) => {
    console.error('Erro no snapshot orders:', err);
    resolve();
  }
);

    } catch (err) {
      console.error('Erro ao iniciar listener de orders:', err);
      resolve();
    }
  });
}



  public async updateOrderStatus(orderId: string | undefined, newStatus: OrderStatus) {
    if (!orderId) return;
    try {
      const user = this.ensureUserOrThrow();
      const orderDoc = doc(this.db, `${this.getEstablishmentsBasePathForUser(user.uid)}/orders/${orderId}`);
      console.log(`Pedido ${orderId} atualizado para ${newStatus}`);
    } catch (e) {
      console.error('Erro ao atualizar pedido:', e);
    }
  }
  public filterOrders(status: OrderStatus | 'todos') { this.currentOrderFilter.set(status); }
  public getOrderCountByStatus(status: OrderStatus | 'todos'): number {
    if (status === 'todos') return this.allOrders().length;
    return this.allOrders().filter(o => o.status === status).length;
  }
  public getOrderStatusBadgeClass(status?: OrderStatus): string {
    switch (status) {
      case 'pendente': return 'bg-red-500 text-white';
      case 'preparando': return 'bg-yellow-500 text-gray-800';
      case 'concluido': return 'bg-green-500 text-white';
      case 'cancelado': return 'bg-gray-400 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  }

  public getOrderCardClass(status?: OrderStatus): string {
    switch (status) {
      case 'pendente': return 'border-red-500';
      case 'preparando': return 'border-yellow-500';
      case 'concluido': return 'border-green-500';
      default: return 'border-gray-300';
    }
  }
  public getViewClass(view: 'dashboard' | 'products' | 'orders' | 'profile'): string {
    const isActive = this.currentView() === view;
    return `w-full text-left py-3 px-4 rounded-lg font-medium mb-2 flex items-center transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;
  }
  public changeView(view: 'dashboard' | 'products' | 'orders' | 'profile'): void { this.currentView.set(view); }
  private cleanupListeners() {
    if (this.unsubProfile) { this.unsubProfile(); this.unsubProfile = null; }
    if (this.unsubProducts) { this.unsubProducts(); this.unsubProducts = null; }
    if (this.unsubOrders) { this.unsubOrders(); this.unsubOrders = null; }
  }
}
