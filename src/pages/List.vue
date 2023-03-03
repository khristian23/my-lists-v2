<template>
  <q-page class="flex">
    <q-form class="full-width q-pa-md" ref="listForm">
      <div class="text-h6 q-mb-sm">{{ selectedType?.label }} Details</div>
      <q-input
        :disable="disable"
        outlined
        v-model="list.name"
        label="Name"
        class="q-mb-sm"
        :rules="[(val) => (val && val.length > 0) || 'Please enter a name']"
      />
      <q-input
        :disable="disable"
        outlined
        v-model="list.description"
        label="Description"
        class="q-mb-md"
      />
      <q-select
        :disable="disable"
        outlined
        v-model="selectedType"
        :options="listTypeOptions"
        class="q-mb-md"
        @update:model-value="onTypeSelection"
        label="Type"
        id="type"
      >
        <template v-slot:prepend>
          <q-icon :name="selectedType?.icon" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" :data-testid="scope.opt.label">
            <q-item-section avatar>
              <q-icon :name="scope.opt.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label v-html="scope.opt.label" />
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-select
        :disable="disable"
        outlined
        v-model="selectedSubType"
        :options="selectedType?.subTypes"
        v-if="selectedType?.subTypes.length"
        class="q-mb-md"
        label="Sub Type"
      >
        <template v-slot:prepend>
          <q-icon :name="selectedType?.icon" />
        </template>
      </q-select>

      <div class="text-h6 q-mt-md">Shared With</div>
      <div class="q-pa-md q-mx-auto" style="max-width: 400px">
        <q-list bordered>
          <q-item
            v-for="user in shareableUsers"
            :key="user.id"
            class="q-mb-sm"
            data-testid="shareableUser"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                <img :src="user.photoURL" alt="Profile picture" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ user.name }}</q-item-label>
              <q-item-label caption lines="1">{{ user.email }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-chip
                color="green"
                text-color="white"
                v-if="user.id === list.owner"
                >Owner</q-chip
              >
              <q-toggle
                :disable="disable"
                color="green"
                v-model="list.sharedWith"
                v-else
                :val="user.id"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-form>
    <the-footer>
      <q-btn
        unelevated
        icon="save"
        @click="onSave"
        label="Save"
        v-if="!disable"
      />
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import List from '@/models/list';
import constants from '@/util/constants';
import { QForm } from 'quasar';
import {
  ListTypeOption,
  ListSubTypeOption,
  isListType,
  Listable,
} from '@/models/models';
import { useGlobals } from '@/composables/useGlobals';
import { useListables } from '@/composables/useListables';
import { useUser } from '@/composables/useUser';
import User from '@/models/user';

export default defineComponent({
  name: 'list-page',
  props: ['id', 'type'],
  emits: [constants.events.showError, constants.events.showToast],
  setup(props, { emit }) {
    const list = ref<Listable>(new List({}));
    const selectedType = ref<ListTypeOption>();
    const selectedSubType = ref<ListSubTypeOption | null>();
    const shareableUsers = ref<Array<User>>();
    const listForm = ref<QForm | null>(null);

    const { setTitle } = useGlobals();
    const { getListById, createNewListable, saveListable } = useListables();
    const { getUsersList } = useUser();
    const router = useRouter();

    const editMode = props.id != 'new';
    const disable = computed(() => list.value?.isShared);
    const listTypeOptions = ref(constants.lists.types);

    onMounted(async () => {
      if (!editMode) {
        list.value = createNewListable();

        if (isListType(props.type)) {
          list.value.type = props.type;
        }
      } else {
        list.value = await getListById(props.id);
      }

      setTypeAndSubType();
      loadShareableUsers();
    });

    const setTypeAndSubType = () => {
      selectedType.value = listTypeOptions.value.find(
        ({ value }) => value === list.value.type
      );

      onTypeSelection();

      if (list.value.subtype) {
        selectedSubType.value = selectedType.value?.subTypes.find(
          ({ value }) => value === list.value.subtype
        );
      }
    };

    const loadShareableUsers = async () => {
      shareableUsers.value = await getUsersList();
    };

    watch(
      () => list.value?.name,
      () => setHeaderTitle()
    );

    const setHeaderTitle = () => {
      if (list.value?.name) {
        setTitle(list.value.name);
      } else if (editMode) {
        setTitle(`Create ${selectedType.value?.type}`);
      } else {
        setTitle(`Edit ${selectedType.value?.type}`);
      }
    };

    const onTypeSelection = () => {
      const subTypes = selectedType.value?.subTypes ?? [];

      selectedSubType.value = null;
      if (subTypes.length) {
        selectedSubType.value = subTypes[0];
      }

      setHeaderTitle();
    };

    const onSave = async () => {
      const isFormValid = await listForm?.value?.validate();

      if (!isFormValid) {
        return;
      }

      list.value.type = selectedType.value?.value ?? '';
      list.value.subtype = selectedSubType.value?.value ?? '';

      try {
        const listable = await saveListable(list.value);
        emit(constants.events.showToast, 'List Item saved');

        if (list.value.type === constants.listType.note) {
          router.replace({
            name: constants.routes.note.name,
            params: { id: listable.id },
          });
        } else {
          router.replace({
            name: constants.routes.listItems.name,
            params: { id: listable.id },
          });
        }
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    return {
      listForm,
      list,
      selectedType,
      selectedSubType,
      disable,
      listTypeOptions,
      onTypeSelection,
      shareableUsers,
      onSave,
    };
  },
});
</script>
