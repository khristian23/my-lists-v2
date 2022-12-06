<template>
  <q-page class="flex">
    <the-list
      id="pendingList"
      headerLabel="Pending"
      :items="list.pendingItems"
      iconAction="{{ $Const.itemActionIcon.done }}"
      @itemPress="onItemPress"
      @itemAction="onSetItemToDone"
      @itemDelete="onItemDelete"
      v-if="list.hasPendingItems"
      @orderUpdated="onOrderUpdated"
    />
    <the-list
      id="doneList"
      headerLabel="Done"
      :items="list.doneItems"
      iconAction="{{ $Const.itemActionIcon.redo }}"
      class="self-end"
      @itemPress="onItemPress"
      @itemAction="onSetItemToPending"
      @itemDelete="onItemDelete"
      v-if="list.hasDoneItems"
      :scratched="true"
    />
    <the-footer>
      <the-quick-item-create @quickCreate="onQuickCreate" @create="onCreate" />
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import { useListItems } from '@/composables/useListItems';
import { defineComponent, ref, onMounted } from 'vue';
import { useGlobals } from '@/composables/useGlobals';
import { useRouter } from 'vue-router';
import constants from '@/util/constants';

export default defineComponent({
  name: 'list-items-page',
  props: ['id'],
  emits: [constants.events.showError],
  setup(props, { emit }) {
    const {
      getCurrentListWithItems,
      loadListWithItems,
      setItemToDone,
      setItemToPending,
      deleteListItem,
      quickCreateListItem,
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

    const onSetItemToDone = async (listItemId: string) => {
      try {
        await setItemToDone(list.value.id, listItemId);
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    const onSetItemToPending = async (listItemId: string) => {
      try {
        await setItemToPending(list.value.id, listItemId);
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

    return {
      list,
      newItem,
      showCreateButton,
      onSetItemToDone,
      onSetItemToPending,
      onQuickCreate,
      onCreate: () => {
        /* todo */
      },
      onItemPress,
      onItemDelete,
      onOrderUpdated: () => {
        /* todo */
      },
    };
  },

  //   onCreate() {
  //     this.$router.push({
  //       name: this.$Const.routes.listItem,
  //       params: { list: this.list.id, id: 'new' },
  //     });
  //   },

  //   async onOrderUpdated(listItems) {
  //     try {
  //       await this.updateItemsOrder({ listId: this.list.id, listItems });
  //     } catch (e) {
  //       this.$emit('showError', e.message);
  //     }
  //   },
});
</script>
