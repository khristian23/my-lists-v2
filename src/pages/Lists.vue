<template>
  <q-page class="flex">
    <the-list-loader v-if="isLoadingLists" />
    <the-list
      :items="lists"
      iconAction="{{ $Const.itemActionIcon.edit }}"
      @item-press="onListPress"
      @item-action="onListEdit"
      @item-delete="onListDelete"
      @order-updated="onOrderUpdated"
      v-else-if="!isLoadingLists && lists.length > 0"
    />

    <the-confirmation ref="confirmation">
      Are you sure to delete list '{{ listNameToDelete }}'
    </the-confirmation>

    <the-footer>
      <q-btn unelevated icon="add" @click="onCreate">Create</q-btn>
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGlobals } from '@/composables/useGlobals';
import Constants from '@/util/constants';
import { useLists } from '@/composables/useLists';
import List from 'models/list';

export default defineComponent({
  name: 'lists-page',
  emits: [Constants.events.showError, Constants.events.showToast],
  setup(_, { emit }) {
    const confirmation = ref();
    const filterBy = ref('');
    const listNameToDelete = ref('');
    const lists = ref<Array<List>>([]);

    const route = useRoute();
    const router = useRouter();
    const { setTitle } = useGlobals();
    const {
      isLoadingLists,
      getListsByType,
      updateListsPriorities,
      deleteListById,
    } = useLists();

    onMounted(async () => {
      setTitle('All Lists');
      lists.value = await getListsByType();
    });

    watch(
      () => route.query?.type,
      (filterRequest) => {
        filterBy.value = filterRequest as string;
        updatePageTitleFromFilter(filterBy.value);
      }
    );

    const updatePageTitleFromFilter = (type: string) => {
      const getListTypeLabel = () => {
        return (
          Constants.lists.types.find(({ value }) => value === type)?.label ?? ''
        );
      };

      if (type) {
        const title = getListTypeLabel();
        setTitle(`${title}s`);
      }
    };

    const getListById = (id: string) => {
      return lists.value.find((list) => list.id === id);
    };

    const onListPress = (listId: string) => {
      const list = getListById(listId);

      if (!list) {
        emit(Constants.events.showError, 'No list found');
        return;
      }

      let routeName = Constants.routes.listItems;
      if (list.type === Constants.listType.checklist) {
        routeName = Constants.routes.checklist;
      } else if (list.type === Constants.listType.note) {
        routeName = Constants.routes.note;
      }

      router.push({ name: routeName, params: { id: listId } });
    };

    const onListDelete = async (listId: string) => {
      const list = getListById(listId);
      if (!list) {
        return;
      }

      if (confirmation.value) {
        listNameToDelete.value = list.name;
        const confirmationAnswer = await confirmation.value.showDialog();

        if (confirmationAnswer) {
          try {
            await deleteListById(listId);
            emit(Constants.events.showToast, 'List deleted');
          } catch (e: unknown) {
            emit(Constants.events.showError, (e as Error).message);
          }
        }
      }
    };

    const onListEdit = (listId: string) => {
      router.push({
        name: Constants.routes.list,
        params: { id: listId },
      });
    };

    const onCreate = () => {
      router.push({
        name: Constants.routes.list,
        params: { id: 'new' },
      });
    };

    const onOrderUpdated = (listsToUpdate: Array<List>): void => {
      updateListsPriorities(listsToUpdate).catch((error) =>
        emit(Constants.events.showError, error.message)
      );
    };

    return {
      lists,
      isLoadingLists,
      confirmation,
      listNameToDelete,
      onCreate,
      onListPress,
      onListEdit,
      onListDelete,
      onOrderUpdated,
    };
  },
});
</script>
