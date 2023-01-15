<template>
  <q-page class="flex">
    <the-list-loader v-if="isLoadingLists" />
    <the-list
      :showHeader="false"
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
import { useRouter } from 'vue-router';
import { useGlobals } from '@/composables/useGlobals';
import Constants from '@/util/constants';
import { useListables } from '@/composables/useListables';
import List from 'models/list';
import { IList, Listable } from '@/models/models';

export default defineComponent({
  name: 'lists-page',
  props: ['type'],
  emits: [Constants.events.showError, Constants.events.showToast],
  setup(props, { emit }) {
    const confirmation = ref();
    const listNameToDelete = ref('');
    const lists = ref<Array<Listable>>([]);

    const router = useRouter();
    const { setTitle } = useGlobals();
    const {
      isLoadingLists,
      getListsByType,
      updateListsPriorities,
      deleteListById,
    } = useListables();

    const loadListsByType = async (type?: string) => {
      lists.value = (await getListsByType(type)) as IList[];
      if (!type) {
        setTitle('All Lists');
      } else {
        updatePageTitleFromFilter(type);
      }
    };

    onMounted(async () => {
      await loadListsByType(props.type);
    });

    watch(
      () => props.type,
      async (filterRequest) => {
        await loadListsByType(filterRequest as string);
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

      let routeName = Constants.routes.listItems.name;

      if (list.type === Constants.listType.note) {
        routeName = Constants.routes.note.name;
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
        name: Constants.routes.list.name,
        params: { id: listId },
      });
    };

    const onCreate = () => {
      const route: { [k: string]: string | object } = {
        path: '/list/new',
      };

      if (props.type) {
        route.query = { type: props.type };
      }
      router.push(route);
    };

    const onOrderUpdated = (listsToUpdate: Array<List>): void => {
      lists.value = listsToUpdate;

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
