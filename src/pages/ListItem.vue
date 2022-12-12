<template>
  <q-page class="flex">
    <q-form ref="listItemForm" class="full-width q-pa-md">
      <q-input
        outlined
        v-model="listItem.name"
        label="Name"
        :rules="[(val) => (val && val.length > 0) || 'Please enter a name']"
        @keydown.enter.prevent=""
      />
      <q-select
        outlined
        v-model="listItem.status"
        :options="listItemStatuses"
        label="Status"
        :readonly="!inEditMode"
        :emit-value="true"
        class="q-pb-md"
      />
      <q-input
        outlined
        v-model="listItem.notes"
        label="Notes"
        type="textarea"
        class="q-pb-md"
      />
    </q-form>
    <the-footer>
      <q-btn unelevated icon="save" @click="onSave" label="Save" />
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import ListItem from '@/models/listItem';
import constants from '@/util/constants';
import { QForm } from 'quasar';
import { defineComponent, ref, computed, onMounted, Ref, watch } from 'vue';
import { useListItems } from '@/composables/useListItems';
import { useRouter } from 'vue-router';
import { useGlobals } from '@/composables/useGlobals';

export default defineComponent({
  name: 'list-item-page',
  props: ['id', 'list'],
  emits: [constants.events.showError, constants.events.showToast],
  setup(props, { emit }) {
    const router = useRouter();
    const { setTitle } = useGlobals();
    const listItemForm = ref<QForm | null>(null);
    const { saveListItem, getListItemById } = useListItems();
    let listItem: Ref<ListItem> = ref(
      new ListItem({
        status: constants.itemStatus.pending,
        listId: props.list,
      })
    );

    const inEditMode = computed(() => {
      return props.id !== 'new';
    });

    onMounted(async () => {
      if (inEditMode.value) {
        try {
          listItem.value = await getListItemById(props.list, props.id);
        } catch (e: unknown) {
          emit(constants.events.showError, (e as Error).message);
          router.replace({
            name: constants.routes.listItems.name,
            params: { id: props.list },
          });
        }
      }
    });

    setTitle('New List Item');
    watch(
      () => listItem.value.name,
      (listItemName) => setTitle(listItemName)
    );

    const listItemStatuses = computed(() => {
      return Object.values(constants.itemStatus).map((value) => {
        return {
          value,
          label: value,
        };
      });
    });

    const onSave = async () => {
      const isFormValid = await listItemForm?.value?.validate();

      if (!isFormValid) {
        return;
      }

      try {
        await saveListItem(listItem.value);
        emit(constants.events.showToast, 'List Item saved');
        router.replace({
          name: constants.routes.listItems.name,
          params: { id: props.list },
        });
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    return {
      inEditMode,
      listItemForm,
      listItem,
      listItemStatuses,
      onSave,
    };
  },
});
</script>
