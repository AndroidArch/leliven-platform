import pb from '../client';

interface ImportServiceMethods {
  getCollections(): Promise<unknown[]>;
  importData(collectionName: string, data: unknown[]): Promise<unknown[]>;
}

const ImportService: ImportServiceMethods = {
  async getCollections(): Promise<unknown[]> {
    try {
      // 获取所有集合
      const collections = await pb.collections.getFullList();
      return collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        type: collection.type,
        fields: collection.fields
      }));
    } catch (error) {
      console.error('获取集合列表失败:', error);
      throw error;
    }
  },

  async importData(collectionName: string, data: unknown[]): Promise<unknown[]> {
    try {
      const results: unknown[] = [];

      // 批量导入数据
      for (const item of data) {
        try {
          const result = await pb.collection(collectionName).create(item as unknown);
          results.push({ success: true, data: result, originalData: item });
        } catch (error: unknown) {
          results.push({
            success: false,
            error: error.message || '导入失败',
            originalData: item
          });
        }
      }

      return results;
    } catch (error) {
      console.error('导入数据失败:', error);
      throw error;
    }
  }
};

export default ImportService;
