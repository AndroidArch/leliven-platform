<script setup lang="ts">
import { ref, reactive } from 'vue';
import { usePocketBaseStore } from '@/store/pocketbaseStore';
import { useSnackbarStore } from '@/store/snackbarStore';
import { useRoute, useRouter } from 'vue-router';
import { useLocale } from 'vuetify';

const { t } = useLocale();
const checkbox = ref(true);
const formRules = reactive({
  email: [
    (value: string) => {
      if (value) return true;
      return t('email required');
    }
  ],
  password: [
    (value: string) => {
      if (value) return true;
      return t('password required');
    }
  ]
});
const formModel = reactive({
  email: 'ylw@leliven.com',
  password: 'leliven123'
});

const pocketbaseStore = usePocketBaseStore();
const snackbarStore = useSnackbarStore();
const route = useRoute();
const router = useRouter();
const submiting = ref(false);
const formValid = ref(false);

const handleSubmit = async () => {
  if (formValid.value === true) {
    submiting.value = true;
    try {
      await pocketbaseStore.login(formModel.email, formModel.password);
      snackbarStore.showMessage('登录成功', 'success');
      router.replace(route.query.to ? String(route.query.to) : '/');
    } catch (error) {
      snackbarStore.showMessage('登录失败，请检查邮箱和密码', 'error');
    } finally {
      submiting.value = false;
    }
  }
};
</script>

<template>
  <VForm v-model="formValid" @submit.prevent>
    <VRow class="d-flex mb-3">
      <VCol cols="12">
        <VLabel class="mb-1">{{ $t('email') }}</VLabel>
        <VTextField
          variant="outlined"
          color="primary"
          name="email"
          type="email"
          :rules="formRules.email"
          v-model="formModel.email"
        />
      </VCol>
      <VCol cols="12">
        <VLabel class="mb-1">{{ $t('password') }}</VLabel>
        <VTextField
          variant="outlined"
          type="password"
          color="primary"
          :rules="formRules.password"
          v-model="formModel.password"
        />
      </VCol>
      <VCol cols="12" class="pt-0">
        <div class="d-flex flex-wrap align-center ml-n2">
          <VCheckbox v-model="checkbox" color="primary" hide-details>
            <template v-slot:label>{{ $t('remember') }}</template>
          </VCheckbox>
          <div class="ml-sm-auto">
            <RouterLink to="/" class="text-primary text-decoration-none">{{ $t('forget_pass') }} ?</RouterLink>
          </div>
        </div>
      </VCol>
      <VCol cols="12" class="pt-0">
        <VBtn :loading="submiting" type="submit" color="primary" block flat @click="handleSubmit">{{
          $t('sign_in')
        }}</VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
