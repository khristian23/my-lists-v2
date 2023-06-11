<template>
  <q-page class="flex">
    <q-form class="full-width q-pa-md" ref="listForm">
      <div class="text-h6 q-mb-sm">{{ selectedType?.label }} Details</div>
      <q-input
        :disable="disable"
        outlined
        v-model="listable.name"
        label="Name"
        class="q-mb-sm"
        :rules="[(val) => (val && val.length > 0) || 'Please enter a name']"
      />
      <q-input
        :disable="disable"
        outlined
        v-model="listable.description"
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

      <div class="text-h6 q-mt-md" v-if="options.isList">Options</div>
      <div
        class="q-pa-md q-mx-auto"
        style="max-width: 400px"
        v-if="options.isList"
      >
        <q-list bordered>
          <q-item>
            <q-toggle
              v-model="options.keepDoneItems"
              label="Keep items with 'Done' status."
            />
          </q-item>
        </q-list>
      </div>

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
                v-if="user.id === listable.owner"
                >Owner</q-chip
              >
              <q-toggle
                :disable="disable"
                color="green"
                v-model="listable.sharedWith"
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
        no-caps
        v-if="!disable"
      />
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  reactive,
} from 'vue';
import { useRouter } from 'vue-router';
import List from '@/models/list';
import constants from '@/util/constants';
import { QForm } from 'quasar';
import {
  ListTypeOption,
  ListSubTypeOption,
  isListType,
  Listable,
  IList,
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
    const listable = ref<Listable>(new List({}));
    const options = reactive({
      isList: false,
      keepDoneItems: false,
    });
    const selectedType = ref<ListTypeOption>();
    const selectedSubType = ref<ListSubTypeOption | null>();
    const shareableUsers = ref<Array<User>>();
    const listForm = ref<QForm | null>(null);

    const { setTitle } = useGlobals();
    const { getListableById, createNewListable, saveListable } = useListables();
    const { getUsersList } = useUser();
    const router = useRouter();

    const editMode = props.id != 'new';
    const disable = computed(() => listable.value?.isShared);
    const listTypeOptions = ref(constants.lists.types);

    onMounted(async () => {
      if (!editMode) {
        listable.value = createNewListable();

        if (isListType(props.type)) {
          listable.value.type = props.type;
        }
      } else {
        listable.value = await getListableById(props.id);
      }

      setTypeAndSubType();
      loadListableOptions();
      loadShareableUsers();
    });

    watch(
      () => selectedType.value?.value,
      (listType) => {
        options.isList = listType != constants.listType.note;
      }
    );

    watch(
      () => listable.value?.name,
      () => setHeaderTitle()
    );

    const setTypeAndSubType = () => {
      selectedType.value = listTypeOptions.value.find(
        ({ value }) => value === listable.value.type
      );

      onTypeSelection();

      if (listable.value.subtype) {
        selectedSubType.value = selectedType.value?.subTypes.find(
          ({ value }) => value === listable.value.subtype
        );
      }
    };

    const loadShareableUsers = async () => {
      shareableUsers.value = await getUsersList();
    };

    const loadListableOptions = () => {
      if (!options.isList) {
        options.keepDoneItems = (listable.value as IList).keepDoneItems;
      }
    };

    const setHeaderTitle = () => {
      if (listable.value?.name) {
        setTitle(listable.value.name);
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

      listable.value.type = selectedType.value?.value ?? '';
      listable.value.subtype = selectedSubType.value?.value ?? '';

      if (listable.value.type != constants.listType.note) {
        (listable.value as IList).keepDoneItems = options.keepDoneItems;
      }

      try {
        const savedListable = await saveListable(listable.value);
        emit(constants.events.showToast, 'List Item saved');

        if (listable.value.type === constants.listType.note) {
          router.replace({
            name: constants.routes.note.name,
            params: { id: savedListable.id },
          });
        } else {
          router.replace({
            name: constants.routes.listItems.name,
            params: { id: savedListable.id },
          });
        }
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    return {
      listForm,
      listable,
      options,
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
