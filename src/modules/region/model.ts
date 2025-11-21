import { Timestamp } from 'firebase-admin/firestore';

export interface RegionDocument {
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Region {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}