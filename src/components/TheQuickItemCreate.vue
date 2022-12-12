<template>
  <q-input
    v-model="newItem"
    ref="quickCreateInput"
    bg-color="white"
    outlined
    rounded
    placeholder="Quick create"
    dense
    class="full-width"
    @focus="showCreateButton = false"
    @blur="onQuickCreateBlur"
    @keyup="onQuickCreateKeyup"
  >
    <template v-slot:after>
      <q-btn
        round
        dense
        flat
        @click="onCreate"
        color="white"
        icon="add"
        label="Create"
        v-if="showCreateButton"
      />
    </template>
  </q-input>
</template>

<script lang="ts">
import { QInput } from 'quasar';
import { defineComponent, ref } from 'vue';

const ENTER_KEY = 'Enter';

export default defineComponent({
  name: 'the-quick-create',
  emits: ['quick-create', 'create'],
  setup(_, { emit }) {
    const newItem = ref('');
    const showCreateButton = ref(true);
    const quickCreateInput = ref<InstanceType<typeof QInput>>();

    const onQuickCreateBlur = () => {
      if (!newItem.value) {
        showCreateButton.value = true;
      }
    };

    const onQuickCreateKeyup = (event: KeyboardEvent) => {
      if (event.key === ENTER_KEY) {
        event.preventDefault();

        emit('quick-create', newItem.value);

        newItem.value = '';

        if (quickCreateInput.value) {
          quickCreateInput.value.focus();
        }
      }
    };

    const onCreate = () => emit('create');

    return {
      newItem,
      quickCreateInput,
      showCreateButton,
      onQuickCreateBlur,
      onQuickCreateKeyup,
      onCreate,
    };
  },
});
</script>
