<template>
  <q-page class="flex">
    <q-editor
      :model-value="note.noteContent"
      class="full-width editor-height"
      :data-testid="note.id"
      @update:model-value="onContentUpdate"
    />
    <the-footer>
      <q-btn unelevated icon="save" @click="onSave" label="Save" />
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import Note from '@/models/note';
import { defineComponent, onMounted, ref, Ref, inject, nextTick } from 'vue';
import { useListables } from '@/composables/useListables';
import { useGlobals } from '@/composables/useGlobals';
import constants from '@/util/constants';
import { INote } from '@/models/models';

export default defineComponent({
  name: 'notes-page',
  props: ['id'],
  setup(props, { emit }) {
    const { getListById, saveNoteContent } = useListables();
    const { setTitle } = useGlobals();
    let originalContent = '';
    let saveTimer: number;
    const saveTimeout = inject('saveDelay') ?? constants.notes.autoSaveDelay;

    const note: Ref<INote> = ref(new Note({}));

    onMounted(async () => {
      note.value = (await getListById(props.id)) as INote;
      setTitle(note.value.name);
      originalContent = note.value.noteContent;
    });

    const onSave = async () => {
      try {
        clearTimeout(saveTimer);
        saveTimer = 0;

        await saveNoteContent(note.value);
        originalContent = note.value.noteContent;
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    const onContentUpdate = (newNoteContent: string) => {
      clearTimeout(saveTimer);

      note.value.noteContent = newNoteContent;

      saveTimer = setTimeout(() => {
        if (originalContent !== note.value.noteContent) {
          onSave();
        }
      }, saveTimeout as number) as unknown as number;
    };

    return {
      note,
      onSave,
      onContentUpdate,
    };
  },
});
</script>

<style>
.editor-height > div[contenteditable] {
  min-height: 60% !important;
  height: calc(100vh - 137px);
}
</style>
