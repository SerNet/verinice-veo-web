<template>
  <v-menu :close-on-content-click="false" origin="overlap">
    <template #activator="{ props }">
      <slot name="default" v-bind="{ props }"></slot>
    </template>
    <template #default>
      <v-card>
        <v-card-text class="py-0">
          <slot name="input"></slot>
        </v-card-text>
      </v-card>
    </template>
  </v-menu>
</template>

<script setup lang="ts"></script>
