import { Timestamp } from 'firebase-admin/firestore';

export interface CinemaDocument {
  name: string;
  address: string;
  regionId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  regionId: string;
  createdAt: Date;
  updatedAt: Date;
}