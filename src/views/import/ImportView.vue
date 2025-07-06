<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon start>mdi-upload</v-icon>
            数据导入
          </v-card-title>

          <v-card-text>
            <v-stepper v-model="currentStep" class="elevation-0">
              <!-- 步骤指示器 -->
              <v-stepper-header>
                <template v-for="(step, index) in steps" :key="index">
                  <v-stepper-item :value="index + 1" :title="step.title" :subtitle="step.subtitle"></v-stepper-item>
                  <v-divider v-if="index < steps.length - 1"></v-divider>
                </template>
              </v-stepper-header>

              <!-- 步骤内容 -->
              <v-stepper-window>
                <!-- 步骤1: 选择文件 -->
                <v-stepper-window-item :value="1">
                  <v-card flat>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <input
                            ref="fileInput"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            style="display: none"
                            @change="handleFileSelect"
                          />
                          <v-btn color="primary" prepend-icon="mdi-file-excel" @click="$refs.fileInput.click()">
                            选择Excel文件
                          </v-btn>
                          <div v-if="selectedFile" class="mt-2">
                            <v-chip color="success">
                              {{ selectedFile.name }}
                            </v-chip>
                          </div>
                        </v-col>
                      </v-row>

                      <v-row v-if="filePreview.length > 0">
                        <v-col cols="12">
                          <v-card variant="outlined">
                            <v-card-title>文件预览 (前5行)</v-card-title>
                            <v-card-text>
                              <v-table>
                                <thead>
                                  <tr>
                                    <th v-for="(header, index) in filePreview[0]" :key="index">
                                      {{ header }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(row, rowIndex) in filePreview.slice(1, 6)" :key="rowIndex">
                                    <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                                      {{ cell }}
                                    </td>
                                  </tr>
                                </tbody>
                              </v-table>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-stepper-window-item>

                <!-- 步骤2: 选择目标表 -->
                <v-stepper-window-item :value="2">
                  <v-card flat>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-select
                            v-model="selectedCollection"
                            :items="collections"
                            item-title="name"
                            item-value="name"
                            label="选择目标数据表"
                            :rules="[(v) => !!v || '请选择目标表']"
                            @update:model-value="handleCollectionChange"
                          ></v-select>
                        </v-col>
                      </v-row>

                      <v-row v-if="selectedCollection && collectionFields.length > 0">
                        <v-col cols="12">
                          <v-card variant="outlined">
                            <v-card-title>字段映射</v-card-title>
                            <v-card-text>
                              <v-table>
                                <thead>
                                  <tr>
                                    <th>Excel列名</th>
                                    <th>数据库字段</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(field, index) in fileHeaders" :key="index">
                                    <td>{{ field }}</td>
                                    <td>
                                      <v-select
                                        v-model="fieldMapping[field]"
                                        :items="collectionFields"
                                        item-title="name"
                                        item-value="name"
                                        :label="`映射到 ${field}`"
                                        density="compact"
                                        variant="outlined"
                                      ></v-select>
                                    </td>
                                  </tr>
                                </tbody>
                              </v-table>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-stepper-window-item>

                <!-- 步骤3: 确认导入 -->
                <v-stepper-window-item :value="3">
                  <v-card flat>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-alert type="info" variant="tonal" class="mb-4">
                            <strong>导入信息：</strong><br />
                            文件：{{ selectedFile?.name }}<br />
                            目标表：{{ selectedCollection }}<br />
                            数据行数：{{ fileData.length - 1 }} 行
                          </v-alert>
                        </v-col>
                      </v-row>

                      <v-row>
                        <v-col cols="12">
                          <v-card variant="outlined">
                            <v-card-title>导入预览</v-card-title>
                            <v-card-text>
                              <v-table>
                                <thead>
                                  <tr>
                                    <th v-for="field in collectionFields" :key="field.name">
                                      {{ field.name }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(row, index) in mappedData.slice(0, 3)" :key="index">
                                    <td v-for="field in collectionFields" :key="field.name">
                                      {{ (row as any)[field.name] || '-' }}
                                    </td>
                                  </tr>
                                </tbody>
                              </v-table>
                              <div class="text-caption mt-2">
                                调试信息：映射字段 {{ Object.keys(fieldMapping).join(', ') }} | 数据行数
                                {{ mappedData.length }} | 字段数 {{ collectionFields.length }}
                              </div>
                              <div class="text-caption mt-2">显示前3行数据，共 {{ mappedData.length }} 行</div>
                            </v-card-text>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-stepper-window-item>
              </v-stepper-window>
            </v-stepper>
          </v-card-text>

          <!-- 操作按钮 -->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn v-if="currentStep > 1" @click="currentStep--" variant="outlined"> 上一步 </v-btn>
            <v-btn v-if="currentStep < 3" @click="nextStep" :disabled="!canProceed" color="primary"> 下一步 </v-btn>
            <v-btn v-if="currentStep === 3" @click="startImport" :loading="importing" color="success"> 开始导入 </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 导入结果对话框 -->
    <v-dialog v-model="showResult" max-width="800">
      <v-card>
        <v-card-title>导入结果</v-card-title>
        <v-card-text>
          <v-alert :type="importResult.success ? 'success' : 'error'" variant="tonal" class="mb-4">
            {{ importResult.message }}
          </v-alert>

          <v-table v-if="importResult.details">
            <thead>
              <tr>
                <th>状态</th>
                <th>数据</th>
                <th>错误信息</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(detail, index) in importResult.details" :key="index">
                <td>
                  <v-icon :color="detail.success ? 'success' : 'error'">
                    {{ detail.success ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </td>
                <td>{{ JSON.stringify(detail.originalData) }}</td>
                <td>{{ detail.error || '-' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showResult = false" color="primary">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import ImportService from '@/api/pocketbase/services/import.service';

// 响应式数据
const currentStep = ref(1);
const selectedFile = ref<File | null>(null);
const selectedCollection = ref('');
const collections = ref<unknown[]>([]);
const fileData = ref<unknown[]>([]);
const fileHeaders = ref<string[]>([]);
const filePreview = ref<unknown[]>([]);
const collectionFields = ref<unknown[]>([]);
const fieldMapping = ref<Record<string, string>>({});
const importing = ref(false);
const showResult = ref(false);
const importResult = ref<unknown>({});

// 步骤配置
const steps = [
  { title: '选择文件', subtitle: '上传Excel文件' },
  { title: '选择表', subtitle: '选择目标数据表' },
  { title: '确认导入', subtitle: '确认导入设置' }
];

// 计算属性
const canProceed = computed(() => {
  console.log('canProceed check:', {
    currentStep: currentStep.value,
    selectedFile: !!selectedFile.value,
    fileDataLength: fileData.value.length,
    selectedCollection: selectedCollection.value,
    fieldMappingKeys: Object.keys(fieldMapping.value).length,
    collectionFieldsLength: collectionFields.value.length
  });

  switch (currentStep.value) {
    case 1:
      return selectedFile.value && fileData.value.length > 0;
    case 2:
      // 只要选择了表就可以进入下一步，字段映射可以在下一步中处理
      return selectedCollection.value && collectionFields.value.length > 0;
    default:
      return true;
  }
});

const mappedData = computed(() => {
  // 打印数据测试下
  console.log('=== mappedData 调试信息 ===');
  console.log('fileData:', fileData.value);
  console.log('fieldMapping:', fieldMapping.value);
  console.log('fileHeaders:', fileHeaders.value);
  console.log('collectionFields:', collectionFields.value);
  console.log('selectedCollection:', selectedCollection.value);
  console.log('selectedFile:', selectedFile.value);
  console.log('currentStep:', currentStep.value);

  console.log('mappedData computed:', {
    fileDataLength: fileData.value.length,
    fieldMappingKeys: Object.keys(fieldMapping.value).length,
    fieldMapping: fieldMapping.value,
    fileHeaders: fileHeaders.value
  });

  if (!fileData.value.length) {
    console.log('mappedData: fileData is empty');
    return [];
  }

  if (!Object.keys(fieldMapping.value).length) {
    console.log('mappedData: fieldMapping is empty');
    return [];
  }

  console.log('Processing data rows...');
  const result = fileData.value.slice(1).map((row: unknown, index: number) => {
    console.log(`Processing row ${index}:`, row);
    const mappedRow: unknown = {};

    Object.entries(fieldMapping.value).forEach(([excelField, dbField]) => {
      console.log(`Mapping ${excelField} -> ${dbField}, value:`, row[excelField]);
      if (dbField && row[excelField] !== undefined) {
        mappedRow[dbField] = row[excelField];
      }
    });

    console.log(`Mapped row ${index}:`, mappedRow);
    return mappedRow;
  });

  console.log('Final mappedData result:', result);
  return result;
});

// 方法
const loadCollections = async () => {
  try {
    collections.value = await ImportService.getCollections();
  } catch (error) {
    console.error('加载集合失败:', error);
  }
};

const handleFileSelect = async (event: unknown) => {
  const file = event.target.files[0];
  if (!file) {
    selectedFile.value = null;
    fileData.value = [];
    fileHeaders.value = [];
    filePreview.value = [];
    return;
  }

  selectedFile.value = file;
  console.log('Selected file:', file);

  try {
    const data = await readExcelFile(file);
    fileData.value = data;
    fileHeaders.value = data[0] || [];
    filePreview.value = data.slice(0, 6);
  } catch (error) {
    console.error('读取文件失败:', error);
  }
};

const readExcelFile = (file: File): Promise<unknown[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        console.log('Excel worksheet:', worksheet);

        // 直接使用对象格式读取，第一行作为列名
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log('Raw Excel data:', jsonData);

        if (jsonData.length > 0) {
          // 获取列名
          const headers = Object.keys(jsonData[0] as unknown);
          console.log('Excel headers:', headers);

          // 构建完整的数据结构
          const result = [headers, ...jsonData];
          console.log('Processed Excel data:', result);

          resolve(result);
        } else {
          resolve([]);
        }
      } catch (error) {
        console.error('Excel reading error:', error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const handleCollectionChange = () => {
  console.log('handleCollectionChange called with:', selectedCollection.value);
  console.log('Available collections:', collections.value);

  const collection = collections.value.find((c: unknown) => c.name === selectedCollection.value);
  console.log('Selected collection:', collection);

  if (collection && collection.fields) {
    collectionFields.value = collection.fields.map((field: unknown) => ({
      name: field.name,
      type: field.type,
      required: field.required,
      system: field.system
    }));
    console.log('Collection fields loaded:', collectionFields.value);
  } else {
    collectionFields.value = [];
    console.log('No collection fields found');
  }

  // 自动映射字段
  fieldMapping.value = {};
  fileHeaders.value.forEach((header) => {
    const matchingField = collectionFields.value.find(
      (field: unknown) =>
        field.name.toLowerCase() === header.toLowerCase() ||
        field.name.toLowerCase().includes(header.toLowerCase()) ||
        header.toLowerCase().includes(field.name.toLowerCase())
    );
    if (matchingField) {
      fieldMapping.value[header] = matchingField.name;
    }
  });

  console.log('Field mapping:', fieldMapping.value);
};

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const startImport = async () => {
  if (!selectedCollection.value || mappedData.value.length === 0) {
    return;
  }

  importing.value = true;
  try {
    const results = await ImportService.importData(selectedCollection.value, mappedData.value);

    const successCount = results.filter((r: unknown) => r.success).length;
    const errorCount = results.filter((r: unknown) => !r.success).length;

    importResult.value = {
      success: errorCount === 0,
      message: `导入完成！成功 ${successCount} 条，失败 ${errorCount} 条`,
      details: results
    };

    showResult.value = true;
  } catch (error) {
    importResult.value = {
      success: false,
      message: '导入失败：' + (error as Error).message
    };
    showResult.value = true;
  } finally {
    importing.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadCollections();
});
</script>

<style scoped>
.v-stepper {
  background: transparent;
}
</style>
