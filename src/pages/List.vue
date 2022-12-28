<template>
  <q-page class="flex">
    <q-form class="full-width q-pa-md" ref="myForm">
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
import List from '@/models/list';
import constants from '@/util/constants';
import { ListTypeOption, ListSubTypeOption } from '@/models/models';
import { useGlobals } from '@/composables/useGlobals';
import { useLists } from '@/composables/useLists';
import { useUser } from '@/composables/useUser';
import User from '@/models/user';

export default defineComponent({
  name: 'list-page',
  props: ['id'],
  setup(props) {
    const list = ref<List>(new List({}));
    const selectedType = ref<ListTypeOption>();
    const selectedSubType = ref<ListSubTypeOption | null>();
    const shareableUsers = ref<Array<User>>();
    const { setTitle } = useGlobals();
    const { getListById, createNewList } = useLists();
    const { getUsersList } = useUser();

    const editMode = props.id != 'new';
    const disable = computed(() => list.value?.isShared);
    const listTypeOptions = ref(constants.lists.types);

    onMounted(async () => {
      if (!editMode) {
        list.value = createNewList();
      } else {
        list.value = await getListById(props.id);
      }

      setTypeAndSubType();
      loadShareableUsers();
    });

    const setTypeAndSubType = () => {
      selectedType.value = listTypeOptions.value.find(
        ({ value }) => list.value.type === value
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

    return {
      list,
      selectedType,
      selectedSubType,
      disable,
      listTypeOptions,
      onTypeSelection,
      shareableUsers,
      onSave: () => true,
    };
  },

  //

  //   async onSave() {
  //     const isValid = await this.$refs.myForm.validate();
  //     if (!isValid) {
  //       return;
  //     }

  //     this.list.type = this.selectedType.value;
  //     if (this.selectedSubType) {
  //       this.list.subtype = this.selectedSubType.value;
  //     }

  //     this.list.modifiedAt = new Date().getTime();
  //     if (this.list.id) {
  //       this.list.syncStatus = this.$Const.changeStatus.changed;
  //     } else {
  //       this.list.syncStatus = this.$Const.changeStatus.new;
  //     }

  //     if (this.list.sharedWith.length) {
  //       this.list.isShared = true;
  //     } else {
  //       this.list.isShared = false;
  //     }

  //     try {
  //       await this.saveList(this.list);
  //       this.$emit('showToast', 'List saved');
  //       this.$router.push({ name: this.$Const.routes.lists.name });
  //     } catch (e) {
  //       this.$emit('showError', e.message);
  //     }
  //   },
  // },
});
</script>
