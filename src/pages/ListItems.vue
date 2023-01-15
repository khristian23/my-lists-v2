<template>
  <q-page class="flex">
    <the-list
      id="pendingList"
      headerLabel="Pending"
      :showHeader="showPendingListHeader"
      :items="pendingListItems"
      @itemPress="onItemPress"
      @itemAction="onItemActionPressed"
      @itemDelete="onItemDelete"
      v-if="showPendingItemsList"
      @orderUpdated="onOrderUpdated"
    />
    <the-list
      id="doneList"
      headerLabel="Done"
      :items="list.doneItems"
      class="self-end"
      @itemPress="onItemPress"
      @itemAction="onItemActionPressed"
      @itemDelete="onItemDelete"
      v-if="showDoneItemsList"
      :scratched="true"
    />
    <the-footer>
      <the-quick-item-create @quickCreate="onQuickCreate" @create="onCreate" />
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import { useListItems } from '@/composables/useListItems';
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useGlobals } from '@/composables/useGlobals';
import { useRouter } from 'vue-router';
import constants from '@/util/constants';
import { IListItem } from '@/models/models';

export default defineComponent({
  name: 'list-items-page',
  props: ['id'],
  emits: [constants.events.showError],
  setup(props, { emit }) {
    const {
      getCurrentListWithItems,
      loadListWithItems,
      toggleItemStatus,
      deleteListItem,
      quickCreateListItem,
      updateItemsOrder,
    } = useListItems();
    const { setTitle } = useGlobals();

    const router = useRouter();
    const newItem = ref('');
    const showCreateButton = ref(true);
    const list = getCurrentListWithItems();

    onMounted(async () => {
      try {
        await loadListWithItems(props.id);
        setTitle(list.value.name);
      } catch (e: unknown) {
        router.replace({ name: constants.routes.lists.name });
        emit(constants.events.showError, (e as Error).message);
      }
    });

    const showPendingListHeader = computed(() => {
      return list.value.type !== constants.listType.checklist;
    });

    const showPendingItemsList = computed(() => {
      const isChecklistType = list.value.type === constants.listType.checklist;
      return list.value.hasPendingItems || isChecklistType;
    });

    const showDoneItemsList = computed(() => {
      const isNotChecklistType =
        list.value.type !== constants.listType.checklist;
      return list.value.hasDoneItems && isNotChecklistType;
    });

    const pendingListItems = computed(() => {
      if (list.value.type === constants.listType.checklist) {
        return list.value.items;
      }
      return list.value.pendingItems;
    });

    const onItemActionPressed = async (listItemId: string) => {
      try {
        await toggleItemStatus(list.value.id, listItemId);
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    const onItemPress = (listItemId: string) => {
      router.push({
        name: constants.routes.listItem.name,
        params: { list: list.value.id, id: listItemId },
      });
    };

    const onItemDelete = async (listItemId: string) => {
      try {
        await deleteListItem(list.value.id, listItemId);
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    const onQuickCreate = async (itemName: string) => {
      try {
        await quickCreateListItem(list.value.id, itemName);
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    const onCreate = () => {
      router.push({
        name: constants.routes.listItem.name,
        params: { list: list.value.id, id: 'new' },
      });
    };

    const onOrderUpdated = async (listItems: Array<IListItem>) => {
      try {
        await updateItemsOrder(list.value.id, listItems);
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    return {
      list,
      newItem,
      showCreateButton,
      showPendingListHeader,
      showPendingItemsList,
      showDoneItemsList,
      pendingListItems,
      onItemActionPressed,
      onQuickCreate,
      onCreate,
      onItemPress,
      onItemDelete,
      onOrderUpdated,
    };
  },
});
</script>
