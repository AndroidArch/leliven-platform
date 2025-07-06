import pb from '../client';

export interface ParkingLot {
  id: string;
  code: string;
  name: string;
  type: 'roadside' | 'offroad';
  spaces: number;
  parent: string;
  location: string;
  geo: {
    lon: number;
    lat: number;
  };
  description: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

export interface ParkingLotCollection {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: ParkingLot[];
}

interface ParkingLotsServiceMethods {
  getParkingLots(options?: {
    page?: number;
    perPage?: number;
    filter?: string;
    sort?: string;
  }): Promise<ParkingLotCollection>;
  getParkingLot(id: string): Promise<ParkingLot>;
  createParkingLot(
    data: Omit<ParkingLot, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>
  ): Promise<ParkingLot>;
  updateParkingLot(id: string, data: Partial<ParkingLot>): Promise<ParkingLot>;
  deleteParkingLot(id: string): Promise<boolean>;
}

const ParkingLotsService: ParkingLotsServiceMethods = {
  async getParkingLots(options = {}): Promise<ParkingLotCollection> {
    const { page = 1, perPage = 30, filter = '', sort = '-created' } = options;
    return await pb.collection('parking_lots').getList(page, perPage, {
      filter,
      sort
    });
  },

  async getParkingLot(id: string): Promise<ParkingLot> {
    return await pb.collection('parking_lots').getOne(id);
  },

  async createParkingLot(data): Promise<ParkingLot> {
    return await pb.collection('parking_lots').create(data);
  },

  async updateParkingLot(id: string, data: Partial<ParkingLot>): Promise<ParkingLot> {
    return await pb.collection('parking_lots').update(id, data);
  },

  async deleteParkingLot(id: string): Promise<boolean> {
    await pb.collection('parking_lots').delete(id);
    return true;
  }
};

export default ParkingLotsService;
