<template>
  <q-page class="flex">
    <q-editor
      :model-value="note.noteContent"
      class="full-width editor-height"
      :data-testid="note.id"
      @update:model-value="onContentUpdate"
    />
    <the-footer>
      <the-favorite-button @click="onFavorite" :favorite="note.isFavorite" />
      <q-btn unelevated no-caps icon="save" @click="onSave" label="Save" />
    </the-footer>
  </q-page>
</template>

<script lang="ts">
import Note from '@/models/note';
import { defineComponent, onMounted, ref, Ref, inject, watch } from 'vue';
import { useListables } from '@/composables/useListables';
import { useGlobals } from '@/composables/useGlobals';
import constants from '@/util/constants';
import { INote } from '@/models/models';
import { useFavorites } from '@/composables/useFavorites';

export default defineComponent({
  name: 'notes-page',
  props: ['id'],
  setup(props, { emit }) {
    const { getListableById, saveNoteContent } = useListables();
    const { setTitle } = useGlobals();
    const { handleFavorite } = useFavorites();

    let originalContent = '';
    let saveTimer: number;
    const saveTimeout = inject('saveDelay') ?? constants.notes.autoSaveDelay;

    const note: Ref<INote> = ref(new Note({}));

    const loadContents = async () => {
      note.value = (await getListableById(props.id)) as INote;
      setTitle(note.value.name);
      originalContent = note.value.noteContent;
    };

    onMounted(loadContents);

    watch(() => props.id, loadContents);

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

    const onFavorite = async () => {
      try {
        await handleFavorite(note.value.id);
        console.log(note.value.isFavorite);
      } catch (e: unknown) {
        emit(constants.events.showError, (e as Error).message);
      }
    };

    return {
      note,
      onSave,
      onContentUpdate,
      onFavorite,
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
