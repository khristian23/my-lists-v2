<template>
  <div class="full-width" :data-testid="id">
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
      v-model="localItems"
      tag="div"
      class="q-list"
      @end="onDrop"
      handle=".handle"
      item-key="id"
      v-if="!showCollapseButton"
    >
      <template #item="{ element }">
        <q-item
          clickable
          @click="onItemClick(element.id)"
          class="q-px-sm"
          :data-testid="element.id"
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
                :icon="element.actionIcon || actionIcon"
                size="12px"
                @click.stop="onItemAction(element.id)"
              />
              <div class="column self-center">
                <q-item-label :class="classes">{{ element.name }}</q-item-label>
                <q-item-label
                  :class="classes"
                  caption
                  lines="2"
                  v-if="element.description"
                  >{{ element.description }}</q-item-label
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
                @click.stop="onItemDelete(element.id)"
                v-if="
                  element.canBeDeleted === undefined || element.canBeDeleted
                "
              />
              <q-item-label v-if="element.numberOfItems !== undefined"
                >{{ element.numberOfItems }} items</q-item-label
              >
            </div>
          </q-item-section>
        </q-item>
      </template>
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
    id: String,
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
