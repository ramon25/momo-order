export interface Order {
  name: string;
  meatMomos: number;
  veggieMomos: number;
  wantsSoySauce: boolean;
}

export interface NameConfig {
  name: string;
  defaultSoySauce: boolean;
}

export interface OrderHistoryState {
  orders: Order[][];
  currentIndex: number;
} 