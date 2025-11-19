<!--
   - verinice.veo web
   - Copyright (C) 2024 Aziz Khalledi
   - 
   - This program is free software: you can redistribute it and/or modify it
   - under the terms of the GNU Affero General Public License
   - as published by the Free Software Foundation, either version 3 of the License,
   - or (at your option) any later version.
   - 
   - This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
   - without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
   - See the GNU Affero General Public License for more details.
   - 
   - You should have received a copy of the GNU Affero General Public License along with this program.
   - If not, see <http://www.gnu.org/licenses/>.
-->
<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div @click.prevent="handleClick" v-html="sanitizedContent" />
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify';

const props = defineProps<{
  content: string;
  clickHandler?: (...params: [...any[]]) => void;
  clickHandlerParams?: [...any[]];
}>();

const sanitizedContent = ref('');

watch(
  () => props.content,
  (newContent) => {
    sanitizedContent.value = DOMPurify.sanitize(newContent);
  },
  { immediate: true }
);

const handleClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target && target.closest('a')) {
    event.preventDefault();
    props.clickHandler?.(...(props.clickHandlerParams || []));
  }
};
</script>
