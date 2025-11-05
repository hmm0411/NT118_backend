export interface CreateCinemaDto {
  name: string;
  address: string;
  regionId: string;
}

export interface UpdateCinemaDto {
  name?: string;
  address?: string;
  regionId?: string;
}
