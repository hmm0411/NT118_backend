export interface ICinema {
  id: string;
  name: string;
  address: string;
  regionId: string;  // Mối quan hệ với Region
  createdAt: Date;
  updatedAt: Date;
}
