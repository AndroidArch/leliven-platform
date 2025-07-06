<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon start>mdi-parking-lights</v-icon>
              车场管理
            </div>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()"> 新增车场 </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- 搜索栏 -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="搜索车场名称或代码"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleSearch"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="typeFilter"
                  :items="typeOptions"
                  label="车场类型"
                  variant="outlined"
                  density="compact"
                  @update:model-value="handleSearch"
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-checkbox
                  v-model="showOnlyParent"
                  label="仅显示父车场"
                  density="compact"
                  hide-details
                  @change="handleSearch"
                ></v-checkbox>
              </v-col>
              <v-col cols="12" md="3">
                <v-btn color="secondary" variant="outlined" @click="resetFilters" class="mt-1"> 重置筛选 </v-btn>
              </v-col>
            </v-row>

            <!-- 数据表格 -->
            <v-data-table
              :headers="headers"
              :items="parkingLots"
              :loading="loading"
              :items-per-page="pagination.perPage"
              :page="pagination.page"
              :total-items="pagination.totalItems"
              :server-items-length="pagination.totalItems"
              @update:options="handleTableUpdate"
              class="elevation-1"
            >
              <!-- 车场类型列 -->
              <template v-slot:item.type="{ item }">
                <v-chip :color="item.type === 'roadside' ? 'primary' : 'success'" size="small">
                  {{ item.type === 'roadside' ? '路边停车' : '场库停车' }}
                </v-chip>
              </template>

              <!-- 车位数量列 -->
              <template v-slot:item.spaces="{ item }">
                <v-chip color="info" size="small"> {{ item.spaces }} 个 </v-chip>
              </template>

              <!-- 地理位置列 -->
              <template v-slot:item.geo="{ item }">
                <div v-if="item.geo">{{ item.geo.lat.toFixed(6) }}, {{ item.geo.lon.toFixed(6) }}</div>
                <span v-else class="text-grey">未设置</span>
              </template>

              <!-- 创建时间列 -->
              <template v-slot:item.created="{ item }">
                {{ formatDate(item.created) }}
              </template>

              <!-- 操作列 -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  v-if="false"
                  icon="mdi-eye"
                  size="small"
                  color="info"
                  variant="text"
                  @click="viewDetails(item)"
                  title="查看详情"
                ></v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="warning"
                  variant="text"
                  @click="openDialog(item)"
                  title="编辑"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="confirmDelete(item)"
                  title="删除"
                ></v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 新增/编辑对话框 -->
    <v-dialog v-model="showDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title>
          {{ editingItem ? '编辑车场' : '新增车场' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.code"
                  label="车场代码"
                  variant="outlined"
                  :rules="[(v) => !!v || '请输入车场代码']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="车场名称"
                  variant="outlined"
                  :rules="[(v) => !!v || '请输入车场名称']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.type"
                  :items="typeOptions"
                  label="车场类型"
                  variant="outlined"
                  :rules="[(v) => !!v || '请选择车场类型']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.spaces"
                  label="车位数量"
                  variant="outlined"
                  type="number"
                  :rules="[(v) => v > 0 || '请输入有效的车位数量']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.parent"
                  :items="parentOptions"
                  item-title="label"
                  item-value="value"
                  label="上级车场"
                  variant="outlined"
                  clearable
                  placeholder="可选"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.location"
                  label="详细地址"
                  variant="outlined"
                  :rules="[(v) => !!v || '请输入详细地址']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.geo.lat"
                  label="纬度"
                  variant="outlined"
                  type="number"
                  step="0.000001"
                  placeholder="可选"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="formData.geo.lon"
                  label="经度"
                  variant="outlined"
                  type="number"
                  step="0.000001"
                  placeholder="可选"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="描述"
                  variant="outlined"
                  rows="3"
                  placeholder="可选"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog" variant="outlined">取消</v-btn>
          <v-btn @click="saveParkingLot" color="primary" :loading="saving" :disabled="!formValid">
            {{ editingItem ? '更新' : '保存' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 详情对话框 -->
    <v-dialog v-model="showDetails" max-width="600px">
      <v-card>
        <v-card-title>车场详情</v-card-title>
        <v-card-text v-if="selectedItem">
          <v-row>
            <v-col cols="6">
              <strong>车场代码：</strong>
            </v-col>
            <v-col cols="6">{{ selectedItem.code }}</v-col>
            <v-col cols="6">
              <strong>车场名称：</strong>
            </v-col>
            <v-col cols="6">{{ selectedItem.name }}</v-col>
            <v-col cols="6">
              <strong>车场类型：</strong>
            </v-col>
            <v-col cols="6">
              <v-chip :color="selectedItem.type === 'roadside' ? 'primary' : 'success'" size="small">
                {{ selectedItem.type === 'roadside' ? '路边停车' : '场库停车' }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <strong>车位数量：</strong>
            </v-col>
            <v-col cols="6">{{ selectedItem.spaces }} 个</v-col>
            <v-col cols="6">
              <strong>上级车场：</strong>
            </v-col>
            <v-col cols="6">{{ selectedItem.parent || '无' }}</v-col>
            <v-col cols="6">
              <strong>详细地址：</strong>
            </v-col>
            <v-col cols="6">{{ selectedItem.location }}</v-col>
            <v-col cols="6">
              <strong>地理位置：</strong>
            </v-col>
            <v-col cols="6">
              <div v-if="selectedItem.geo">
                {{ selectedItem.geo.lat.toFixed(6) }}, {{ selectedItem.geo.lon.toFixed(6) }}
              </div>
              <span v-else class="text-grey">未设置</span>
            </v-col>
            <v-col cols="6">
              <strong>创建时间：</strong>
            </v-col>
            <v-col cols="6">{{ formatDate(selectedItem.created) }}</v-col>
            <v-col cols="6">
              <strong>更新时间：</strong>
            </v-col>
            <v-col cols="6">{{ formatDate(selectedItem.updated) }}</v-col>
            <v-col cols="12" v-if="selectedItem.description">
              <strong>描述：</strong>
              <div class="mt-2">{{ selectedItem.description }}</div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDetails = false" color="primary">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="showDeleteConfirm" max-width="400px">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text> 确定要删除车场 "{{ itemToDelete?.name }}" 吗？此操作不可撤销。 </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteConfirm = false" variant="outlined">取消</v-btn>
          <v-btn @click="deleteParkingLot" color="error" :loading="deleting"> 删除 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import ParkingLotsService, { type ParkingLot } from '@/api/pocketbase/services/parking-lots.service';

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showDialog = ref(false);
const showDetails = ref(false);
const showDeleteConfirm = ref(false);
const formValid = ref(false);
const searchQuery = ref('');
const typeFilter = ref('');
const showOnlyParent = ref(false);

const parkingLots = ref<ParkingLot[]>([]);
const selectedItem = ref<ParkingLot | null>(null);
const itemToDelete = ref<ParkingLot | null>(null);
const editingItem = ref<ParkingLot | null>(null);

const pagination = reactive({
  page: 1,
  perPage: 30,
  totalItems: 0,
  totalPages: 0
});

// 表单数据
const formData = reactive({
  code: '',
  name: '',
  type: 'roadside' as 'roadside' | 'offroad',
  spaces: 0,
  parent: '',
  location: '',
  geo: {
    lon: 0,
    lat: 0
  },
  description: ''
});

// 表格列定义
const headers = [
  { title: '车场代码', key: 'code', sortable: true },
  { title: '车场名称', key: 'name', sortable: true },
  { title: '类型', key: 'type', sortable: true },
  { title: '车位数量', key: 'spaces', sortable: true },
  { title: '详细地址', key: 'location', sortable: false },
  { title: '地理位置', key: 'geo', sortable: false },
  { title: '创建时间', key: 'created', sortable: true },
  { title: '操作', key: 'actions', sortable: false, width: 150 }
];

// 车场类型选项
const typeOptions = [
  { title: '路边停车', value: 'roadside' },
  { title: '场库停车', value: 'offroad' }
];

const parentOptions = ref<{ label: string; value: string }[]>([]);

// 获取所有父车场
const loadParentOptions = async () => {
  try {
    const result = await ParkingLotsService.getParkingLots({
      page: 1,
      perPage: 1000,
      filter: 'parent = ""',
      sort: '-created'
    });
    parentOptions.value = [
      { label: '无', value: '' },
      ...result.items.map((item) => ({ label: item.name, value: item.id }))
    ];
  } catch (error) {
    parentOptions.value = [{ label: '无', value: '' }];
  }
};

// 计算属性
const currentFilter = computed(() => {
  const filters = [];
  if (searchQuery.value) {
    filters.push(`name ~ "${searchQuery.value}" || code ~ "${searchQuery.value}"`);
  }
  if (typeFilter.value) {
    filters.push(`type = "${typeFilter.value}"`);
  }
  if (showOnlyParent.value) {
    filters.push('parent = ""');
  }
  return filters.join(' && ');
});

// 方法
const loadParkingLots = async () => {
  loading.value = true;
  console.log('Loading parking lots with pagination:', {
    page: pagination.page,
    perPage: pagination.perPage,
    filter: currentFilter.value,
    sort: '-created'
  });

  try {
    const result = await ParkingLotsService.getParkingLots({
      page: pagination.page,
      perPage: pagination.perPage,
      filter: currentFilter.value,
      sort: '-created'
    });

    console.log('API response:', result);

    parkingLots.value = result.items;
    pagination.totalItems = result.totalItems;
    pagination.totalPages = result.totalPages;

    console.log('Updated pagination state:', {
      items: parkingLots.value.length,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
      currentPage: pagination.page
    });
  } catch (error) {
    console.error('加载车场列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadParkingLots();
};

const resetFilters = () => {
  searchQuery.value = '';
  typeFilter.value = '';
  showOnlyParent.value = false;
  handleSearch();
};

const handleTableUpdate = (options: unknown) => {
  console.log('Table update options:', options);
  if (options.page !== undefined) {
    pagination.page = options.page;
  }
  if (options.itemsPerPage !== undefined) {
    pagination.perPage = options.itemsPerPage;
  }
  loadParkingLots();
};

const openDialog = (item?: ParkingLot) => {
  editingItem.value = item || null;
  loadParentOptions();
  if (item) {
    // 编辑模式
    Object.assign(formData, {
      code: item.code,
      name: item.name,
      type: item.type,
      spaces: item.spaces,
      parent: item.parent,
      location: item.location,
      geo: { ...item.geo },
      description: item.description
    });
  } else {
    // 新增模式
    Object.assign(formData, {
      code: '',
      name: '',
      type: 'roadside',
      spaces: 0,
      parent: '',
      location: '',
      geo: { lon: 0, lat: 0 },
      description: ''
    });
  }
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  editingItem.value = null;
};

const saveParkingLot = async () => {
  if (!formValid.value) return;

  saving.value = true;
  try {
    if (editingItem.value) {
      await ParkingLotsService.updateParkingLot(editingItem.value.id, formData);
    } else {
      await ParkingLotsService.createParkingLot(formData);
    }

    closeDialog();
    loadParkingLots();
  } catch (error) {
    console.error('保存车场失败:', error);
  } finally {
    saving.value = false;
  }
};

const viewDetails = (item: ParkingLot) => {
  selectedItem.value = item;
  showDetails.value = true;
};

const confirmDelete = (item: ParkingLot) => {
  itemToDelete.value = item;
  showDeleteConfirm.value = true;
};

const deleteParkingLot = async () => {
  if (!itemToDelete.value) return;

  deleting.value = true;
  try {
    await ParkingLotsService.deleteParkingLot(itemToDelete.value.id);
    showDeleteConfirm.value = false;
    itemToDelete.value = null;
    loadParkingLots();
  } catch (error) {
    console.error('删除车场失败:', error);
  } finally {
    deleting.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

// 生命周期
onMounted(() => {
  loadParkingLots();
});
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}
</style>
