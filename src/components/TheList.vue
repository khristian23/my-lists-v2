<template>
  <div class="full-width">
    <q-banner inline-actions v-if="showHeader">
      <div class="text-h6">{{ headerLabel }}</div>
      <template v-slot:action>
        <q-btn
          flat
          round
          aria-label="expand/collapse"
          color="black"
          :icon="toggleCollapseIcon"
          @click="showCollapseButton = !showCollapseButton"
        />
      </template>
    </q-banner>

    <draggable
      tag="q-list"
      v-model="localItems"
      @end="onDrop"
      v-if="!showCollapseButton"
      handle=".handle"
    >
      <q-item
        v-for="item in localItems"
        :key="item.id"
        clickable
        @click="onItemClick(item.id)"
        class="q-px-sm"
        :data-testid="item.id"
      >
        <q-item-section>
          <div class="row no-wrap">
            <q-btn
              flat
              round
              icon="drag_indicator"
              class="handle"
              size="12px"
            />
            <q-btn
              flat
              round
              aria-label="action"
              color="primary"
              :icon="item.actionIcon || actionIcon"
              size="12px"
              @click.stop="onItemAction(item.id)"
            />
            <div class="column self-center">
              <q-item-label :class="classes">{{ item.name }}</q-item-label>
              <q-item-label
                :class="classes"
                caption
                lines="2"
                v-if="item.description"
                >{{ item.description }}</q-item-label
              >
            </div>
          </div>
        </q-item-section>

        <q-item-section side>
          <div class="column">
            <q-btn
              flat
              round
              aria-label="delete"
              color="primary"
              align="right"
              icon="delete"
              size="10px"
              @click.stop="onItemDelete(item.id)"
              v-if="item.canBeDeleted === undefined || item.canBeDeleted"
            />
            <q-item-label v-if="item.numberOfItems !== undefined"
              >{{ item.numberOfItems }} items</q-item-label
            >
          </div>
        </q-item-section>
      </q-item>
    </draggable>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { ManageableItem, ActionIcon } from '@/models/models';

export default defineComponent({
  name: 'the-list',
  emits: ['order-updated', 'item-press', 'item-action', 'item-delete'],
  components: {
    draggable,
  },
  props: {
    showHeader: {
      type: Boolean,
      default: true,
    },
    headerLabel: String,
    items: {
      required: true,
      type: Array as PropType<Array<ManageableItem>>,
      default: () => [],
    },
    actionIcon: Object as PropType<ActionIcon>,
    scratched: Boolean,
  },
  setup(props, { emit }) {
    const localItems = computed(() => [...props.items]);

    const itemIcon = computed(() => props.actionIcon || 'çreate');

    const classes = computed(() => {
      return 'item-text' + (props.scratched ? ' scratched' : '');
    });

    const showCollapseButton = ref(false);

    const toggleCollapseIcon = computed(() => {
      return showCollapseButton.value ? 'expand_less' : 'expand_more';
    });

    return {
      itemIcon,
      classes,
      toggleCollapseIcon,

      localItems,
      showCollapseButton: false,

      onDrop: () => {
        localItems.value.forEach((item, index) => {
          item.priority = index + 1;
        });

        emit('order-updated', localItems);
      },

      onItemAction: (id: string) => emit('item-action', id),
      onItemClick: (id: string) => emit('item-press', id),
      onItemDelete: (id: string) => emit('item-delete', id),
    };
  },
});
</script>

<style>
.item-text {
  overflow-wrap: anywhere;
}

.scratched {
  text-decoration: line-through;
}
</style>
