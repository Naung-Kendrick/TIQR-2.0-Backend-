
export interface DataRow {
  id: string | number;
  [key: string]: any;
}

export interface StatusState {
  message: string;
  type: 'success' | 'error' | '';
}

export interface QRSettings {
  size: number;
  logoUrl: string;
  selectedColumns: string[];
}
